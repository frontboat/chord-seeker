import type { ChordQuality, NoteId } from '../types/music'

interface Props {
  currentRoot: NoteId
  currentQuality: ChordQuality
  onRootChange: (note: NoteId) => void
  onQualityChange: (quality: ChordQuality) => void
}

// Circle of fifths order (clockwise)
const CIRCLE_NOTES: NoteId[] = ['C', 'G', 'D', 'A', 'E', 'B', 'F#', 'C#', 'G#', 'D#', 'A#', 'F']

// Relative minor for each major key
const RELATIVE_MINORS: Record<NoteId, NoteId> = {
  'C': 'A',
  'G': 'E',
  'D': 'B',
  'A': 'F#',
  'E': 'C#',
  'B': 'G#',
  'F#': 'D#',
  'C#': 'A#',
  'G#': 'F',
  'D#': 'C',
  'A#': 'G',
  'F': 'D'
}

export function CircleOfFifths({ currentRoot, currentQuality, onRootChange, onQualityChange }: Props) {
  const centerX = 250
  const centerY = 250
  const outerRadius = 180
  const innerRadius = 120
  const labelRadius = 155
  const innerLabelRadius = 95

  const isMajorQuality = ['major', 'major7', 'dominant7', 'add9', 'augmented'].includes(currentQuality)

  const angleStep = (2 * Math.PI) / 12
  const startAngle = -Math.PI / 2 // Start at top

  const getPosition = (index: number, radius: number) => {
    const angle = startAngle + index * angleStep
    return {
      x: centerX + radius * Math.cos(angle),
      y: centerY + radius * Math.sin(angle)
    }
  }

  const handleMajorClick = (note: NoteId) => {
    onRootChange(note)
    if (!isMajorQuality) {
      onQualityChange('major')
    }
  }

  const handleMinorClick = (note: NoteId) => {
    onRootChange(note)
    if (isMajorQuality) {
      onQualityChange('minor')
    }
  }

  return (
    <section className="circle-of-fifths-section">
      <h2 className="circle-title">Circle of Fifths</h2>
      <p className="circle-subtitle">Click any key to change the root note</p>

      <div className="circle-container">
        <svg viewBox="0 0 500 500" className="circle-svg">
          {/* Background circle */}
          <circle cx={centerX} cy={centerY} r={outerRadius + 20} className="circle-bg" />

          {/* Draw segments for major keys (outer ring) */}
          {CIRCLE_NOTES.map((note, index) => {
            const angle1 = startAngle + index * angleStep - angleStep / 2
            const angle2 = startAngle + index * angleStep + angleStep / 2

            const outer1 = {
              x: centerX + outerRadius * Math.cos(angle1),
              y: centerY + outerRadius * Math.sin(angle1)
            }
            const outer2 = {
              x: centerX + outerRadius * Math.cos(angle2),
              y: centerY + outerRadius * Math.sin(angle2)
            }
            const inner1 = {
              x: centerX + innerRadius * Math.cos(angle1),
              y: centerY + innerRadius * Math.sin(angle1)
            }
            const inner2 = {
              x: centerX + innerRadius * Math.cos(angle2),
              y: centerY + innerRadius * Math.sin(angle2)
            }

            const isActive = note === currentRoot && isMajorQuality
            const pathData = `
              M ${outer1.x} ${outer1.y}
              A ${outerRadius} ${outerRadius} 0 0 1 ${outer2.x} ${outer2.y}
              L ${inner2.x} ${inner2.y}
              A ${innerRadius} ${innerRadius} 0 0 0 ${inner1.x} ${inner1.y}
              Z
            `

            return (
              <g key={`major-${note}`}>
                <path
                  d={pathData}
                  className={`circle-segment major-segment ${isActive ? 'active' : ''}`}
                  onClick={() => handleMajorClick(note)}
                />
              </g>
            )
          })}

          {/* Draw segments for minor keys (inner ring) */}
          {CIRCLE_NOTES.map((majorNote, index) => {
            const minorNote = RELATIVE_MINORS[majorNote]
            const angle1 = startAngle + index * angleStep - angleStep / 2
            const angle2 = startAngle + index * angleStep + angleStep / 2

            const inner1 = {
              x: centerX + innerRadius * Math.cos(angle1),
              y: centerY + innerRadius * Math.sin(angle1)
            }
            const inner2 = {
              x: centerX + innerRadius * Math.cos(angle2),
              y: centerY + innerRadius * Math.sin(angle2)
            }
            const center1 = {
              x: centerX + 40 * Math.cos(angle1),
              y: centerY + 40 * Math.sin(angle1)
            }
            const center2 = {
              x: centerX + 40 * Math.cos(angle2),
              y: centerY + 40 * Math.sin(angle2)
            }

            const isActive = minorNote === currentRoot && !isMajorQuality
            const pathData = `
              M ${inner1.x} ${inner1.y}
              A ${innerRadius} ${innerRadius} 0 0 1 ${inner2.x} ${inner2.y}
              L ${center2.x} ${center2.y}
              A 40 40 0 0 0 ${center1.x} ${center1.y}
              Z
            `

            return (
              <g key={`minor-${minorNote}`}>
                <path
                  d={pathData}
                  className={`circle-segment minor-segment ${isActive ? 'active' : ''}`}
                  onClick={() => handleMinorClick(minorNote)}
                />
              </g>
            )
          })}

          {/* Labels for major keys */}
          {CIRCLE_NOTES.map((note, index) => {
            const pos = getPosition(index, labelRadius)
            const isActive = note === currentRoot && isMajorQuality
            return (
              <text
                key={`label-major-${note}`}
                x={pos.x}
                y={pos.y}
                className={`circle-label major-label ${isActive ? 'active' : ''}`}
                textAnchor="middle"
                dominantBaseline="middle"
                onClick={() => handleMajorClick(note)}
              >
                {note}
              </text>
            )
          })}

          {/* Labels for minor keys */}
          {CIRCLE_NOTES.map((majorNote, index) => {
            const minorNote = RELATIVE_MINORS[majorNote]
            const pos = getPosition(index, innerLabelRadius)
            const isActive = minorNote === currentRoot && !isMajorQuality
            return (
              <text
                key={`label-minor-${minorNote}`}
                x={pos.x}
                y={pos.y}
                className={`circle-label minor-label ${isActive ? 'active' : ''}`}
                textAnchor="middle"
                dominantBaseline="middle"
                onClick={() => handleMinorClick(minorNote)}
              >
                {minorNote}m
              </text>
            )
          })}

          {/* Center circle with current key */}
          <circle cx={centerX} cy={centerY} r={35} className="circle-center" />
          <text
            x={centerX}
            y={centerY - 5}
            className="circle-center-text"
            textAnchor="middle"
            dominantBaseline="middle"
          >
            {currentRoot}
          </text>
          <text
            x={centerX}
            y={centerY + 15}
            className="circle-center-quality"
            textAnchor="middle"
            dominantBaseline="middle"
          >
            {isMajorQuality ? 'Major' : 'Minor'}
          </text>
        </svg>

        {/* Legend */}
        <div className="circle-legend">
          <div className="legend-item">
            <div className="legend-color major-color"></div>
            <span>Major Keys (Outer Ring)</span>
          </div>
          <div className="legend-item">
            <div className="legend-color minor-color"></div>
            <span>Minor Keys (Inner Ring)</span>
          </div>
        </div>
      </div>
    </section>
  )
}
