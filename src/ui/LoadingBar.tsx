import { cx } from '@/lib/cx'
import { useAppStore } from '@/state/store'
import styles from './LoadingBar.module.css'

/**
 * A thin bar across the top of the window, shown whenever the app is doing async
 * work — loading a texture, decoding an environment map, fetching a
 * documentation page, encoding an export.
 *
 * Indeterminate, and driven entirely by CSS. None of that work reports real
 * progress, so a percentage would be invented; and animating a fake percentage
 * in React would mean a state update every frame for a 2px decoration. The bar
 * is always mounted and simply fades, which also means no layout shift when it
 * appears.
 */
export function LoadingBar() {
  const busy = useAppStore((state) => state.ui.busyCount > 0)

  return (
    <div
      className={cx(styles.track, busy && styles.active)}
      role="progressbar"
      aria-label="Loading"
      aria-busy={busy}
      aria-hidden={!busy}
    >
      <div className={styles.bar} />
    </div>
  )
}
