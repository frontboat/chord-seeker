export type NoteId =
  | 'C'
  | 'C#'
  | 'D'
  | 'D#'
  | 'E'
  | 'F'
  | 'F#'
  | 'G'
  | 'G#'
  | 'A'
  | 'A#'
  | 'B'

export interface NoteOption {
  id: NoteId
  label: string
  index: number
}

export type GuitarString = 6 | 5 | 4 | 3 | 2 | 1

export type IntervalSymbol =
  | 'R'
  | 'b3'
  | '3'
  | '4'
  | '5'
  | 'b5'
  | '#5'
  | '2'
  | '6'
  | 'b7'
  | '7'
  | '9'

export type ChordQuality =
  | 'major'
  | 'minor'
  | 'flatThird'
  | 'sus2'
  | 'sus4'
  | 'dominant7'
  | 'major7'
  | 'minor7'
  | 'add9'
  | 'diminished'
  | 'augmented'

export interface ChordQualityDefinition {
  id: ChordQuality
  label: string
  shortLabel: string
  description: string
  intervals: IntervalSymbol[]
  color: string
  accent: string
  aliasOf?: ChordQuality
}

export interface FingerPosition {
  string: GuitarString
  fret: number
  finger?: number
  interval?: IntervalSymbol
  emphasize?: boolean
}

export interface OpenStringSpec {
  string: GuitarString
  interval?: IntervalSymbol
}

export interface BarreSpec {
  fromString: GuitarString
  toString: GuitarString
  fret: number
  finger: number
  engagesFromFret?: number
  showInOpen?: boolean
}

export interface ChordShapeTemplate {
  id: string
  label: string
  description: string
  shapeFamily: 'E-family' | 'A-family' | 'C-family' | 'D-family' | 'Custom'
  qualities: ChordQuality[]
  rootString: GuitarString
  rootFret: number
  baseRoot: NoteId
  isMovable: boolean
  positions: FingerPosition[]
  openStrings?: OpenStringSpec[]
  mutedStrings?: GuitarString[]
  barre?: BarreSpec
}

export interface CalculatedStringState {
  string: GuitarString
  fret: number | null
  interval?: IntervalSymbol
  finger?: number
  isOpen: boolean
  isMuted: boolean
}

export interface CalculatedFingerPlacement {
  string: GuitarString
  fret: number
  finger?: number
  interval?: IntervalSymbol
  isRoot?: boolean
}

export interface CalculatedBarre {
  fromString: GuitarString
  toString: GuitarString
  fret: number
  finger: number
}

export interface RuntimeChordShape {
  instanceId: string
  templateId: string
  templateLabel: string
  description: string
  quality: ChordQuality
  root: NoteId
  displayName: string
  accentColor: string
  fingerPlacements: CalculatedFingerPlacement[]
  openIndicators: OpenStringSpec[]
  stringStates: Record<GuitarString, CalculatedStringState>
  barre: CalculatedBarre | null
  fretWindow: { start: number; end: number }
  instructions: string[]
  notesForAudio: Array<{ string: GuitarString; fret: number }>
}
