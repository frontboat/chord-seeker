import type { GuitarString, IntervalSymbol, NoteId } from './music'

export interface TriadNote {
  string: GuitarString
  fret: number
  interval: IntervalSymbol
  note: NoteId
}

export interface TriadPosition {
  id: string
  notes: [TriadNote, TriadNote, TriadNote]
  minFret: number
  maxFret: number
  span: number
  stringSet: [GuitarString, GuitarString, GuitarString]
}

export type AnimationSpeed = 'slow' | 'medium' | 'fast'
export type AnimationState = 'playing' | 'paused'
