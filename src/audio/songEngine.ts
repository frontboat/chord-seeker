import { STRING_TUNINGS } from '../data/notes'
import type { GuitarString, NoteId, ChordQuality } from '../types/music'
import type { RuntimeChordShape } from '../types/music'
import type { ProgressionRiff, TabSheet } from '../types/songBuilder'
import { buildChordShapes } from '../utils/chordUtils'
import { orderNotesForStrum } from './engine'

export interface NoteToPlay {
  string: GuitarString
  fret: number
}

interface ScheduledEvent {
  type: 'chord' | 'riff'
  time: number
  notes: NoteToPlay[]
  duration: number
}

const midiToFrequency = (midi: number) => 440 * Math.pow(2, (midi - 69) / 12)

export class SongAudioEngine {
  private ctx: AudioContext | null = null
  private chordGain: GainNode | null = null
  private riffGain: GainNode | null = null
  private activeNodes: Array<{ osc: OscillatorNode; gain: GainNode }> = []
  private scheduledEvents: ScheduledEvent[] = []
  private isPlaying = false
  private startTime = 0
  private pauseTime = 0
  private animationFrameId: number | null = null
  private onBeatCallback: ((measure: number, subdivision: number) => void) | null = null

  private ensureContext() {
    if (!this.ctx) {
      this.ctx = new AudioContext()
      // Create separate gain nodes for chords and riff
      this.chordGain = this.ctx.createGain()
      this.chordGain.gain.value = 0.3 // Quieter for backing
      this.chordGain.connect(this.ctx.destination)

      this.riffGain = this.ctx.createGain()
      this.riffGain.gain.value = 0.6 // Louder for melody
      this.riffGain.connect(this.ctx.destination)
    }
    return this.ctx
  }

  /**
   * Schedule a chord to play at a specific time
   */
  private scheduleChord(notes: NoteToPlay[], startTime: number, duration: number) {
    const ctx = this.ensureContext()
    if (!this.chordGain) return

    const orderedNotes = orderNotesForStrum(notes)

    orderedNotes.forEach((note, index) => {
      const tuning = STRING_TUNINGS[note.string]
      const midiValue = tuning.midi + note.fret
      const freq = midiToFrequency(midiValue)

      const osc = ctx.createOscillator()
      const gain = ctx.createGain()

      osc.type = 'triangle'
      const strikeTime = startTime + index * 0.025 // Slightly faster strum

      osc.frequency.setValueAtTime(freq, strikeTime)
      gain.gain.setValueAtTime(0.0001, strikeTime)
      gain.gain.linearRampToValueAtTime(0.4, strikeTime + 0.01)
      gain.gain.exponentialRampToValueAtTime(0.0001, strikeTime + Math.min(duration, 1.5))

      osc.connect(gain)
      gain.connect(this.chordGain!)

      osc.start(strikeTime)
      osc.stop(strikeTime + duration + 0.1)

      this.activeNodes.push({ osc, gain })
    })
  }

  /**
   * Schedule a single riff note to play at a specific time
   */
  private scheduleRiffNote(note: NoteToPlay, startTime: number, duration: number) {
    const ctx = this.ensureContext()
    if (!this.riffGain) return

    const tuning = STRING_TUNINGS[note.string]
    const midiValue = tuning.midi + note.fret
    const freq = midiToFrequency(midiValue)

    const osc = ctx.createOscillator()
    const gain = ctx.createGain()

    osc.type = 'triangle'

    osc.frequency.setValueAtTime(freq, startTime)
    gain.gain.setValueAtTime(0.0001, startTime)
    gain.gain.linearRampToValueAtTime(0.6, startTime + 0.008)
    gain.gain.exponentialRampToValueAtTime(0.0001, startTime + Math.min(duration, 0.8))

    osc.connect(gain)
    gain.connect(this.riffGain!)

    osc.start(startTime)
    osc.stop(startTime + duration + 0.1)

    this.activeNodes.push({ osc, gain })
  }

  /**
   * Build schedule from progression riff and chord shapes
   */
  scheduleProgression(riff: ProgressionRiff, _tabSheet: TabSheet): void {
    this.scheduledEvents = []
    this.ensureContext()

    const beatsPerSecond = riff.bpm / 60
    const secondsPerBeat = 1 / beatsPerSecond
    const secondsPerMeasure = 4 * secondsPerBeat // Assuming 4/4 time

    let currentTime = 0

    riff.chordRiffs.forEach((chordRiff) => {
      // Schedule chord strum at the beginning of each measure
      const chordShape = this.getChordShape(chordRiff.chordRoot, chordRiff.chordQuality)
      if (chordShape) {
        this.scheduledEvents.push({
          type: 'chord',
          time: currentTime,
          notes: chordShape.notesForAudio,
          duration: secondsPerMeasure
        })
      }

      // Schedule each riff note
      chordRiff.notes.forEach((note) => {
        const noteTime = currentTime + note.startBeat * secondsPerBeat
        const noteDuration = note.duration * secondsPerBeat

        this.scheduledEvents.push({
          type: 'riff',
          time: noteTime,
          notes: [{ string: note.string, fret: note.fret }],
          duration: noteDuration
        })
      })

      currentTime += secondsPerMeasure
    })
  }

