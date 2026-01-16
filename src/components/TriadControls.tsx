import type { AnimationSpeed, AnimationState } from '../types/triad'

interface Props {
  currentIndex: number
  totalPositions: number
  animationState: AnimationState
  speed: AnimationSpeed
  enableAudio: boolean
  onPrevious: () => void
  onNext: () => void
  onPlayPause: () => void
  onSpeedChange: (speed: AnimationSpeed) => void
  onAudioToggle: (enabled: boolean) => void
}

export function TriadControls({
  currentIndex,
  totalPositions,
  animationState,
  speed,
  enableAudio,
  onPrevious,
  onNext,
  onPlayPause,
  onSpeedChange,
  onAudioToggle
}: Props) {
  const progress = totalPositions > 0 ? ((currentIndex + 1) / totalPositions) * 100 : 0
  const hasPositions = totalPositions > 0
  const hasSinglePosition = totalPositions === 1

  return (
    <div className="triad-controls">
      {/* Position indicator and progress bar */}
      <div className="triad-progress-section">
        <div className="triad-position-indicator">
          Position {currentIndex + 1} of {totalPositions}
        </div>
        <div className="triad-progress-bar">
          <div
            className="triad-progress-fill"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Navigation and playback controls */}
      <div className="triad-nav-controls">
        <button
          className="triad-btn triad-btn-nav"
          onClick={onPrevious}
          disabled={!hasPositions || currentIndex === 0}
          aria-label="Previous position"
        >
          Previous
        </button>

        <button
          className="triad-btn triad-btn-play"
          onClick={onPlayPause}
          disabled={!hasPositions || hasSinglePosition}
          aria-label={animationState === 'playing' ? 'Pause' : 'Play'}
        >
          {animationState === 'playing' ? 'Pause' : 'Play'}
        </button>

        <button
          className="triad-btn triad-btn-nav"
          onClick={onNext}
          disabled={!hasPositions || currentIndex === totalPositions - 1}
          aria-label="Next position"
        >
          Next
        </button>
      </div>

      {/* Speed selector */}
      <div className="triad-speed-section">
        <label className="triad-label">Speed:</label>
        <div className="triad-speed-group">
          <button
            className={`triad-btn triad-btn-speed ${speed === 'slow' ? 'active' : ''}`}
            onClick={() => onSpeedChange('slow')}
            disabled={!hasPositions}
          >
            Slow
          </button>
          <button
            className={`triad-btn triad-btn-speed ${speed === 'medium' ? 'active' : ''}`}
            onClick={() => onSpeedChange('medium')}
            disabled={!hasPositions}
          >
            Medium
          </button>
          <button
            className={`triad-btn triad-btn-speed ${speed === 'fast' ? 'active' : ''}`}
            onClick={() => onSpeedChange('fast')}
            disabled={!hasPositions}
          >
            Fast
          </button>
        </div>
      </div>

      {/* Audio toggle */}
      <div className="triad-audio-section">
        <label className="triad-audio-label">
          <input
            type="checkbox"
            checked={enableAudio}
            onChange={(e) => onAudioToggle(e.target.checked)}
            disabled={!hasPositions}
            className="triad-audio-checkbox"
          />
          <span>Play audio</span>
        </label>
      </div>
    </div>
  )
}
