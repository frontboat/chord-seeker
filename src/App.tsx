import { useMemo, useRef, useState } from 'react'
import { ChordControls } from './components/ChordControls'
import { ShapeCard } from './components/ShapeCard'
import { NOTE_OPTIONS } from './data/notes'
import { CHORD_QUALITIES, QUALITY_MAP } from './data/chordQualities'
import { buildChordShapes, formatChordName } from './utils/chordUtils'
import type { ChordQuality, NoteId, RuntimeChordShape } from './types/music'
import { ChordAudioEngine, orderNotesForStrum } from './audio/engine'

export default function App() {
  const [root, setRoot] = useState<NoteId>('E')
  const [quality, setQuality] = useState<ChordQuality>('minor')
  const engineRef = useRef<ChordAudioEngine | null>(null)

  if (!engineRef.current) {
    engineRef.current = new ChordAudioEngine()
  }

  const shapes = useMemo(() => buildChordShapes(root, quality), [root, quality])
  const qualityDef = QUALITY_MAP[quality]
  const chordLabel = formatChordName(root, quality)

  const handlePlay = (shape: RuntimeChordShape) => {
    const orderedNotes = orderNotesForStrum(shape.notesForAudio)
    engineRef.current?.play(orderedNotes)
  }

  return (
    <div className="app-shell">
      <header className="hero">
        <p className="eyebrow">Chord Seeker</p>
        <h1>Neon chord atlas</h1>
        <p className="lead">
          Visualize every chord quality as a movable guitar shape, then strum it with a
          synthetic glow.
        </p>
      </header>

      <ChordControls
        root={root}
        quality={quality}
        noteOptions={NOTE_OPTIONS}
        chordQualities={CHORD_QUALITIES}
        onRootChange={setRoot}
        onQualityChange={setQuality}
      />

      <section className="quality-panel" style={{ borderColor: qualityDef.accent }}>
        <div>
          <h2>{chordLabel}</h2>
          <p>{qualityDef.description}</p>
        </div>
        <div className="interval-list">
          {qualityDef.intervals.map((interval) => (
            <span key={interval}>{interval}</span>
          ))}
        </div>
      </section>

      <section className="shape-grid">
        {shapes.length ? (
          shapes.map((shape) => (
            <ShapeCard key={shape.instanceId} shape={shape} quality={qualityDef} onPlay={handlePlay} />
          ))
        ) : (
          <p className="empty-state">No shapes available for this selection yet.</p>
        )}
      </section>
    </div>
  )
}