  /**
   * Get a chord shape for a given root and quality
   */
  private getChordShape(root: NoteId, quality: ChordQuality): RuntimeChordShape | null {
    const shapes = buildChordShapes(root, quality)
    // Return the first shape (usually the most common voicing)
    return shapes[0] || null
  }

  /**
   * Set callback for beat updates
   */
  onBeat(callback: (measure: number, subdivision: number) => void) {
    this.onBeatCallback = callback
  }

  /**
   * Start playback
   */
  play(riff: ProgressionRiff, tabSheet: TabSheet): void {
    const ctx = this.ensureContext()

    if (this.isPlaying) {
      this.pause()
    }

    this.scheduleProgression(riff, tabSheet)

    const playbackOffset = this.pauseTime
    this.startTime = ctx.currentTime - playbackOffset
    this.isPlaying = true

    // Schedule all events
    this.scheduledEvents.forEach((event) => {
      const eventTime = this.startTime + event.time

      if (eventTime >= ctx.currentTime) {
        if (event.type === 'chord') {
          this.scheduleChord(event.notes, eventTime, event.duration)
        } else {
          event.notes.forEach((note) => {
            this.scheduleRiffNote(note, eventTime, event.duration)
          })
        }
      }
    })

    // Start beat tracking
    this.startBeatTracking(riff.bpm, tabSheet)
  }

  /**
   * Start tracking beats for UI updates
   */
  private startBeatTracking(bpm: number, tabSheet: TabSheet) {
    if (!this.ctx || !this.onBeatCallback) return

    const beatsPerSecond = bpm / 60
    const subdivisions = tabSheet.measures[0]?.subdivisions || 8
    const subdivisionsPerSecond = (beatsPerSecond * subdivisions) / 4
    const totalMeasures = tabSheet.measures.length

    const update = () => {
      if (!this.isPlaying || !this.ctx) return

      const elapsed = this.ctx.currentTime - this.startTime
      const totalSubdivisions = elapsed * subdivisionsPerSecond
      const subdivisionIndex = Math.floor(totalSubdivisions) % subdivisions
      const measureIndex = Math.floor(totalSubdivisions / subdivisions) % totalMeasures

      this.onBeatCallback?.(measureIndex, subdivisionIndex)

      this.animationFrameId = requestAnimationFrame(update)
    }

    update()
  }

  /**
   * Pause playback
   */
  pause(): void {
    if (!this.ctx || !this.isPlaying) return

    this.pauseTime = this.ctx.currentTime - this.startTime
    this.isPlaying = false

    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId)
      this.animationFrameId = null
    }

    // Stop all active nodes
    const now = this.ctx.currentTime
    this.activeNodes.forEach(({ osc, gain }) => {
      gain.gain.cancelScheduledValues(now)
      gain.gain.linearRampToValueAtTime(0.0001, now + 0.05)
      osc.stop(now + 0.1)
    })
    this.activeNodes = []
  }

  /**
   * Stop playback completely
   */
  stop(): void {
    this.pause()
    this.pauseTime = 0
    this.scheduledEvents = []
  }

  /**
   * Check if currently playing
   */
  getIsPlaying(): boolean {
    return this.isPlaying
  }

  /**
   * Get current playback time
   */
  getCurrentTime(): number {
    if (!this.ctx) return 0
    if (this.isPlaying) {
      return this.ctx.currentTime - this.startTime
    }
    return this.pauseTime
  }

  /**
   * Play a single chord (for preview)
   */
  playChord(notes: NoteToPlay[]): void {
    const ctx = this.ensureContext()

    // Stop any active notes
    const now = ctx.currentTime
    this.activeNodes.forEach(({ osc, gain }) => {
      gain.gain.cancelScheduledValues(now)
      gain.gain.linearRampToValueAtTime(0.0001, now + 0.05)
      osc.stop(now + 0.1)
    })
    this.activeNodes = []

    this.scheduleChord(notes, now + 0.05, 1.5)
  }

  /**
   * Play a single note (for preview)
   */
  playNote(note: NoteToPlay): void {
    const ctx = this.ensureContext()
    this.scheduleRiffNote(note, ctx.currentTime + 0.02, 0.5)
  }
}
