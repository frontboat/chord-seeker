import type {
  CalculatedFingerPlacement,
  ChordQuality,
  ChordShapeTemplate,
  GuitarString,
  NoteId,
  RuntimeChordShape
} from '../types/music'
import { CHORD_SHAPES } from '../data/chordShapes'
import { GUITAR_STRINGS, NOTE_TO_INDEX, STRING_TUNINGS } from '../data/notes'
import { QUALITY_MAP } from '../data/chordQualities'

const QUALITY_SUFFIX: Record<ChordQuality, string> = {
  major: '',
  minor: 'm',
  flatThird: '(b3)',
  sus2: 'sus2',
  sus4: 'sus4',
  dominant7: '7',
  major7: 'maj7',
  minor7: 'm7',
  add9: 'add9',
  diminished: 'dim',
  augmented: 'aug'
}

function findFretForNoteOnString(stringId: GuitarString, target: NoteId): number {
  const tuning = STRING_TUNINGS[stringId]
  const targetIndex = NOTE_TO_INDEX[target]
  let fret = targetIndex - tuning.index
  while (fret < 0) {
    fret += 12
  }
  return fret % 12
}

function buildFingerPlacements(template: ChordShapeTemplate, offset: number): CalculatedFingerPlacement[] {
  return template.positions.map((pos) => ({
    string: pos.string,
    fret: pos.fret + offset,
    finger: pos.finger,
    interval: pos.interval,
    isRoot: pos.interval === 'R'
  }))
}

function createEmptyStringStates() {
  return GUITAR_STRINGS.reduce(
    (acc, stringId) => {
      acc[stringId] = {
        string: stringId,
        fret: null,
        interval: undefined,
        finger: undefined,
        isOpen: false,
        isMuted: false
      }
      return acc
    },
    {} as RuntimeChordShape['stringStates']
  )
}

function applyOpenStrings(
  template: ChordShapeTemplate,
  offset: number,
  states: RuntimeChordShape['stringStates']
) {
  template.openStrings?.forEach((open) => {
    const isOpen = offset === 0
    const fretValue = isOpen ? 0 : offset
    states[open.string] = {
      string: open.string,
      fret: fretValue,
      interval: open.interval,
      finger: isOpen ? undefined : template.barre?.finger ?? 1,
      isOpen,
      isMuted: false
    }
  })
}

function applyFingerPositions(
  template: ChordShapeTemplate,
  offset: number,
  states: RuntimeChordShape['stringStates']
) {
  template.positions.forEach((pos) => {
    states[pos.string] = {
      string: pos.string,
      fret: pos.fret + offset,
      interval: pos.interval,
      finger: pos.finger,
      isOpen: pos.fret === 0 && offset === 0,
      isMuted: false
    }
  })
}

function applyMutedStrings(template: ChordShapeTemplate, states: RuntimeChordShape['stringStates']) {
  template.mutedStrings?.forEach((stringId) => {
    states[stringId] = {
      string: stringId,
      fret: null,
      interval: undefined,
      finger: undefined,
      isOpen: false,
      isMuted: true
    }
  })
}

function buildBarre(template: ChordShapeTemplate, offset: number) {
  if (!template.barre) {
    return null
  }
  const engagesFrom = template.barre.engagesFromFret ?? 0
  const shouldShow = offset > 0 || template.barre.showInOpen
  if (!shouldShow || offset < engagesFrom) {
    return null
  }
  return {
    fromString: template.barre.fromString,
    toString: template.barre.toString,
    fret: template.barre.fret + offset,
    finger: template.barre.finger
  }
}

function determineFretWindow(
  states: RuntimeChordShape['stringStates'],
  barre: ReturnType<typeof buildBarre>
) {
  const usedFrets: number[] = []
  Object.values(states).forEach((state) => {
    if (!state.isMuted && state.fret !== null) {
      usedFrets.push(state.fret)
    }
  })
  if (barre) {
    usedFrets.push(barre.fret)
  }
  if (usedFrets.length === 0) {
    usedFrets.push(0)
  }
  const positiveFrets = usedFrets.filter((fret) => fret > 0)
  const minFret = positiveFrets.length ? Math.min(...positiveFrets) : 0
  const maxFret = Math.max(...usedFrets)
  const start = minFret === 0 ? 0 : Math.max(0, minFret - 1)
  const span = Math.max(5, maxFret - start + 2)
  const end = start + span - 1
  return { start, end }
}

function buildInstructions(states: RuntimeChordShape['stringStates']): string[] {
  return GUITAR_STRINGS.map((stringId) => {
    const tuning = STRING_TUNINGS[stringId]
    const state = states[stringId]
    if (!state || state.isMuted || state.fret === null) {
      return `${tuning.label}: mute`
    }
    if (state.fret === 0) {
      return `${tuning.label}: open${state.interval ? ` (${state.interval})` : ''}`
    }
    return `${tuning.label}: fret ${state.fret}${state.interval ? ` (${state.interval})` : ''}`
  })
}

function buildNoteList(states: RuntimeChordShape['stringStates']) {
  return GUITAR_STRINGS.map((stringId) => {
    const state = states[stringId]
    if (!state || state.isMuted || state.fret === null) {
      return null
    }
    return { string: stringId, fret: state.fret }
  }).filter(Boolean) as Array<{ string: GuitarString; fret: number }>
}

function instantiateTemplate(
  template: ChordShapeTemplate,
  root: NoteId,
  quality: ChordQuality
): RuntimeChordShape | null {
  const targetFret = findFretForNoteOnString(template.rootString, root)
  const offset = template.isMovable ? targetFret - template.rootFret : 0
  if (!template.isMovable && template.baseRoot !== root) {
    return null
  }
  if (template.isMovable && offset < 0) {
    return null
  }
  const fingerPlacements = buildFingerPlacements(template, offset)
  const states = createEmptyStringStates()
  applyOpenStrings(template, offset, states)
  applyFingerPositions(template, offset, states)
  applyMutedStrings(template, states)
  const barre = buildBarre(template, offset)
  const fretWindow = determineFretWindow(states, barre)
  const openIndicators = offset === 0 && template.openStrings ? template.openStrings : []
  const instructions = buildInstructions(states)
  const notesForAudio = buildNoteList(states)
  return {
    instanceId: '',
    templateId: template.id,
    templateLabel: template.label,
    description: template.description,
    quality,
    root,
    displayName: `${root}${QUALITY_SUFFIX[quality]} (${template.label})`,
    accentColor: QUALITY_MAP[quality].color,
    fingerPlacements,
    openIndicators,
    stringStates: states,
    barre,
    fretWindow,
    instructions,
    notesForAudio
  }
}

export function buildChordShapes(root: NoteId, quality: ChordQuality): RuntimeChordShape[] {
  const shapes = CHORD_SHAPES.filter((shape) => shape.qualities.includes(quality))
    .map((shape) => instantiateTemplate(shape, root, quality))
    .filter(Boolean) as RuntimeChordShape[]

  return shapes.map((shape, index) => ({
    ...shape,
    instanceId: `${shape.templateId}-${root}-${quality}-${index}`
  }))
}

export function formatChordName(root: NoteId, quality: ChordQuality) {
  return `${root}${QUALITY_SUFFIX[quality]}`
}
