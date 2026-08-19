import { SceneCanvas } from '@/features/scene'
import styles from './Viewport.module.css'

/**
 * Centre stage. Deliberately the largest and quietest region of the app, since
 * the render is the point and the interface is not.
 */
export function Viewport() {
  return (
    <main className={styles.viewport} aria-label="Viewport">
      <SceneCanvas />
    </main>
  )
}
