import { Button, Icon } from '@/ui'
import type { MediaSource } from './schema'
import styles from './Dropzone.module.css'

export interface DropzoneContentProps {
  source: MediaSource
  loading: boolean
  onChoose: () => void
  onClear: () => void
}

/** The inside of the drop target: prompt when empty, summary when loaded. */
export function DropzoneContent({
  source,
  loading,
  onChoose,
  onClear,
}: DropzoneContentProps) {
  if (source.kind === 'none') {
    return (
      <>
        <Icon name="upload" size={20} className={styles.icon} />
        <p className={styles.title}>
          {loading ? 'Reading file…' : 'Drop a screenshot or recording'}
        </p>
        <p className={styles.hint}>
          PNG, JPG, WebP, MP4 or WebM — stays on your device
        </p>
        <Button size="sm" onClick={onChoose}>
          Choose file
        </Button>
      </>
    )
  }

  return (
    <>
      <Icon
        name={source.kind === 'video' ? 'video' : 'image'}
        size={18}
        className={styles.icon}
      />
      <p className={styles.title} title={source.name}>
        {source.name}
      </p>
      <p className={styles.hint}>
        {source.width} × {source.height}
      </p>
      <div className={styles.actions}>
        <Button size="sm" onClick={onChoose}>
          Replace
        </Button>
        <Button size="sm" variant="subtle" onClick={onClear}>
          Remove
        </Button>
      </div>
    </>
  )
}
