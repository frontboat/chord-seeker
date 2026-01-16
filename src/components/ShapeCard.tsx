import type { ChordQualityDefinition, RuntimeChordShape } from '../types/music'
import { Fretboard } from './Fretboard'

interface Props {
  shape: RuntimeChordShape
  quality: ChordQualityDefinition
  onPlay: (shape: RuntimeChordShape) => void
}

export function ShapeCard({ shape, quality, onPlay }: Props) {
  return (
    <article className="shape-card" style={{ borderColor: quality.accent }}>
      <header className="shape-card-header">
        <div>
          <p className="shape-tag">{quality.label}</p>
          <h3>{shape.displayName}</h3>
          <p className="shape-description">{shape.description}</p>
        </div>
        <button className="play-button" onClick={() => onPlay(shape)}>
          Play chord
        </button>
      </header>
      <Fretboard shape={shape} />
      <div className="instructions">
        <p className="instructions-title">String walkthrough</p>
        <ul>
          {shape.instructions.map((line, index) => (
            <li key={`${shape.instanceId}-line-${index}`}>{line}</li>
          ))}
        </ul>
      </div>
    </article>
  )
}
