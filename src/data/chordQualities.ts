import type { ChordQuality, ChordQualityDefinition } from '../types/music'

export const CHORD_QUALITIES: ChordQualityDefinition[] = [
  {
    id: 'major',
    label: 'Major',
    shortLabel: '',
    description: 'Pure triad built from root, major third, and perfect fifth.',
    intervals: ['R', '3', '5'],
    color: '#4ef0ff',
    accent: '#73ffe9'
  },
  {
    id: 'minor',
    label: 'Minor',
    shortLabel: 'm',
    description: 'Triad with a flattened third for a darker tone.',
    intervals: ['R', 'b3', '5'],
    color: '#ff4fe1',
    accent: '#ff87ff'
  },
  {
    id: 'flatThird',
    label: 'Flat 3rd',
    shortLabel: '(b3)',
    description: 'Alias for the classic minor triad that emphasizes the lowered third.',
    intervals: ['R', 'b3', '5'],
    color: '#ff9d2f',
    accent: '#ffc65c',
    aliasOf: 'minor'
  },
  {
    id: 'sus2',
    label: 'Sus2',
    shortLabel: 'sus2',
    description: 'Replaces the third with a bright second.',
    intervals: ['R', '2', '5'],
    color: '#47ffb2',
    accent: '#7bffd4'
  },
  {
    id: 'sus4',
    label: 'Sus4',
    shortLabel: 'sus4',
    description: 'Suspended fourth keeps the harmony open and percussive.',
    intervals: ['R', '4', '5'],
    color: '#a6ff47',
    accent: '#cafe6e'
  },
  {
    id: 'dominant7',
    label: 'Dominant 7',
    shortLabel: '7',
    description: 'Major triad plus a flattened seventh for tension.',
    intervals: ['R', '3', '5', 'b7'],
    color: '#ffdb4f',
    accent: '#ffe98a'
  },
  {
    id: 'major7',
    label: 'Major 7',
    shortLabel: 'maj7',
    description: 'Lush major triad topped with a natural seventh.',
    intervals: ['R', '3', '5', '7'],
    color: '#a96bff',
    accent: '#cda1ff'
  },
  {
    id: 'minor7',
    label: 'Minor 7',
    shortLabel: 'm7',
    description: 'Minor triad paired with a flattened seventh.',
    intervals: ['R', 'b3', '5', 'b7'],
    color: '#ff77b4',
    accent: '#ff9fcc'
  },
  {
    id: 'add9',
    label: 'Add 9',
    shortLabel: 'add9',
    description: 'Major triad with the 9th for sparkle.',
    intervals: ['R', '3', '5', '9'],
    color: '#4f9dff',
    accent: '#7ac0ff'
  },
  {
    id: 'diminished',
    label: 'Diminished',
    shortLabel: 'dim',
    description: 'Stacked minor thirds: root, flat third, and flat fifth.',
    intervals: ['R', 'b3', 'b5'],
    color: '#ff5f5f',
    accent: '#ff9393'
  },
  {
    id: 'augmented',
    label: 'Augmented',
    shortLabel: 'aug',
    description: 'Major triad with a sharpened fifth for a futuristic vibe.',
    intervals: ['R', '3', '#5'],
    color: '#ff94ff',
    accent: '#ffc3ff'
  }
]

export const QUALITY_MAP = CHORD_QUALITIES.reduce(
  (acc, quality) => {
    acc[quality.id] = quality
    return acc
  },
  {} as Record<ChordQuality, ChordQualityDefinition>
)
