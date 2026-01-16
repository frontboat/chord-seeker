import type { ChordQuality, GuitarString, IntervalSymbol, NoteId } from '../types/music'
import type { ChordProgression } from '../types/progression'
import type { ChordRiff, ProgressionRiff, RiffNote, RiffStyle } from '../types/songBuilder'
import { GUITAR_STRINGS, INDEX_TO_NOTE, NOTE_TO_INDEX, STRING_TUNINGS } from '../data/notes'
import { SCALES } from '../data/scales'
import { QUALITY_MAP } from '../data/chordQualities'
import { transposeProgression, calculateNoteFromInterval, getBestScaleForChord } from './scaleUtils'

// Rhythmic patterns for different styles (values are beat positions)
const MELODIC_PATTERNS = [
  [0, 1, 2, 3], // Quarter notes
  [0, 0.5, 1, 2, 2.5, 3], // Mix of eighths and quarters
  [0, 1, 1.5, 2, 3, 3.5], // Syncopated
  [0, 0.5, 1, 1.5, 2, 3], // Running start
]

const ARPEGGIATED_PATTERNS = [
  [0, 0.5, 1, 1.5, 2, 2.5, 3, 3.5], // Straight eighths
  [0, 1, 2, 3, 2, 1], // Up and down
  [0, 0.5, 1, 2, 2.5, 3], // Triplet feel
]

const BASS_PATTERNS = [
  [0, 2], // Half notes on root
  [0, 1, 2, 3], // Walking bass
  [0, 0.5, 2, 2.5], // Pumping eighths
  [0, 2, 2.5, 3], // Root with fills
]

/**
 * Find playable position for a note on preferred strings within fret range
 */
export function findNotePosition(
  targetNote: NoteId,
  preferredStrings: GuitarString[],
  fretRange: { min: number; max: number }
): { string: GuitarString; fret: number } | null {
  const targetIndex = NOTE_TO_INDEX[targetNote]

  for (const stringId of preferredStrings) {
    const tuning = STRING_TUNINGS[stringId]
    // Find fret that produces this note
    for (let fret = fretRange.min; fret <= fretRange.max; fret++) {
      const noteIndex = (tuning.index + fret) % 12
      if (noteIndex === targetIndex) {
        return { string: stringId, fret }
      }
    }
  }

  // Fallback: try all strings
  for (const stringId of GUITAR_STRINGS) {
    const tuning = STRING_TUNINGS[stringId]
    for (let fret = fretRange.min; fret <= fretRange.max; fret++) {
      const noteIndex = (tuning.index + fret) % 12
      if (noteIndex === targetIndex) {
        return { string: stringId, fret }
      }
    }
  }

  return null
}

/**
 * Get chord tones for a given root and quality
 */
function getChordTones(root: NoteId, quality: ChordQuality): NoteId[] {
  const qualityDef = QUALITY_MAP[quality]
  if (!qualityDef) return [root]

  return qualityDef.intervals.map((interval) => calculateNoteFromInterval(root, interval))
}

/**
 * Get scale notes for a chord
 */
function getScaleNotes(root: NoteId, quality: ChordQuality): NoteId[] {
  const scaleList = Object.values(SCALES)
  const scale = getBestScaleForChord(quality, scaleList)

  if (!scale) {
    // Fallback to chord tones
    return getChordTones(root, quality)
  }

  return scale.intervals.map((interval) => calculateNoteFromInterval(root, interval))
}

/**
 * Generate a riff for a single chord
 */
export function generateChordRiff(
  chordRoot: NoteId,
  chordQuality: ChordQuality,
  chordDegree: string,
  nextChordRoot: NoteId | null,
  style: RiffStyle,
  beatsPerChord: number = 4
): ChordRiff {
  const chordTones = getChordTones(chordRoot, chordQuality)
  const scaleTones = getScaleNotes(chordRoot, chordQuality)
  const notes: RiffNote[] = []

  // Select pattern and strings based on style
  let pattern: number[]
  let preferredStrings: GuitarString[]
  let fretRange: { min: number; max: number }

  switch (style) {
    case 'melodic':
      pattern = MELODIC_PATTERNS[Math.floor(Math.random() * MELODIC_PATTERNS.length)]
      preferredStrings = [1, 2, 3] // High strings for melody
      fretRange = { min: 0, max: 12 }
      break
    case 'arpeggiated':
      pattern = ARPEGGIATED_PATTERNS[Math.floor(Math.random() * ARPEGGIATED_PATTERNS.length)]
      preferredStrings = [1, 2, 3, 4] // Mid to high strings
      fretRange = { min: 0, max: 7 }
      break
    case 'bass-driven':
      pattern = BASS_PATTERNS[Math.floor(Math.random() * BASS_PATTERNS.length)]
      preferredStrings = [6, 5, 4] // Low strings
      fretRange = { min: 0, max: 5 }
      break
  }

  // Generate notes for each beat in the pattern
  pattern.forEach((beatPosition, index) => {
    if (beatPosition >= beatsPerChord) return

    let targetNote: NoteId
    let interval: IntervalSymbol | undefined

    // Determine which note to use based on position
    const isStrongBeat = beatPosition === 0 || beatPosition === 2
    const isLastBeat = beatPosition >= 3

    if (style === 'arpeggiated') {
      // Cycle through chord tones
      const toneIndex = index % chordTones.length
      targetNote = chordTones[toneIndex]
      interval = QUALITY_MAP[chordQuality]?.intervals[toneIndex]
    } else if (style === 'bass-driven') {
      // Mostly root with occasional fifth
      if (isStrongBeat) {
        targetNote = chordRoot
        interval = 'R'
      } else {
        // Use fifth or other chord tone
        targetNote = chordTones.length > 2 ? chordTones[2] : chordTones[0]
        interval = '5'
      }
    } else {
      // Melodic style
      if (isStrongBeat) {
        // Use chord tones on strong beats
        const toneIndex = Math.floor(Math.random() * chordTones.length)
        targetNote = chordTones[toneIndex]
        interval = QUALITY_MAP[chordQuality]?.intervals[toneIndex]
      } else if (isLastBeat && nextChordRoot) {
        // Approach note to next chord
        const nextRootIndex = NOTE_TO_INDEX[nextChordRoot]
        const approachIndex = (nextRootIndex - 1 + 12) % 12
        targetNote = INDEX_TO_NOTE[approachIndex]
      } else {
        // Use scale tones
        const toneIndex = Math.floor(Math.random() * scaleTones.length)
        targetNote = scaleTones[toneIndex]
      }
    }

    // Find position on fretboard
    const position = findNotePosition(targetNote, preferredStrings, fretRange)
    if (position) {
      const duration = index < pattern.length - 1 ? pattern[index + 1] - beatPosition : beatsPerChord - beatPosition

      notes.push({
        id: `${chordDegree}-${index}`,
        string: position.string,
        fret: position.fret,
        duration: Math.min(duration, 1),
        startBeat: beatPosition,
        note: targetNote,
        interval
      })
    }
  })

  return {
    chordRoot,
    chordQuality,
    chordDegree,
    notes,
    totalBeats: beatsPerChord
  }
}

