import { useMemo, useRef, useState } from 'react'
import { ChordControls } from './components/ChordControls'
import { ShapeCard } from './components/ShapeCard'
import { TriadExplorer } from './components/TriadExplorer'
import { NOTE_OPTIONS } from './data/notes'
import { CHORD_QUALITIES, QUALITY_MAP } from './data/chordQualities'
import { buildChordShapes } from './utils/chordUtils'
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

  const handlePlay = (shape: RuntimeChordShape) => {
    const orderedNotes = orderNotesForStrum(shape.notesForAudio)
    engineRef.current?.play(orderedNotes)
  }

  const handleRootChange = (note: NoteId) => {
    setRoot(note)
  }

  const handleQualityChange = (nextQuality: ChordQuality) => {
    setQuality(nextQuality)
  }

  return (
    <div className="app-shell">
      <header className="app-header">
        <h1 className="app-title">Chord Seeker</h1>
        <p className="app-subtitle">Explore guitar chord shapes and voicings</p>
      </header>

      <ChordControls
        root={root}
        quality={quality}
        noteOptions={NOTE_OPTIONS}
        chordQualities={CHORD_QUALITIES}
        onRootChange={handleRootChange}
        onQualityChange={handleQualityChange}
      />

      <section className="shape-grid">
        {shapes.length ? (
          shapes.map((shape) => (
            <ShapeCard
              key={shape.instanceId}
              shape={shape}
              quality={qualityDef}
              onPlay={handlePlay}
            />
          ))
        ) : (
          <p className="empty-state">No shapes available for this chord yet.</p>
        )}
      </section>

      <TriadExplorer root={root} quality={quality} audioEngine={engineRef.current} />
    </div>
  )
}
