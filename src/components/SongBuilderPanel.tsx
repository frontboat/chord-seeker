import { useState, useEffect, useMemo, useRef, useCallback } from 'react'
import type { GuitarString, NoteId } from '../types/music'
import type { ChordProgression, AnimationSpeed } from '../types/progression'
import type { ProgressionRiff, RiffStyle, TabSheet } from '../types/songBuilder'
import { TabDisplay } from './TabDisplay'
import { generateProgressionRiff, getAvailableNotesAtPosition, addRiffNote, removeRiffNote } from '../utils/riffGenerator'
import { riffToTabSheet } from '../utils/tabFormatter'
import { SongAudioEngine } from '../audio/songEngine'
import { SPEED_TO_BPM } from '../types/songBuilder'
import { QUALITY_MAP } from '../data/chordQualities'

interface Props {
  isOpen: boolean
  onClose: () => void
  progression: ChordProgression | null
  rootNote: NoteId
  speed: AnimationSpeed
}

const RIFF_STYLES: { id: RiffStyle; label: string; description: string }[] = [
  { id: 'melodic', label: 'Melodic', description: 'Single-note lines with passing tones' },
  { id: 'arpeggiated', label: 'Arpeggiated', description: 'Broken chord patterns' },
  { id: 'bass-driven', label: 'Bass-Driven', description: 'Root-focused low-end patterns' }
]

