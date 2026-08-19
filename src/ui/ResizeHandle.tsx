import { useCallback, useRef } from 'react'
import styles from './ResizeHandle.module.css'

export interface ResizeHandleProps {
  /** Which edge of the panel this handle sits on. */
  side: 'left' | 'right'
  /** Current panel width in px. */
  width: number
  onResize: (width: number) => void
  /** Accessible name, e.g. "Resize device rail". */
  label: string
  /** Keyboard step in px. */
  step?: number
}

const DEFAULT_STEP = 16

/**
 * A draggable divider between a panel and the viewport.
 *
 * Uses pointer capture rather than window listeners so a fast drag that leaves
 * the element — or leaves the window entirely — still tracks and still releases
 * cleanly. Arrow keys resize too: a drag handle that only responds to a mouse
 * is not a control, it is an obstacle.
 */
export function ResizeHandle({
  side,
  width,
  onResize,
  label,
  step = DEFAULT_STEP,
}: ResizeHandleProps) {
  const start = useRef<{ pointer: number; width: number } | null>(null)

  /** Dragging the left edge of a right-hand panel makes it wider. */
  const sign = side === 'left' ? -1 : 1

  const onPointerDown = useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      event.currentTarget.setPointerCapture(event.pointerId)
      start.current = { pointer: event.clientX, width }
    },
    [width],
  )

  const onPointerMove = useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      const origin = start.current
      if (!origin) return
      onResize(origin.width + (event.clientX - origin.pointer) * sign)
    },
    [onResize, sign],
  )

  const onPointerUp = useCallback((event: React.PointerEvent<HTMLDivElement>) => {
    event.currentTarget.releasePointerCapture(event.pointerId)
    start.current = null
  }, [])

  const onKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLDivElement>) => {
      const direction =
        event.key === 'ArrowLeft' ? -1 : event.key === 'ArrowRight' ? 1 : 0
      if (direction === 0) return
      event.preventDefault()
      onResize(width + direction * sign * step)
    },
    [onResize, sign, step, width],
  )

  return (
    <div
      role="separator"
      aria-orientation="vertical"
      aria-label={label}
      aria-valuenow={Math.round(width)}
      tabIndex={0}
      className={styles.handle}
      data-side={side}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
      onKeyDown={onKeyDown}
    >
      <span className={styles.grip} aria-hidden="true" />
    </div>
  )
}
