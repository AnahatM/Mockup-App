import { useEffect, useState } from 'react'
import { useProgress } from '@react-three/drei'
import { cx } from '@/lib/cx'
import { Spinner } from '@/ui'
import styles from './SceneLoading.module.css'

/**
 * Force-dismiss after this long even if readiness never resolves. A stuck
 * spinner covering the whole viewport forever is a worse failure than
 * revealing a scene a beat before it is technically finished — this is the
 * safety valve for a loader that stalls, errors silently, or a future signal
 * that never fires.
 */
const SAFETY_TIMEOUT_MS = 8000

export interface SceneLoadingProps {
  /** Has react-three-fiber drawn at least one real frame yet? */
  framePainted: boolean
}

/**
 * Covers the canvas until the studio has genuinely rendered something, then
 * fades away — so the first paint is the "preparing" state instead of a void.
 *
 * "Ready" is two independent signals, ANDed:
 *
 *  - `framePainted` (see `FramePainted`), true the moment the render loop has
 *    drawn a frame with the Stage tree committed. On every load today this is
 *    the actual bottleneck: building the procedural device, compiling shaders
 *    for the postprocessing chain — none of it async, none of it routed
 *    through Suspense.
 *  - drei's `useProgress`, which mirrors `THREE.DefaultLoadingManager`.
 *    Nothing loads through it on the default scene, but the moment a user
 *    picks a real HDRI (`LightRig`'s `<Environment files=.../>` branch, which
 *    *does* suspend inside Stage's own `<Suspense>`), the manager reports
 *    `active` until that file has decoded. Reading it here — outside the
 *    Canvas entirely — means this overlay reacts correctly to that case too,
 *    without ever needing to reach inside Stage's boundary.
 */
export function SceneLoading({ framePainted }: SceneLoadingProps) {
  const { active } = useProgress()
  const [timedOut, setTimedOut] = useState(false)
  const ready = framePainted && !active

  useEffect(() => {
    if (ready) return
    const id = window.setTimeout(() => setTimedOut(true), SAFETY_TIMEOUT_MS)
    return () => window.clearTimeout(id)
  }, [ready])

  const hidden = ready || timedOut

  return (
    <div
      className={cx(styles.overlay, hidden && styles.hidden)}
      role="status"
      aria-live="polite"
      aria-hidden={hidden}
    >
      <Spinner size={28} />
      <p className={styles.status}>
        {active ? 'Loading environment…' : 'Preparing studio…'}
      </p>
    </div>
  )
}
