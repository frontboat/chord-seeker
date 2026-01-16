import type { ChordQuality, GuitarString, IntervalSymbol, NoteId } from '../types/music'
import type { TriadNote, TriadPosition } from '../types/triad'
import { QUALITY_MAP } from '../data/chordQualities'
import { GUITAR_STRINGS, INDEX_TO_NOTE, NOTE_TO_INDEX, STRING_TUNINGS } from '../data/notes'

// Map intervals to semitone offsets from root
const INTERVAL_TO_SEMITONES: Record<IntervalSymbol, number> = {
  R: 0,
  '2': 2,
  'b3': 3,
  '3': 4,
  '4': 5,
  'b5': 6,
  '5': 7,
  '#5': 8,
  '6': 9,
  'b7': 10,
  '7': 11,
  '9': 14
}

/**
 * Generate all possible 3-string combinations from 6 strings.
 * Returns C(6,3) = 20 combinations.
 */
export function generateStringCombinations(): [GuitarString, GuitarString, GuitarString][] {
  const combinations: [GuitarString, GuitarString, GuitarString][] = []

  for (let i = 0; i < GUITAR_STRINGS.length - 2; i++) {
    for (let j = i + 1; j < GUITAR_STRINGS.length - 1; j++) {
      for (let k = j + 1; k < GUITAR_STRINGS.length; k++) {
        combinations.push([GUITAR_STRINGS[i], GUITAR_STRINGS[j], GUITAR_STRINGS[k]])
      }
    }
  }

  return combinations
}

/**
 * Calculate the actual note from a root note and interval.
 */
export function calculateNoteFromInterval(root: NoteId, interval: IntervalSymbol): NoteId {
  const rootIndex = NOTE_TO_INDEX[root]
  const semitones = INTERVAL_TO_SEMITONES[interval]
  const targetIndex = (rootIndex + semitones) % 12
  return INDEX_TO_NOTE[targetIndex]
}

/**
 * Find all fret positions (0 to maxFret) for a given note on a string.
 */
export function findAllFretsForNote(
  stringId: GuitarString,
  targetNote: NoteId,
  maxFret: number = 15
): number[] {
  const tuning = STRING_TUNINGS[stringId]
  const targetIndex = NOTE_TO_INDEX[targetNote]
  const frets: number[] = []

  // Calculate the first occurrence
  let fret = targetIndex - tuning.index
  while (fret < 0) {
    fret += 12
  }

  // Add all occurrences up to maxFret
  while (fret <= maxFret) {
    frets.push(fret)
    fret += 12
  }

  return frets
}

/**
 * Filter positions to only include playable ones.
 * Max span of 5 frets, no frets > 15.
 */
export function filterPlayablePositions(positions: TriadPosition[]): TriadPosition[] {
  return positions.filter((pos) => {
    // Exclude if any fret is beyond 15
    if (pos.notes.some((note) => note.fret > 15)) {
      return false
    }

    // Exclude if span is too large (more than 5 frets)
    if (pos.span > 5) {
      return false
    }

    return true
  })
}

/**
 * Main function to generate all playable triad positions for a given root and quality.
 */
export function generateTriadPositions(root: NoteId, quality: ChordQuality): TriadPosition[] {
  const qualityDef = QUALITY_MAP[quality]

  // Extract first 3 intervals for triad
  const triadIntervals = qualityDef.intervals.slice(0, 3) as [
    IntervalSymbol,
    IntervalSymbol,
    IntervalSymbol
  ]

  // If quality has fewer than 3 intervals, return empty
  if (triadIntervals.length < 3) {
    return []
  }

  // Calculate target notes for each interval
  const targetNotes: [NoteId, NoteId, NoteId] = [
    calculateNoteFromInterval(root, triadIntervals[0]),
    calculateNoteFromInterval(root, triadIntervals[1]),
    calculateNoteFromInterval(root, triadIntervals[2])
  ]

  // Generate all string combinations
  const stringCombos = generateStringCombinations()

  // Generate all possible positions
  const allPositions: TriadPosition[] = []

  stringCombos.forEach((stringSet) => {
    // For each string, find all possible fret positions for the corresponding note
    const fretOptions = stringSet.map((str, idx) => {
      const frets = findAllFretsForNote(str, targetNotes[idx], 15)
      return frets.map((fret) => ({
        string: str,
        fret,
        interval: triadIntervals[idx],
        note: targetNotes[idx]
      }))
    })

    // Generate all combinations of fret positions across the 3 strings
    fretOptions[0].forEach((note1) => {
      fretOptions[1].forEach((note2) => {
        fretOptions[2].forEach((note3) => {
          const notes: [TriadNote, TriadNote, TriadNote] = [note1, note2, note3]
          const frets = notes.map((n) => n.fret)
          const minFret = Math.min(...frets)
          const maxFret = Math.max(...frets)
          const span = maxFret - minFret

          const position: TriadPosition = {
            id: `${stringSet.join('-')}-${frets.join('-')}`,
            notes,
            minFret,
            maxFret,
            span,
            stringSet
          }

          allPositions.push(position)
        })
      })
    })
  })

  // Filter for playability
  const playablePositions = filterPlayablePositions(allPositions)

  // Sort by minimum fret (ascending), then by string set
  playablePositions.sort((a, b) => {
    if (a.minFret !== b.minFret) {
      return a.minFret - b.minFret
    }
    // Secondary sort by string set (higher strings first)
    return b.stringSet[0] - a.stringSet[0]
  })

  return playablePositions
}
