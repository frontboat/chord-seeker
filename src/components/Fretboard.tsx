import { GUITAR_STRINGS } from '../data/notes'
import type { RuntimeChordShape } from '../types/music'

interface Props {
  shape: RuntimeChordShape
}

const fretGap = 56
const stringGap = 28
const margin = { left: 60, right: 30, top: 28, bottom: 44 }

export function Fretboard({ shape }: Props) {
  const fretCount = shape.fretWindow.end - shape.fretWindow.start + 1
  const width = margin.left + margin.right + fretCount * fretGap
  const height = margin.top + margin.bottom + (GUITAR_STRINGS.length - 1) * stringGap

  const positionForFret = (fret: number) =>
    margin.left + (fret - shape.fretWindow.start + 0.5) * fretGap

  const positionForString = (stringId: number) => {
    const index = GUITAR_STRINGS.indexOf(stringId as (typeof GUITAR_STRINGS)[number])
    return margin.top + index * stringGap
  }

  const stringsForBarre = (from: number, to: number) => {
    const fromIndex = GUITAR_STRINGS.indexOf(from as (typeof GUITAR_STRINGS)[number])
    const toIndex = GUITAR_STRINGS.indexOf(to as (typeof GUITAR_STRINGS)[number])
    const topIndex = Math.min(fromIndex, toIndex)
    const bottomIndex = Math.max(fromIndex, toIndex)
    return {
      y: margin.top + topIndex * stringGap - 12,
      height: (bottomIndex - topIndex) * stringGap + 24
    }
  }

  const mutedStrings = GUITAR_STRINGS.filter((stringId) => shape.stringStates[stringId].isMuted)
  const openStrings = GUITAR_STRINGS.filter(
    (stringId) => !shape.stringStates[stringId].isMuted && shape.stringStates[stringId].fret === 0
  )

  return (
    <div className="fretboard-shell">
      <svg viewBox={`0 0 ${width} ${height}`} role="img" aria-label="Chord diagram">
        <rect x={0} y={0} width={width} height={height} rx={18} className="fretboard-bg" />
        {GUITAR_STRINGS.map((stringId) => (
          <line
            key={`string-${stringId}`}
            x1={margin.left}
            x2={width - margin.right}
            y1={positionForString(stringId)}
            y2={positionForString(stringId)}
            className="fretboard-string"
          />
        ))}
        {Array.from({ length: fretCount + 1 }).map((_, index) => {
          const fretNumber = shape.fretWindow.start + index
          const x = margin.left + index * fretGap
          const isNut = shape.fretWindow.start === 0 && fretNumber === 0
          return (
            <line
              key={`fret-${fretNumber}`}
              x1={x}
              x2={x}
              y1={margin.top - 14}
              y2={height - margin.bottom + 14}
              className={isNut ? 'fretboard-nut' : 'fretboard-fret'}
              strokeWidth={isNut ? 6 : 2}
            />
          )
        })}
        {shape.barre && (() => {
          const box = stringsForBarre(shape.barre.fromString, shape.barre.toString)
          return (
            <rect
              x={positionForFret(shape.barre.fret) - 20}
              width={40}
              y={box.y}
              height={box.height}
              rx={18}
              className="barre"
              style={{ fill: shape.accentColor }}
            />
          )
        })()}
        {shape.fingerPlacements.map((placement) => (
          <g key={`${placement.string}-${placement.fret}`} className="finger-group">
            <circle
              cx={positionForFret(placement.fret)}
              cy={positionForString(placement.string)}
              r={13}
              style={{ fill: placement.isRoot ? shape.accentColor : '#1b113b' }}
              className={placement.isRoot ? 'finger-dot root' : 'finger-dot'}
            />
            {placement.interval && (
              <text
                x={positionForFret(placement.fret)}
                y={positionForString(placement.string) + 4}
                className="finger-label"
                textAnchor="middle"
              >
                {placement.interval}
              </text>
            )}
          </g>
        ))}
        {openStrings.map((stringId) => (
          <text
            key={`open-${stringId}`}
            x={margin.left - 28}
            y={positionForString(stringId) + 4}
            className="open-indicator"
          >
            O
          </text>
        ))}
        {mutedStrings.map((stringId) => (
          <text
            key={`mute-${stringId}`}
            x={margin.left - 28}
            y={positionForString(stringId) + 4}
            className="mute-indicator"
          >
            X
          </text>
        ))}
        {Array.from({ length: fretCount }).map((_, index) => {
          const fretNumber = shape.fretWindow.start + index + 1
          if (fretNumber === 1) {
            return null
          }
          return (
            <text
              key={`label-${fretNumber}`}
              x={margin.left + index * fretGap + fretGap / 2}
              y={height - 14}
              className="fret-label"
            >
              {fretNumber}
            </text>
          )
        })}
      </svg>
    </div>
  )
}