export function SongBuilderPanel({ isOpen, onClose, progression, rootNote, speed }: Props) {
  const [riffStyle, setRiffStyle] = useState<RiffStyle>('melodic')
  const [riff, setRiff] = useState<ProgressionRiff | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentMeasure, setCurrentMeasure] = useState(0)
  const [currentSubdivision, setCurrentSubdivision] = useState(0)
  const [editingPosition, setEditingPosition] = useState<{
    measureIndex: number
    subdivisionIndex: number
    stringId: GuitarString
  } | null>(null)

  const audioEngineRef = useRef<SongAudioEngine | null>(null)

  // Initialize audio engine
  useEffect(() => {
    if (!audioEngineRef.current) {
      audioEngineRef.current = new SongAudioEngine()
    }

    // Set up beat callback
    audioEngineRef.current.onBeat((measure, subdivision) => {
      setCurrentMeasure(measure)
      setCurrentSubdivision(subdivision)
    })

    return () => {
      audioEngineRef.current?.stop()
    }
  }, [])

  // Generate riff when progression, root, or style changes
  useEffect(() => {
    if (progression && isOpen) {
      const bpm = SPEED_TO_BPM[speed]
      const newRiff = generateProgressionRiff(progression, rootNote, riffStyle, bpm)
      setRiff(newRiff)
      setCurrentMeasure(0)
      setCurrentSubdivision(0)
      setIsPlaying(false)
      audioEngineRef.current?.stop()
    }
  }, [progression, rootNote, riffStyle, speed, isOpen])

  // Convert riff to tab sheet
  const tabSheet = useMemo<TabSheet | null>(() => {
    if (!riff) return null
    return riffToTabSheet(riff)
  }, [riff])

  // Handle regenerate
  const handleRegenerate = () => {
    if (!progression) return
    const bpm = SPEED_TO_BPM[speed]
    const newRiff = generateProgressionRiff(progression, rootNote, riffStyle, bpm)
    setRiff(newRiff)
    setCurrentMeasure(0)
    setCurrentSubdivision(0)

    if (isPlaying) {
      audioEngineRef.current?.stop()
      setIsPlaying(false)
    }
  }

  // Handle play/pause
  const handlePlayPause = () => {
    if (!riff || !tabSheet || !audioEngineRef.current) return

    if (isPlaying) {
      audioEngineRef.current.pause()
      setIsPlaying(false)
    } else {
      audioEngineRef.current.play(riff, tabSheet)
      setIsPlaying(true)
    }
  }

  // Handle stop
  const handleStop = () => {
    audioEngineRef.current?.stop()
    setIsPlaying(false)
    setCurrentMeasure(0)
    setCurrentSubdivision(0)
  }

  // Handle note click for editing
  const handleNoteClick = useCallback(
    (measureIndex: number, subdivisionIndex: number, stringId: GuitarString) => {
      if (!riff || !tabSheet) return

      const currentFret = tabSheet.measures[measureIndex]?.positions[stringId]?.[subdivisionIndex]

      if (currentFret !== null) {
        // Note exists - remove it
        const updatedRiff = removeRiffNote(
          riff,
          measureIndex,
          riff.chordRiffs[measureIndex].notes.find(
            (n) =>
              n.string === stringId &&
              Math.floor(n.startBeat * 2) === subdivisionIndex // Assuming 8 subdivisions for 4 beats
          )?.id || ''
        )
        setRiff(updatedRiff)
      } else {
        // No note - open picker
        setEditingPosition({ measureIndex, subdivisionIndex, stringId })
      }
    },
    [riff, tabSheet]
  )

  // Get available notes for current editing position
  const availableNotes = useMemo(() => {
    if (!editingPosition || !riff) return []

    const chordRiff = riff.chordRiffs[editingPosition.measureIndex]
    if (!chordRiff) return []

    return getAvailableNotesAtPosition(
      chordRiff.chordRoot,
      chordRiff.chordQuality,
      editingPosition.stringId
    )
  }, [editingPosition, riff])

  // Handle note selection from picker
  const handleNoteSelect = (note: { note: NoteId; fret: number }) => {
    if (!editingPosition || !riff) return

    const startBeat = editingPosition.subdivisionIndex / 2 // Convert subdivision to beat
    const updatedRiff = addRiffNote(
      riff,
      editingPosition.measureIndex,
      editingPosition.stringId,
      note.fret,
      startBeat,
      note.note
    )

    setRiff(updatedRiff)
    setEditingPosition(null)

    // Play the note for feedback
    audioEngineRef.current?.playNote({ string: editingPosition.stringId, fret: note.fret })
  }

  // Close panel and stop audio
  const handleClose = () => {
    audioEngineRef.current?.stop()
    setIsPlaying(false)
    onClose()
  }

  // Get current chord info
  const currentChordInfo = useMemo(() => {
    if (!riff || currentMeasure >= riff.chordRiffs.length) return null
    const chordRiff = riff.chordRiffs[currentMeasure]
    const qualityDef = QUALITY_MAP[chordRiff.chordQuality]
    return {
      name: `${chordRiff.chordRoot}${qualityDef?.shortLabel || ''}`,
      degree: chordRiff.chordDegree
    }
  }, [riff, currentMeasure])

  if (!isOpen) return null

  return (
    <>
      {/* Backdrop */}
      <div className="song-builder-backdrop" onClick={handleClose} />

      {/* Panel */}
      <div className={`song-builder-panel ${isOpen ? 'open' : ''}`}>
        {/* Header */}
        <div className="song-builder-header">
          <h2 className="song-builder-title">Song Builder</h2>
          <button className="song-builder-close" onClick={handleClose}>
            &times;
          </button>
        </div>

        {/* Content */}
        <div className="song-builder-content">
          {!progression ? (
            <div className="song-builder-empty">
              <p>Select a chord progression to get started</p>
            </div>
          ) : (
            <>
              {/* Current chord indicator */}
              {currentChordInfo && (
                <div className="song-builder-current-chord">
                  <span className="current-chord-label">Now Playing:</span>
                  <span className="current-chord-name">{currentChordInfo.name}</span>
                  <span className="current-chord-degree">({currentChordInfo.degree})</span>
                </div>
              )}

              {/* Style selector */}
              <div className="song-builder-controls">
                <div className="style-selector">
                  <label className="style-label">Riff Style:</label>
                  <div className="style-options">
                    {RIFF_STYLES.map((style) => (
                      <button
                        key={style.id}
                        className={`style-btn ${riffStyle === style.id ? 'active' : ''}`}
                        onClick={() => setRiffStyle(style.id)}
                        title={style.description}
                      >
                        {style.label}
                      </button>
                    ))}
                  </div>
                </div>

                <button className="regenerate-btn" onClick={handleRegenerate}>
                  Regenerate
                </button>
              </div>

              {/* Tab display */}
              {tabSheet && (
                <div className="song-builder-tab-section">
                  <h3 className="tab-section-title">Guitar Tab</h3>
                  <p className="tab-section-hint">Click on positions to add or remove notes</p>
                  <TabDisplay
                    tabSheet={tabSheet}
                    currentMeasure={currentMeasure}
                    currentSubdivision={currentSubdivision}
                    onNoteClick={handleNoteClick}
                  />
                </div>
              )}

              {/* Note picker popup */}
              {editingPosition && (
                <div className="note-picker-overlay" onClick={() => setEditingPosition(null)}>
                  <div className="note-picker" onClick={(e) => e.stopPropagation()}>
                    <h4 className="note-picker-title">Select Note</h4>
                    <div className="note-picker-options">
                      {availableNotes.map((note) => (
                        <button
                          key={`${note.note}-${note.fret}`}
                          className={`note-picker-btn ${note.interval ? 'chord-tone' : ''}`}
                          onClick={() => handleNoteSelect(note)}
                        >
                          <span className="note-picker-note">{note.note}</span>
                          <span className="note-picker-fret">fret {note.fret}</span>
                          {note.interval && (
                            <span className="note-picker-interval">{note.interval}</span>
                          )}
                        </button>
                      ))}
                    </div>
                    <button
                      className="note-picker-cancel"
                      onClick={() => setEditingPosition(null)}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              {/* Playback controls */}
              <div className="song-builder-playback">
                <div className="playback-controls">
                  <button className="playback-btn stop" onClick={handleStop} title="Stop">
                    <span className="stop-icon" />
                  </button>
                  <button
                    className={`playback-btn play-pause ${isPlaying ? 'playing' : ''}`}
                    onClick={handlePlayPause}
                    title={isPlaying ? 'Pause' : 'Play'}
                  >
                    {isPlaying ? (
                      <span className="pause-icon" />
                    ) : (
                      <span className="play-icon" />
                    )}
                  </button>
                </div>

                <div className="playback-info">
                  <span className="bpm-display">{SPEED_TO_BPM[speed]} BPM</span>
                  <span className="measure-display">
                    Measure {currentMeasure + 1} / {tabSheet?.measures.length || 0}
                  </span>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  )
}
