import type { ChordQuality, ChordQualityDefinition, NoteId, NoteOption } from '../types/music'

interface Props {
  root: NoteId
  quality: ChordQuality
  noteOptions: NoteOption[]
  chordQualities: ChordQualityDefinition[]
  onRootChange: (note: NoteId) => void
  onQualityChange: (quality: ChordQuality) => void
}

export function ChordControls({
  root,
  quality,
  noteOptions,
  chordQualities,
  onRootChange,
  onQualityChange
}: Props) {
  return (
    <section className="control-panel">
      <div className="control">
        <label htmlFor="root-select">Root note</label>
        <select
          id="root-select"
          value={root}
          onChange={(event) => onRootChange(event.target.value as NoteId)}
        >
          {noteOptions.map((option) => (
            <option key={option.id} value={option.id}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
      <div className="control">
        <label htmlFor="quality-select">Chord quality</label>
        <select
          id="quality-select"
          value={quality}
          onChange={(event) => onQualityChange(event.target.value as ChordQuality)}
        >
          {chordQualities.map((qualityDef) => (
            <option key={qualityDef.id} value={qualityDef.id}>
              {qualityDef.label}
            </option>
          ))}
        </select>
      </div>
    </section>
  )
}
