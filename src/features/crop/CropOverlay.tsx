import { cx } from '@/lib/cx'
import type { CropHandle } from './geometry'
import type { CropRect } from './schema'
import styles from './CropOverlay.module.css'

export interface CropOverlayProps {
  rect: CropRect
  onHandlePointerDown: (handle: CropHandle) => (event: React.PointerEvent) => void
  onPointerMove: (event: React.PointerEvent) => void
  onPointerUp: (event: React.PointerEvent) => void
  /** A discrete step, from either an arrow key or a corner handle's own. */
  onKeyNudge: (handle: CropHandle, dx: number, dy: number) => void
}

const CORNERS: readonly CropHandle[] = ['nw', 'ne', 'sw', 'se']

const CORNER_LABEL: Record<string, string> = {
  nw: 'top-left',
  ne: 'top-right',
  sw: 'bottom-left',
  se: 'bottom-right',
}

/** One keyboard step, in the same normalised units as a pointer drag. */
const STEP = 0.02

const KEY_DELTAS: Record<string, readonly [number, number]> = {
  ArrowLeft: [-STEP, 0],
  ArrowRight: [STEP, 0],
  ArrowUp: [0, -STEP],
  ArrowDown: [0, STEP],
}

/**
 * The crop rectangle drawn over the source image: a spotlighted body that
 * drags to move, and four corner handles that drag to resize. Both the body
 * and every handle are independently focusable and arrow-key operable —
 * a crop tool a keyboard cannot drive is not accessible.
 */
export function CropOverlay({
  rect,
  onHandlePointerDown,
  onPointerMove,
  onPointerUp,
  onKeyNudge,
}: CropOverlayProps) {
  const pct = (value: number) => `${value * 100}%`

  const nudge = (handle: CropHandle) => (event: React.KeyboardEvent) => {
    const delta = KEY_DELTAS[event.key]
    if (!delta) return
    event.preventDefault()
    onKeyNudge(handle, delta[0], delta[1])
  }

  return (
    <div
      className={styles.body}
      role="group"
      aria-label="Crop region — drag or use the arrow keys to move it"
      tabIndex={0}
      style={{ left: pct(rect.x), top: pct(rect.y), width: pct(rect.width), height: pct(rect.height) }}
      onPointerDown={onHandlePointerDown('move')}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
      onKeyDown={nudge('move')}
    >
      {CORNERS.map((corner) => (
        <button
          key={corner}
          type="button"
          className={cx(styles.handle, styles[corner])}
          aria-label={`Resize crop from the ${CORNER_LABEL[corner]} corner`}
          onPointerDown={onHandlePointerDown(corner)}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
          onKeyDown={nudge(corner)}
        />
      ))}
    </div>
  )
}
