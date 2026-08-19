import { EmptyState } from '@/ui'
import styles from './Viewport.module.css'

/**
 * Centre stage. The 3D canvas mounts here in P2 — deliberately the largest and
 * quietest region of the app, since the render is the point and the UI is not.
 */
export function Viewport() {
  return (
    <main className={styles.viewport} aria-label="Viewport">
      <EmptyState
        icon="camera"
        title="3D viewport"
        description="The studio scene renders here."
      />
    </main>
  )
}
