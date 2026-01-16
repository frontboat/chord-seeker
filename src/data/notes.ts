import type { GuitarString, NoteId, NoteOption } from '../types/music'

export const NOTE_OPTIONS: NoteOption[] = [
  { id: 'C', label: 'C', index: 0 },
  { id: 'C#', label: 'C#/Db', index: 1 },
  { id: 'D', label: 'D', index: 2 },
  { id: 'D#', label: 'D#/Eb', index: 3 },
  { id: 'E', label: 'E', index: 4 },
  { id: 'F', label: 'F', index: 5 },
  { id: 'F#', label: 'F#/Gb', index: 6 },
  { id: 'G', label: 'G', index: 7 },
  { id: 'G#', label: 'G#/Ab', index: 8 },
  { id: 'A', label: 'A', index: 9 },
  { id: 'A#', label: 'A#/Bb', index: 10 },
  { id: 'B', label: 'B', index: 11 }
]

export const NOTE_TO_INDEX: Record<NoteId, number> = NOTE_OPTIONS.reduce(
  (acc, note) => {
    acc[note.id] = note.index
    return acc
  },
  {} as Record<NoteId, number>
)

export const INDEX_TO_NOTE: NoteId[] = NOTE_OPTIONS.map((note) => note.id)

export const GUITAR_STRINGS: GuitarString[] = [6, 5, 4, 3, 2, 1]

export const STRING_TUNINGS: Record<
  GuitarString,
  { note: NoteId; index: number; midi: number; label: string }
> = {
  6: { note: 'E', index: NOTE_TO_INDEX.E, midi: 40, label: 'Low E' },
  5: { note: 'A', index: NOTE_TO_INDEX.A, midi: 45, label: 'A' },
  4: { note: 'D', index: NOTE_TO_INDEX.D, midi: 50, label: 'D' },
  3: { note: 'G', index: NOTE_TO_INDEX.G, midi: 55, label: 'G' },
  2: { note: 'B', index: NOTE_TO_INDEX.B, midi: 59, label: 'B' },
  1: { note: 'E', index: NOTE_TO_INDEX.E, midi: 64, label: 'High E' }
}
