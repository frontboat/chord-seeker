import { useEffect, useState } from 'react'
import type { ChordQuality, NoteId } from '../types/music'
import type { AnimationSpeed, AnimationState, TriadPosition } from '../types/triad'
import type { ChordAudioEngine } from '../audio/engine'
import { orderNotesForStrum } from '../audio/engine'
import { QUALITY_MAP } from '../data/chordQualities'
import { generateTriadPositions } from '../utils/triadUtils'
import { TriadNeck } from './TriadNeck'
import { TriadControls } from './TriadControls'

interface Props {
  root: NoteId
  quality: ChordQuality
  audioEngine: ChordAudioEngine | null
}

const SPEED_INTERVALS: Record<AnimationSpeed, number> = {
  slow: 2000,
  medium: 1000,
  fast: 500
}

export function TriadExplorer({ root, quality, audioEngine }: Props) {
  const [positions, setPositions] = useState<TriadPosition[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [animationState, setAnimationState] = useState<AnimationState>('paused')
  const [speed, setSpeed] = useState<AnimationSpeed>('medium')
  const [enableAudio, setEnableAudio] = useState(false)

  const qualityDef = QUALITY_MAP[quality]
  const currentPosition = positions[currentIndex] || null

  // Regenerate positions when root or quality changes
  useEffect(() => {
    const newPositions = generateTriadPositions(root, quality)
    setPositions(newPositions)
    setCurrentIndex(0)
    setAnimationState('paused')
  }, [root, quality])

  // Auto-advance timer
  useEffect(() => {
    if (animationState !== 'playing' || positions.length <= 1) {
      return
    }

    const interval = setInterval(() => {
      setCurrentIndex((prev) => {
        const next = prev + 1
        // Loop back to start when reaching the end
        if (next >= positions.length) {
          return 0
        }
        return next
      })
    }, SPEED_INTERVALS[speed])

    return () => clearInterval(interval)
  }, [animationState, speed, positions.length])

  // Audio playback when position changes (if enabled)
  useEffect(() => {
    if (!enableAudio || !audioEngine || !currentPosition) {
      return
    }

    const notesToPlay = currentPosition.notes.map((note) => ({
      string: note.string,
      fret: note.fret
    }))

    const orderedNotes = orderNotesForStrum(notesToPlay)
    audioEngine.play(orderedNotes)
  }, [currentIndex, enableAudio, audioEngine, currentPosition])

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1)
    }
  }

  const handleNext = () => {
    if (currentIndex < positions.length - 1) {
      setCurrentIndex(currentIndex + 1)
    }
  }

  const handlePlayPause = () => {
    setAnimationState((prev) => (prev === 'playing' ? 'paused' : 'playing'))
  }

  const handleSpeedChange = (newSpeed: AnimationSpeed) => {
    setSpeed(newSpeed)
  }

  const handleAudioToggle = (enabled: boolean) => {
    setEnableAudio(enabled)
  }

  // Show empty state if no positions
  if (positions.length === 0) {
    return (
      <section className="triad-explorer">
        <h2 className="triad-title">Triad Explorer</h2>
        <p className="triad-empty-state">No triads found for this chord</p>
      </section>
    )
  }

  return (
    <section className="triad-explorer">
      <h2 className="triad-title">Triad Explorer</h2>
      <p className="triad-subtitle">
        All {positions.length} playable 3-note voicings across the neck
      </p>

      <TriadNeck
        position={currentPosition}
        primaryColor={qualityDef.color}
        accentColor={qualityDef.accent}
      />

      <TriadControls
        currentIndex={currentIndex}
        totalPositions={positions.length}
        animationState={animationState}
        speed={speed}
        enableAudio={enableAudio && audioEngine !== null}
        onPrevious={handlePrevious}
        onNext={handleNext}
        onPlayPause={handlePlayPause}
        onSpeedChange={handleSpeedChange}
        onAudioToggle={handleAudioToggle}
      />
    </section>
  )
}
