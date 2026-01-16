import type { GuitarString } from '../types/music'
import type { ChordRiff, ProgressionRiff, TabMeasure, TabSheet } from '../types/songBuilder'
import { GUITAR_STRINGS } from '../data/notes'
import { QUALITY_MAP } from '../data/chordQualities'

/**
 * Convert a chord riff to a tab measure format
 */
export function formatTabMeasure(
  chordRiff: ChordRiff,
  subdivisions: number = 8 // 8 = eighth note subdivisions (8 per measure of 4/4)
): TabMeasure {
  // Initialize positions for each string with null (empty)
  const positions: Record<GuitarString, (number | null)[]> = {} as Record<
    GuitarString,
    (number | null)[]
  >

  GUITAR_STRINGS.forEach((stringId) => {
    positions[stringId] = Array(subdivisions).fill(null)
  })

  // Place each note in the correct subdivision
  chordRiff.notes.forEach((note) => {
    // Convert beat position to subdivision index
    // If subdivisions = 8 and totalBeats = 4, then each beat has 2 subdivisions
    const subdivisionsPerBeat = subdivisions / chordRiff.totalBeats
    const subdivisionIndex = Math.floor(note.startBeat * subdivisionsPerBeat)

    if (subdivisionIndex >= 0 && subdivisionIndex < subdivisions) {
      positions[note.string][subdivisionIndex] = note.fret
    }
  })

  // Build chord name
  const qualityDef = QUALITY_MAP[chordRiff.chordQuality]
  const shortLabel = qualityDef?.shortLabel || ''
  const chordName = `${chordRiff.chordRoot}${shortLabel}`

  return {
    chordName,
    chordDegree: chordRiff.chordDegree,
    positions,
    subdivisions
  }
}

/**
 * Convert a full progression riff to a tab sheet
 */
export function riffToTabSheet(riff: ProgressionRiff, subdivisions: number = 8): TabSheet {
  const measures = riff.chordRiffs.map((chordRiff) => formatTabMeasure(chordRiff, subdivisions))

  return {
    measures,
    bpm: riff.bpm,
    beatsPerMeasure: 4
  }
}

/**
 * Format tab positions as ASCII string for text display
 */
export function tabToAscii(tabSheet: TabSheet): string {
  const stringNames: Record<GuitarString, string> = {
    1: 'e',
    2: 'B',
    3: 'G',
    4: 'D',
    5: 'A',
    6: 'E'
  }

  const lines: string[] = []

  // For each string (high to low for standard tab notation)
  const displayOrder: GuitarString[] = [1, 2, 3, 4, 5, 6]

  displayOrder.forEach((stringId) => {
    let line = `${stringNames[stringId]}|`

    tabSheet.measures.forEach((measure) => {
      const positions = measure.positions[stringId]

      positions.forEach((fret) => {
        if (fret === null) {
          line += '--'
        } else if (fret >= 10) {
          line += fret.toString()
        } else {
          line += `-${fret}`
        }
      })

      line += '|'
    })

    lines.push(line)
  })

  // Add chord names below
  let chordLine = '  '
  tabSheet.measures.forEach((measure) => {
    const padding = measure.subdivisions * 2 - measure.chordName.length
    chordLine += measure.chordName + ' '.repeat(Math.max(0, padding)) + ' '
  })
  lines.push(chordLine)

  return lines.join('\n')
}

/**
 * Calculate total duration of tab sheet in seconds
 */
export function getTabDuration(tabSheet: TabSheet): number {
  const totalBeats = tabSheet.measures.length * tabSheet.beatsPerMeasure
  const beatsPerSecond = tabSheet.bpm / 60
  return totalBeats / beatsPerSecond
}

/**
 * Get beat position from subdivision index
 */
export function subdivisionToBeat(
  subdivisionIndex: number,
  subdivisions: number,
  beatsPerMeasure: number
): number {
  return (subdivisionIndex / subdivisions) * beatsPerMeasure
}

/**
 * Get subdivision index from current playback time
 */
export function timeToSubdivision(
  timeInSeconds: number,
  bpm: number,
  subdivisions: number,
  beatsPerMeasure: number
): { measureIndex: number; subdivisionIndex: number } {
  const beatsPerSecond = bpm / 60
  const totalBeats = timeInSeconds * beatsPerSecond
  const beatsPerMeasure_ = beatsPerMeasure
  const totalMeasures = Math.floor(totalBeats / beatsPerMeasure_)
  const beatWithinMeasure = totalBeats % beatsPerMeasure_
  const subdivisionsPerBeat = subdivisions / beatsPerMeasure_
  const subdivisionIndex = Math.floor(beatWithinMeasure * subdivisionsPerBeat)

  return {
    measureIndex: totalMeasures,
    subdivisionIndex
  }
}

/**
 * Get note at a specific position in the tab
 */
export function getNoteAtPosition(
  tabSheet: TabSheet,
  measureIndex: number,
  subdivisionIndex: number,
  stringId: GuitarString
): number | null {
  const measure = tabSheet.measures[measureIndex]
  if (!measure) return null

  const positions = measure.positions[stringId]
  if (!positions) return null

  return positions[subdivisionIndex] ?? null
}

/**
 * Check if a subdivision has any notes
 */
export function hasNotesAtSubdivision(
  tabSheet: TabSheet,
  measureIndex: number,
  subdivisionIndex: number
): boolean {
  const measure = tabSheet.measures[measureIndex]
  if (!measure) return false

  return GUITAR_STRINGS.some((stringId) => {
    const fret = measure.positions[stringId][subdivisionIndex]
    return fret !== null
  })
}
