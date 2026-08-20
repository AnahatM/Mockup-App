import { useAppStore } from '@/state/store'
import styles from './NavigationHint.module.css'

/**
 * A compact, always-visible reminder of the current navigation gestures.
 * Shown only in fly mode: orbit's gestures are the same drag/scroll/right-
 * drag idiom most people already know, and the toolbar spells out its own
 * buttons, but WASD/Q/E for fly mode is not discoverable just by looking at
 * an empty viewport.
 *
 * Plain DOM, not a three.js gizmo — it sits beside the `<canvas>`, not inside
 * the scene graph `capturePng`/`recordWebm` read pixels from (see
 * `features/scene/SceneCanvas.tsx`, which mounts this as a sibling of
 * `<Canvas>`). That makes it structurally impossible for an export to pick
 * up, unlike the 3D gizmos, which need a runtime `visible` guard for the
 * same guarantee because they live in the scene itself.
 */
export function NavigationHint() {
  const mode = useAppStore((state) => state.camera.mode)
  if (mode !== 'fly') return null

  return (
    <p className={styles.hint} aria-live="polite">
      <kbd>WASD</kbd> move · <kbd>Q</kbd>/<kbd>E</kbd> up/down · drag look · scroll forward/back
    </p>
  )
}
