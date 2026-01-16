import type { ChordQuality, GuitarString, IntervalSymbol, NoteId } from './music'
import type { AnimationSpeed, ChordProgression } from './progression'

// Riff style options
export type RiffStyle = 'melodic' | 'arpeggiated' | 'bass-driven'

// A single note in a riff
export interface RiffNote {
  id: string
  string: GuitarString
  fret: number
  duration: number // in beats (0.25 = sixteenth, 0.5 = eighth, 1 = quarter)
  startBeat: number // when this note starts within the measure
  note: NoteId
  interval?: IntervalSymbol
}

// A riff pattern for one chord/measure
export interface ChordRiff {
  chordRoot: NoteId
  chordQuality: ChordQuality
  chordDegree: string
  notes: RiffNote[]
  totalBeats: number // typically 4 for one measure
}

// Full riff for entire progression
export interface ProgressionRiff {
  id: string
  chordRiffs: ChordRiff[]
  bpm: number
  style: RiffStyle
}

// Tab display format for a single measure
export interface TabMeasure {
  chordName: string
  chordDegree: string
  // Each string maps to an array of tab positions (fret numbers or null for empty)
  // Index corresponds to beat subdivision
  positions: Record<GuitarString, (number | null)[]>
  subdivisions: number // how many slots per measure (8 = eighth notes)
}

// Full tab sheet
export interface TabSheet {
  measures: TabMeasure[]
  bpm: number
  beatsPerMeasure: number
}

// Playback state
export interface PlaybackState {
  isPlaying: boolean
  currentMeasure: number
  currentSubdivision: number
  loopEnabled: boolean
}

// Note picker state for editing
export interface NotePickerState {
  isOpen: boolean
  measureIndex: number
  subdivisionIndex: number
  string: GuitarString
  availableNotes: Array<{ note: NoteId; fret: number; interval?: IntervalSymbol }>
}

// Song builder panel state
export interface SongBuilderState {
  isOpen: boolean
  progression: ChordProgression | null
  rootNote: NoteId
  generatedRiff: ProgressionRiff | null
  tabSheet: TabSheet | null
  playbackState: PlaybackState
  riffStyle: RiffStyle
  notePicker: NotePickerState | null
}

// Speed to BPM mapping
export const SPEED_TO_BPM: Record<AnimationSpeed, number> = {
  slow: 80,
  medium: 120,
  fast: 160
}
