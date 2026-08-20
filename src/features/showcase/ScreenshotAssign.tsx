import { cx } from '@/lib/cx'
import type { RecentUpload } from '@/features/media'
import { useAppStore } from '@/state/store'
import { Icon, Tooltip } from '@/ui'
import { deviceCountFor } from './layoutMath'
import styles from './ScreenshotAssign.module.css'

function setSlotScreenshot(index: number, id: string | null): void {
  useAppStore.setState((draft) => {
    const next = [...draft.showcase.screenshotIds]
    while (next.length <= index) next.push(null)
    next[index] = id
    draft.showcase.screenshotIds = next
  })
}

interface SlotRowProps {
  index: number
  selected: string | null
  recents: readonly RecentUpload[]
}

function SlotRow({ index, selected, recents }: SlotRowProps) {
  return (
    <div className={styles.row}>
      <span className={styles.label}>Device {index + 1}</span>
      <div className={styles.thumbs}>
        <Tooltip label="Live screenshot">
          <button
            type="button"
            className={cx(styles.thumb, selected === null && styles.active)}
            aria-pressed={selected === null}
            onClick={() => setSlotScreenshot(index, null)}
          >
            <Icon name="image" size={14} />
          </button>
        </Tooltip>
        {recents.map((entry) => (
          <Tooltip key={entry.id} label={entry.name}>
            <button
              type="button"
              className={cx(styles.thumb, selected === entry.id && styles.active)}
              aria-pressed={selected === entry.id}
              onClick={() => setSlotScreenshot(index, entry.id)}
            >
              <img src={entry.thumbnail} alt="" className={styles.image} />
            </button>
          </Tooltip>
        ))}
      </div>
    </div>
  )
}

/**
 * Assigns which screenshot each device slot shows: "Live" (whatever is
 * currently loaded) by default, or any remembered upload. Only appears once
 * there is a real choice to make — a second upload and a multi-device
 * layout — since with one screenshot every slot already shares it.
 */
export function ScreenshotAssign() {
  const layout = useAppStore((state) => state.showcase.layout)
  const assigned = useAppStore((state) => state.showcase.screenshotIds)
  const recents = useAppStore((state) => state.recentUploads)
  const count = deviceCountFor(layout)

  if (recents.length < 2 || count < 2) return null

  return (
    <div className={styles.wrap}>
      {Array.from({ length: count }, (_, index) => (
        <SlotRow key={index} index={index} selected={assigned[index] ?? null} recents={recents} />
      ))}
    </div>
  )
}
