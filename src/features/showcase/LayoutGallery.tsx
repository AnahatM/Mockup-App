import { cx } from '@/lib/cx'
import { useAppStore } from '@/state/store'
import { LayoutThumbnail } from './LayoutThumbnail'
import { LAYOUT_LABELS } from './layoutDesigns'
import { deviceCountFor } from './layoutMath'
import { SHOWCASE_LAYOUTS, type ShowcaseLayoutId } from './schema'
import styles from './LayoutGallery.module.css'

function selectLayout(id: ShowcaseLayoutId): void {
  useAppStore.setState((draft) => {
    draft.showcase.layout = id
  })
}

/**
 * The layout picker as a gallery of live thumbnails, not a dropdown of
 * names — a spatial arrangement cannot be chosen from a word. Each thumbnail
 * is drawn by the same `layoutSlots` maths the real export uses.
 */
export function LayoutGallery() {
  const selected = useAppStore((state) => state.showcase.layout)

  return (
    <div className={styles.grid}>
      {SHOWCASE_LAYOUTS.map((id) => {
        const count = deviceCountFor(id)
        return (
          <button
            key={id}
            type="button"
            className={cx(styles.card, id === selected && styles.selected)}
            aria-pressed={id === selected}
            onClick={() => selectLayout(id)}
          >
            <LayoutThumbnail layout={id} />
            <span className={styles.label}>{LAYOUT_LABELS[id]}</span>
            <span className={styles.count}>
              {count} device{count > 1 ? 's' : ''}
            </span>
          </button>
        )
      })}
    </div>
  )
}
