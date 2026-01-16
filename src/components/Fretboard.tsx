import { GUITAR_STRINGS, STRING_TUNINGS } from '../data/notes'
import type { RuntimeChordShape, GuitarString } from '../types/music'

interface Props {
  shape: RuntimeChordShape
}

const fretGap = 56
const stringGap = 28
const margin = { left: 48, right: 24, top: 28, bottom: 40 }

// String thickness based on actual guitar string gauges (thicker = bass)
const STRING_THICKNESS: Record<GuitarString, number> = {
  6: 3.0,  // Low E - thickest
  5: 2.6,
  4: 2.2,
  3: 1.8,
  2: 1.5,
  1: 1.2   // High E - thinnest
}

export function Fretboard({ shape }: Props) {
  const fretCount = shape.fretWindow.end - shape.fretWindow.start + 1
  const width = margin.left + margin.right + fretCount * fretGap
  const height = margin.top + margin.bottom + (GUITAR_STRINGS.length - 1) * stringGap

  const positionForFret = (fret: number) =>
    margin.left + (fret - shape.fretWindow.start - 0.5) * fretGap

  const positionForString = (stringId: GuitarString) => {
    const index = GUITAR_STRINGS.indexOf(stringId)
    // Flip vertically: string 1 (high E) at top, string 6 (low E) at bottom
    const flippedIndex = GUITAR_STRINGS.length - 1 - index
    return margin.top + flippedIndex * stringGap
  }

  const stringsForBarre = (from: GuitarString, to: GuitarString) => {
    const fromIndex = GUITAR_STRINGS.indexOf(from)
    const toIndex = GUITAR_STRINGS.indexOf(to)
    // Flip indices for correct vertical positioning
    const flippedFromIndex = GUITAR_STRINGS.length - 1 - fromIndex
    const flippedToIndex = GUITAR_STRINGS.length - 1 - toIndex
    const topIndex = Math.min(flippedFromIndex, flippedToIndex)
    const bottomIndex = Math.max(flippedFromIndex, flippedToIndex)
    return {
      y: margin.top + topIndex * stringGap - 12,
      height: (bottomIndex - topIndex) * stringGap + 24
    }
  }

  const mutedStrings = GUITAR_STRINGS.filter((stringId) => shape.stringStates[stringId].isMuted)
  const openStrings = GUITAR_STRINGS.filter(
    (stringId) => !shape.stringStates[stringId].isMuted && shape.stringStates[stringId].fret === 0
  )

  // Determine fret position label (show starting fret for movable shapes not at nut)
  const showFretPosition = shape.fretWindow.start > 0
  const fretPositionLabel = shape.fretWindow.start + 1

  return (
    <div className="fretboard-shell">
      <svg viewBox={`0 0 ${width} ${height}`} role="img" aria-label={`Chord diagram for ${shape.displayName}`}>
        {/* Background */}
        <rect x={0} y={0} width={width} height={height} rx={12} className="fretboard-bg" />

        {/* Frets - draw first so strings appear on top */}
        {Array.from({ length: fretCount + 1 }).map((_, index) => {
          const fretNumber = shape.fretWindow.start + index
          const x = margin.left + index * fretGap
          const isNut = shape.fretWindow.start === 0 && fretNumber === 0
          return (
            <line
              key={`fret-${fretNumber}`}
              x1={x}
              x2={x}
              y1={margin.top - 10}
              y2={height - margin.bottom + 10}
              className={isNut ? 'fretboard-nut' : 'fretboard-fret'}
            />
          )
        })}

        {/* Strings with varying thickness */}
        {GUITAR_STRINGS.map((stringId) => (
          <line
            key={`string-${stringId}`}
            x1={margin.left}
            x2={width - margin.right}
            y1={positionForString(stringId)}
            y2={positionForString(stringId)}
            className="fretboard-string"
            strokeWidth={STRING_THICKNESS[stringId]}
          />
        ))}

        {/* Barre (if present) */}
        {shape.barre && (() => {
          const box = stringsForBarre(shape.barre.fromString, shape.barre.toString)
          return (
            <rect
              x={positionForFret(shape.barre.fret) - 18}
              width={36}
              y={box.y}
              height={box.height}
              rx={16}
              className="barre"
              style={{ fill: shape.accentColor }}
            />
          )
        })()}

        {/* Finger dots with interval labels */}
        {shape.fingerPlacements.map((placement) => (
          <g key={`${placement.string}-${placement.fret}`} className="finger-group">
            <circle
              cx={positionForFret(placement.fret)}
              cy={positionForString(placement.string)}
              r={12}
              style={{ fill: placement.isRoot ? shape.accentColor : '#2d2235' }}
              className={placement.isRoot ? 'finger-dot root' : 'finger-dot'}
            />
            {placement.interval && (
              <text
                x={positionForFret(placement.fret)}
                y={positionForString(placement.string) + 4}
                className="finger-label"
              >
                {placement.interval}
              </text>
            )}
          </g>
        ))}

        {/* Open string indicators */}
        {openStrings.map((stringId) => (
          <g key={`open-${stringId}`}>
            <circle
              cx={margin.left - 20}
              cy={positionForString(stringId)}
              r={7}
              fill="none"
              stroke="rgba(250, 246, 240, 0.7)"
              strokeWidth={1.5}
            />
          </g>
        ))}

        {/* Muted string indicators */}
        {mutedStrings.map((stringId) => {
          const cx = margin.left - 20
          const cy = positionForString(stringId)
          const size = 5
          return (
            <g key={`mute-${stringId}`} className="mute-indicator">
              <line
                x1={cx - size}
                y1={cy - size}
                x2={cx + size}
                y2={cy + size}
                stroke="rgba(250, 246, 240, 0.45)"
                strokeWidth={2}
                strokeLinecap="round"
              />
              <line
                x1={cx + size}
                y1={cy - size}
                x2={cx - size}
                y2={cy + size}
                stroke="rgba(250, 246, 240, 0.45)"
                strokeWidth={2}
                strokeLinecap="round"
              />
            </g>
          )
        })}

        {/* Fret position indicator (for movable shapes) */}
        {showFretPosition && (
          <text
            x={margin.left + fretGap / 2}
            y={height - 12}
            className="fret-label"
          >
            {fretPositionLabel}fr
          </text>
        )}

        {/* String tuning labels on the right */}
        {GUITAR_STRINGS.map((stringId) => (
          <text
            key={`tuning-${stringId}`}
            x={width - 10}
            y={positionForString(stringId) + 4}
            className="string-label"
            textAnchor="end"
          >
            {STRING_TUNINGS[stringId].note}
          </text>
        ))}
      </svg>
    </div>
  )
}