/**
 * Generate a full riff for an entire chord progression
 */
export function generateProgressionRiff(
  progression: ChordProgression,
  rootNote: NoteId,
  style: RiffStyle,
  bpm: number
): ProgressionRiff {
  const transposed = transposeProgression(progression, rootNote)
  const chordRiffs: ChordRiff[] = []

  transposed.forEach((chord, index) => {
    const nextChord = transposed[index + 1] || transposed[0] // Loop back for approach notes
    const riff = generateChordRiff(
      chord.note,
      chord.quality,
      chord.degree,
      nextChord.note,
      style
    )
    chordRiffs.push(riff)
  })

  return {
    id: `riff-${Date.now()}`,
    chordRiffs,
    bpm,
    style
  }
}

/**
 * Get available notes at a position for editing
 */
export function getAvailableNotesAtPosition(
  chordRoot: NoteId,
  chordQuality: ChordQuality,
  stringId: GuitarString,
  fretRange: { min: number; max: number } = { min: 0, max: 12 }
): Array<{ note: NoteId; fret: number; interval?: IntervalSymbol }> {
  const scaleTones = getScaleNotes(chordRoot, chordQuality)
  const chordTones = getChordTones(chordRoot, chordQuality)
  const qualityDef = QUALITY_MAP[chordQuality]
  const tuning = STRING_TUNINGS[stringId]
  const available: Array<{ note: NoteId; fret: number; interval?: IntervalSymbol }> = []

  for (let fret = fretRange.min; fret <= fretRange.max; fret++) {
    const noteIndex = (tuning.index + fret) % 12
    const note = INDEX_TO_NOTE[noteIndex]

    if (scaleTones.includes(note)) {
      // Find interval if it's a chord tone
      const chordToneIndex = chordTones.indexOf(note)
      const interval = chordToneIndex >= 0 ? qualityDef?.intervals[chordToneIndex] : undefined

      available.push({ note, fret, interval })
    }
  }

  return available
}

/**
 * Update a single note in a riff
 */
export function updateRiffNote(
  riff: ProgressionRiff,
  measureIndex: number,
  noteId: string,
  newString: GuitarString,
  newFret: number,
  newNote: NoteId
): ProgressionRiff {
  const newChordRiffs = [...riff.chordRiffs]
  const chordRiff = { ...newChordRiffs[measureIndex] }

  chordRiff.notes = chordRiff.notes.map((note) => {
    if (note.id === noteId) {
      return { ...note, string: newString, fret: newFret, note: newNote }
    }
    return note
  })

  newChordRiffs[measureIndex] = chordRiff

  return { ...riff, chordRiffs: newChordRiffs }
}

/**
 * Add a note to a riff at a specific position
 */
export function addRiffNote(
  riff: ProgressionRiff,
  measureIndex: number,
  stringId: GuitarString,
  fret: number,
  startBeat: number,
  note: NoteId
): ProgressionRiff {
  const newChordRiffs = [...riff.chordRiffs]
  const chordRiff = { ...newChordRiffs[measureIndex] }

  const newNote: RiffNote = {
    id: `${chordRiff.chordDegree}-${Date.now()}`,
    string: stringId,
    fret,
    duration: 0.5,
    startBeat,
    note
  }

  chordRiff.notes = [...chordRiff.notes, newNote].sort((a, b) => a.startBeat - b.startBeat)
  newChordRiffs[measureIndex] = chordRiff

  return { ...riff, chordRiffs: newChordRiffs }
}

/**
 * Remove a note from a riff
 */
export function removeRiffNote(
  riff: ProgressionRiff,
  measureIndex: number,
  noteId: string
): ProgressionRiff {
  const newChordRiffs = [...riff.chordRiffs]
  const chordRiff = { ...newChordRiffs[measureIndex] }

  chordRiff.notes = chordRiff.notes.filter((note) => note.id !== noteId)
  newChordRiffs[measureIndex] = chordRiff

  return { ...riff, chordRiffs: newChordRiffs }
}
