import { cx } from '@/lib/cx'
import { useAppStore } from '@/state/store'
import { Icon, Tooltip } from '@/ui'
import styles from './RecentUploads.module.css'

/**
 * Row of thumbnails for the last few uploads, so switching back to one the
 * user just replaced is a single click instead of re-picking the file.
 * Renders nothing until at least one upload has happened this session.
 */
export function RecentUploads() {
  const recents = useAppStore((state) => state.recentUploads)
  const currentUrl = useAppStore((state) =>
    state.media.source.kind === 'none' ? null : state.media.source.url,
  )
  const select = useAppStore((state) => state.selectRecentUpload)

  if (recents.length === 0) return null

  return (
    <div className={styles.wrap}>
      <p className={styles.label}>Recent</p>
      <div className={styles.row}>
        {recents.map((entry) => {
          const active = entry.url === currentUrl
          return (
            <Tooltip key={entry.id} label={entry.name}>
              <button
                type="button"
                className={cx(styles.thumb, active && styles.active)}
                onClick={() => select(entry.id)}
                aria-label={`Switch to ${entry.name}`}
                aria-pressed={active}
              >
                {entry.thumbnail ? (
                  <img src={entry.thumbnail} alt="" className={styles.image} />
                ) : (
                  <Icon name={entry.kind === 'video' ? 'video' : 'image'} size={16} />
                )}
              </button>
            </Tooltip>
          )
        })}
      </div>
    </div>
  )
}
