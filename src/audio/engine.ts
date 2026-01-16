import { GUITAR_STRINGS, STRING_TUNINGS } from '../data/notes'
import type { GuitarString } from '../types/music'

export interface NoteToPlay {
  string: GuitarString
  fret: number
}

const midiToFrequency = (midi: number) => 440 * Math.pow(2, (midi - 69) / 12)

export class ChordAudioEngine {
  private ctx: AudioContext | null = null
  private activeNodes: Array<{ osc: OscillatorNode; gain: GainNode }> = []

  private ensureContext() {
    if (!this.ctx) {
      this.ctx = new AudioContext()
    }
    return this.ctx
  }

  play(notes: NoteToPlay[]) {
    if (!notes.length) {
      return
    }
    const ctx = this.ensureContext()
    this.stop()
    const startTime = ctx.currentTime + 0.05
    notes.forEach((note, index) => {
      const tuning = STRING_TUNINGS[note.string]
      const midiValue = tuning.midi + note.fret
      const freq = midiToFrequency(midiValue)
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.type = 'triangle'
      const strikeTime = startTime + index * 0.035
      osc.frequency.setValueAtTime(freq, strikeTime)
      gain.gain.setValueAtTime(0.0001, strikeTime)
      gain.gain.linearRampToValueAtTime(0.5, strikeTime + 0.015)
      gain.gain.exponentialRampToValueAtTime(0.0001, strikeTime + 1.8)
      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.start(strikeTime)
      osc.stop(strikeTime + 2)
      this.activeNodes.push({ osc, gain })
    })
  }

  stop() {
    if (!this.ctx || !this.activeNodes.length) {
      return
    }
    const now = this.ctx.currentTime
    this.activeNodes.forEach(({ osc, gain }) => {
      gain.gain.cancelScheduledValues(now)
      gain.gain.linearRampToValueAtTime(0.0001, now + 0.05)
      osc.stop(now + 0.1)
    })
    this.activeNodes = []
  }
}

export function orderNotesForStrum(notes: NoteToPlay[]) {
  return [...notes].sort((a, b) => GUITAR_STRINGS.indexOf(a.string) - GUITAR_STRINGS.indexOf(b.string))
}
