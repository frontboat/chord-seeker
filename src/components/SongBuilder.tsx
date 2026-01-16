import type { NoteId } from '../types/music'
import type { ChordProgression, AnimationSpeed } from '../types/progression'
import { SongBuilderPanel } from './SongBuilderPanel'

interface Props {
  isOpen: boolean
  onClose: () => void
  progression: ChordProgression | null
  rootNote: NoteId
  speed: AnimationSpeed
}

export function SongBuilder({ isOpen, onClose, progression, rootNote, speed }: Props) {
  return (
    <SongBuilderPanel
      isOpen={isOpen}
      onClose={onClose}
      progression={progression}
      rootNote={rootNote}
      speed={speed}
    />
  )
}
