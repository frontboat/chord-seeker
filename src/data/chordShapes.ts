import type { ChordQuality, ChordShapeTemplate } from '../types/music'

const MINOR_FAMILY: ChordQuality[] = ['minor', 'flatThird']

export const CHORD_SHAPES: ChordShapeTemplate[] = [
  {
    id: 'e-major',
    label: 'E Major shape',
    description: 'Classic E-family barre with a bright third on the G string.',
    shapeFamily: 'E-family',
    qualities: ['major'],
    rootString: 6,
    rootFret: 0,
    baseRoot: 'E',
    isMovable: true,
    positions: [
      { string: 5, fret: 2, finger: 2, interval: '5' },
      { string: 4, fret: 2, finger: 3, interval: 'R' },
      { string: 3, fret: 1, finger: 1, interval: '3' }
    ],
    openStrings: [
      { string: 6, interval: 'R' },
      { string: 2, interval: '5' },
      { string: 1, interval: 'R' }
    ],
    barre: {
      fromString: 6,
      toString: 1,
      fret: 0,
      finger: 1,
      engagesFromFret: 1,
      showInOpen: false
    }
  },
  {
    id: 'a-major',
    label: 'A Major shape',
    description: 'Compact A-family voicing that loves fifth-string roots.',
    shapeFamily: 'A-family',
    qualities: ['major'],
    rootString: 5,
    rootFret: 0,
    baseRoot: 'A',
    isMovable: true,
    positions: [
      { string: 4, fret: 2, finger: 2, interval: '5' },
      { string: 3, fret: 2, finger: 3, interval: 'R' },
      { string: 2, fret: 2, finger: 4, interval: '3' }
    ],
    openStrings: [
      { string: 5, interval: 'R' },
      { string: 1, interval: '5' }
    ],
    mutedStrings: [6],
    barre: {
      fromString: 5,
      toString: 1,
      fret: 0,
      finger: 1,
      engagesFromFret: 1,
      showInOpen: false
    }
  },
  {
    id: 'e-minor',
    label: 'E Minor shape',
    description: 'Two-finger Em form that becomes a minor barre anywhere.',
    shapeFamily: 'E-family',
    qualities: MINOR_FAMILY,
    rootString: 6,
    rootFret: 0,
    baseRoot: 'E',
    isMovable: true,
    positions: [
      { string: 5, fret: 2, finger: 2, interval: '5' },
      { string: 4, fret: 2, finger: 3, interval: 'R' }
    ],
    openStrings: [
      { string: 6, interval: 'R' },
      { string: 3, interval: 'b3' },
      { string: 2, interval: '5' },
      { string: 1, interval: 'R' }
    ],
    barre: {
      fromString: 6,
      toString: 1,
      fret: 0,
      finger: 1,
      engagesFromFret: 1,
      showInOpen: false
    }
  },
  {
    id: 'a-minor',
    label: 'A Minor shape',
    description: 'The Am grip with the flattened third on the B string.',
    shapeFamily: 'A-family',
    qualities: MINOR_FAMILY,
    rootString: 5,
    rootFret: 0,
    baseRoot: 'A',
    isMovable: true,
    positions: [
      { string: 4, fret: 2, finger: 3, interval: '5' },
      { string: 3, fret: 2, finger: 4, interval: 'R' },
      { string: 2, fret: 1, finger: 2, interval: 'b3' }
    ],
    openStrings: [
      { string: 5, interval: 'R' },
      { string: 1, interval: '5' }
    ],
    mutedStrings: [6],
    barre: {
      fromString: 5,
      toString: 1,
      fret: 0,
      finger: 1,
      engagesFromFret: 1,
      showInOpen: false
    }
  },
  {
    id: 'd-minor-open',
    label: 'D Minor open shape',
    description: 'Focused D minor that highlights the flat third up top.',
    shapeFamily: 'D-family',
    qualities: MINOR_FAMILY,
    rootString: 4,
    rootFret: 0,
    baseRoot: 'D',
    isMovable: false,
    positions: [
      { string: 3, fret: 2, finger: 3, interval: '5' },
      { string: 2, fret: 3, finger: 4, interval: 'R' },
      { string: 1, fret: 1, finger: 2, interval: 'b3' }
    ],
    openStrings: [{ string: 4, interval: 'R' }],
    mutedStrings: [6, 5]
  },
  {
    id: 'e-sus2',
    label: 'E Sus2 shape',
    description: 'E shape that swaps the third for a shimmering second.',
    shapeFamily: 'E-family',
    qualities: ['sus2'],
    rootString: 6,
    rootFret: 0,
    baseRoot: 'E',
    isMovable: true,
    positions: [
      { string: 5, fret: 2, finger: 1, interval: '5' },
      { string: 4, fret: 4, finger: 3, interval: '9' },
      { string: 3, fret: 4, finger: 4, interval: '5' }
    ],
    openStrings: [
      { string: 6, interval: 'R' },
      { string: 2, interval: '5' },
      { string: 1, interval: 'R' }
    ],
    barre: {
      fromString: 6,
      toString: 1,
      fret: 0,
      finger: 1,
      engagesFromFret: 1,
      showInOpen: false
    }
  },
  {
    id: 'a-sus2',
    label: 'A Sus2 shape',
    description: 'A sus2 that keeps the top two strings ringing.',
    shapeFamily: 'A-family',
    qualities: ['sus2'],
    rootString: 5,
    rootFret: 0,
    baseRoot: 'A',
    isMovable: true,
    positions: [
      { string: 4, fret: 2, finger: 2, interval: '5' },
      { string: 3, fret: 2, finger: 3, interval: 'R' }
    ],
    openStrings: [
      { string: 5, interval: 'R' },
      { string: 2, interval: '9' },
      { string: 1, interval: '5' }
    ],
    mutedStrings: [6],
    barre: {
      fromString: 5,
      toString: 1,
      fret: 0,
      finger: 1,
      engagesFromFret: 1,
      showInOpen: false
    }
  },
  {
    id: 'e-sus4',
    label: 'E Sus4 shape',
    description: 'Percussive sus4 built on the E major frame.',
    shapeFamily: 'E-family',
    qualities: ['sus4'],
    rootString: 6,
    rootFret: 0,
    baseRoot: 'E',
    isMovable: true,
    positions: [
      { string: 5, fret: 2, finger: 3, interval: '5' },
      { string: 4, fret: 2, finger: 4, interval: 'R' },
      { string: 3, fret: 2, finger: 2, interval: '4' }
    ],
    openStrings: [
      { string: 6, interval: 'R' },
      { string: 2, interval: '5' },
      { string: 1, interval: 'R' }
    ],
    barre: {
      fromString: 6,
      toString: 1,
      fret: 0,
      finger: 1,
      engagesFromFret: 1,
      showInOpen: false
    }
  },
  {
    id: 'a-sus4',
    label: 'A Sus4 shape',
    description: 'Suspended fourth built from the A major shell.',
    shapeFamily: 'A-family',
    qualities: ['sus4'],
    rootString: 5,
    rootFret: 0,
    baseRoot: 'A',
    isMovable: true,
    positions: [
      { string: 4, fret: 2, finger: 2, interval: '5' },
      { string: 3, fret: 2, finger: 3, interval: 'R' },
      { string: 2, fret: 3, finger: 4, interval: '4' }
    ],
    openStrings: [
      { string: 5, interval: 'R' },
      { string: 1, interval: '5' }
    ],
    mutedStrings: [6],
    barre: {
      fromString: 5,
      toString: 1,
      fret: 0,
      finger: 1,
      engagesFromFret: 1,
      showInOpen: false
    }
  },
  {
    id: 'e-dom7',
    label: 'E7 shape',
    description: 'E-based dominant 7 with the open D string acting as b7.',
    shapeFamily: 'E-family',
    qualities: ['dominant7'],
    rootString: 6,
    rootFret: 0,
    baseRoot: 'E',
    isMovable: true,
    positions: [
      { string: 5, fret: 2, finger: 2, interval: '5' },
      { string: 3, fret: 1, finger: 1, interval: '3' }
    ],
    openStrings: [
      { string: 6, interval: 'R' },
      { string: 4, interval: 'b7' },
      { string: 2, interval: '5' },
      { string: 1, interval: 'R' }
    ],
    barre: {
      fromString: 6,
      toString: 1,
      fret: 0,
      finger: 1,
      engagesFromFret: 1,
      showInOpen: false
    }
  },
  {
    id: 'a-dom7',
    label: 'A7 shape',
    description: 'Snappy A7 voicing with the open G as the flat seventh.',
    shapeFamily: 'A-family',
    qualities: ['dominant7'],
    rootString: 5,
    rootFret: 0,
    baseRoot: 'A',
    isMovable: true,
    positions: [
      { string: 4, fret: 2, finger: 2, interval: '5' },
      { string: 2, fret: 2, finger: 3, interval: '3' }
    ],
    openStrings: [
      { string: 5, interval: 'R' },
      { string: 3, interval: 'b7' },
      { string: 1, interval: '5' }
    ],
    mutedStrings: [6],
    barre: {
      fromString: 5,
      toString: 1,
      fret: 0,
      finger: 1,
      engagesFromFret: 1,
      showInOpen: false
    }
  },
  {
    id: 'e-maj7',
    label: 'E Maj7 shape',
    description: 'Dreamy Emaj7 with stacked tones on strings 4 and 3.',
    shapeFamily: 'E-family',
    qualities: ['major7'],
    rootString: 6,
    rootFret: 0,
    baseRoot: 'E',
    isMovable: true,
    positions: [
      { string: 5, fret: 2, finger: 3, interval: '5' },
      { string: 4, fret: 1, finger: 2, interval: '7' },
      { string: 3, fret: 1, finger: 1, interval: '3' }
    ],
    openStrings: [
      { string: 6, interval: 'R' },
      { string: 2, interval: '5' },
      { string: 1, interval: 'R' }
    ],
    barre: {
      fromString: 6,
      toString: 1,
      fret: 0,
      finger: 1,
      engagesFromFret: 1,
      showInOpen: false
    }
  },
  {
    id: 'a-maj7',
    label: 'A Maj7 shape',
    description: 'Silky Amaj7 with the third on the B string.',
    shapeFamily: 'A-family',
    qualities: ['major7'],
    rootString: 5,
    rootFret: 0,
    baseRoot: 'A',
    isMovable: true,
    positions: [
      { string: 4, fret: 2, finger: 3, interval: '5' },
      { string: 3, fret: 1, finger: 2, interval: '7' },
      { string: 2, fret: 2, finger: 4, interval: '3' }
    ],
    openStrings: [
      { string: 5, interval: 'R' },
      { string: 1, interval: '5' }
    ],
    mutedStrings: [6],
    barre: {
      fromString: 5,
      toString: 1,
      fret: 0,
      finger: 1,
      engagesFromFret: 1,
      showInOpen: false
    }
  },
  {
    id: 'e-min7',
    label: 'E Minor 7 shape',
    description: 'E minor core with the flat seventh add on the B string.',
    shapeFamily: 'E-family',
    qualities: ['minor7'],
    rootString: 6,
    rootFret: 0,
    baseRoot: 'E',
    isMovable: true,
    positions: [
      { string: 5, fret: 2, finger: 2, interval: '5' },
      { string: 4, fret: 2, finger: 3, interval: 'R' },
      { string: 2, fret: 3, finger: 4, interval: 'b7' }
    ],
    openStrings: [
      { string: 6, interval: 'R' },
      { string: 3, interval: 'b3' },
      { string: 1, interval: 'R' }
    ],
    barre: {
      fromString: 6,
      toString: 1,
      fret: 0,
      finger: 1,
      engagesFromFret: 1,
      showInOpen: false
    }
  },
  {
    id: 'a-min7',
    label: 'A Minor 7 shape',
    description: 'A minor grip plus the open G giving b7.',
    shapeFamily: 'A-family',
    qualities: ['minor7'],
    rootString: 5,
    rootFret: 0,
    baseRoot: 'A',
    isMovable: true,
    positions: [
      { string: 4, fret: 2, finger: 2, interval: '5' },
      { string: 2, fret: 1, finger: 1, interval: 'b3' }
    ],
    openStrings: [
      { string: 5, interval: 'R' },
      { string: 3, interval: 'b7' },
      { string: 1, interval: '5' }
    ],
    mutedStrings: [6],
    barre: {
      fromString: 5,
      toString: 1,
      fret: 0,
      finger: 1,
      engagesFromFret: 1,
      showInOpen: false
    }
  },
  {
    id: 'e-add9',
    label: 'E Add9 shape',
    description: 'Wide spread voicing with the ninth stacked on the D string.',
    shapeFamily: 'E-family',
    qualities: ['add9'],
    rootString: 6,
    rootFret: 0,
    baseRoot: 'E',
    isMovable: true,
    positions: [
      { string: 5, fret: 2, finger: 2, interval: '5' },
      { string: 4, fret: 4, finger: 4, interval: '9' },
      { string: 3, fret: 1, finger: 1, interval: '3' }
    ],
    openStrings: [
      { string: 6, interval: 'R' },
      { string: 2, interval: '5' },
      { string: 1, interval: 'R' }
    ],
    barre: {
      fromString: 6,
      toString: 1,
      fret: 0,
      finger: 1,
      engagesFromFret: 1,
      showInOpen: false
    }
  },
  {
    id: 'a-add9',
    label: 'A Add9 shape',
    description: 'Floating add9 on the fifth-string root.',
    shapeFamily: 'A-family',
    qualities: ['add9'],
    rootString: 5,
    rootFret: 0,
    baseRoot: 'A',
    isMovable: true,
    positions: [
      { string: 4, fret: 2, finger: 2, interval: '5' },
      { string: 3, fret: 4, finger: 4, interval: '9' }
    ],
    openStrings: [
      { string: 5, interval: 'R' },
      { string: 2, interval: '9' },
      { string: 1, interval: '5' }
    ],
    mutedStrings: [6],
    barre: {
      fromString: 5,
      toString: 1,
      fret: 0,
      finger: 1,
      engagesFromFret: 1,
      showInOpen: false
    }
  },
  {
    id: 'e-diminished',
    label: 'E Diminished shape',
    description: 'Sparse E diminished triad with muted B string.',
    shapeFamily: 'E-family',
    qualities: ['diminished'],
    rootString: 6,
    rootFret: 0,
    baseRoot: 'E',
    isMovable: true,
    positions: [
      { string: 5, fret: 1, finger: 2, interval: 'b5' },
      { string: 4, fret: 2, finger: 3, interval: 'R' }
    ],
    openStrings: [
      { string: 6, interval: 'R' },
      { string: 3, interval: 'b3' },
      { string: 1, interval: 'R' }
    ],
    mutedStrings: [2],
    barre: {
      fromString: 6,
      toString: 1,
      fret: 0,
      finger: 1,
      engagesFromFret: 1,
      showInOpen: false
    }
  },
  {
    id: 'a-diminished',
    label: 'A Diminished shape',
    description: 'Fifth-string diminished voicing with tight upper chord tones.',
    shapeFamily: 'A-family',
    qualities: ['diminished'],
    rootString: 5,
    rootFret: 0,
    baseRoot: 'A',
    isMovable: true,
    positions: [
      { string: 4, fret: 1, finger: 2, interval: 'b5' },
      { string: 3, fret: 2, finger: 3, interval: 'R' },
      { string: 2, fret: 1, finger: 1, interval: 'b3' }
    ],
    openStrings: [{ string: 5, interval: 'R' }],
    mutedStrings: [6, 1],
    barre: {
      fromString: 5,
      toString: 2,
      fret: 0,
      finger: 1,
      engagesFromFret: 1,
      showInOpen: false
    }
  },
  {
    id: 'e-augmented',
    label: 'E Augmented shape',
    description: 'Swapped-in sharp fifth for the sci-fi E aug color.',
    shapeFamily: 'E-family',
    qualities: ['augmented'],
    rootString: 6,
    rootFret: 0,
    baseRoot: 'E',
    isMovable: true,
    positions: [
      { string: 5, fret: 3, finger: 4, interval: '#5' },
      { string: 4, fret: 2, finger: 3, interval: 'R' },
      { string: 3, fret: 1, finger: 1, interval: '3' },
      { string: 2, fret: 1, finger: 2, interval: '#5' }
    ],
    openStrings: [
      { string: 6, interval: 'R' },
      { string: 1, interval: 'R' }
    ],
    barre: {
      fromString: 6,
      toString: 1,
      fret: 0,
      finger: 1,
      engagesFromFret: 1,
      showInOpen: false
    }
  },
  {
    id: 'a-augmented',
    label: 'A Augmented shape',
    description: 'Augmented extension of the A shape with stacked sharp fifths.',
    shapeFamily: 'A-family',
    qualities: ['augmented'],
    rootString: 5,
    rootFret: 0,
    baseRoot: 'A',
    isMovable: true,
    positions: [
      { string: 4, fret: 3, finger: 4, interval: '#5' },
      { string: 3, fret: 2, finger: 3, interval: 'R' },
      { string: 2, fret: 2, finger: 2, interval: '3' },
      { string: 1, fret: 1, finger: 1, interval: '#5' }
    ],
    openStrings: [{ string: 5, interval: 'R' }],
    mutedStrings: [6],
    barre: {
      fromString: 5,
      toString: 1,
      fret: 0,
      finger: 1,
      engagesFromFret: 1,
      showInOpen: false
    }
  }
]
