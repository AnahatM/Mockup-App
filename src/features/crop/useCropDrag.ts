import { useCallback, useEffect, useRef } from 'react'
import { dragCropRect, type CropHandle } from './geometry'
import type { CropRect } from './schema'

export interface CropDragOptions {
  containerRef: React.RefObject<HTMLElement | null>
  rect: CropRect
  lockAspect: number | null
  mediaAspect: number
  /** Fired on every pointer move — cheap, since it only updates local state
   * for the overlay. The 3D texture is not touched until `onCommit`; see
   * `CropEditor.tsx` for why re-baking mid-drag is deliberately avoided. */
  onChange: (rect: CropRect) => void
  onCommit: (rect: CropRect) => void
}

interface DragOrigin {
  handle: CropHandle
  pointerX: number
  pointerY: number
  rect: CropRect
}

/**
 * Pointer-drag physics for the crop overlay's handles and body.
 *
 * Deltas are normalised against the image container's own box, so the same
 * `dragCropRect` maths that drives keyboard nudging (see `CropOverlay.tsx`)
 * works for the mouse too. Uses pointer capture, mirroring `ui/ResizeHandle`,
 * so a fast drag that leaves the element mid-gesture still tracks correctly.
 */
export function useCropDrag({
  containerRef,
  rect,
  lockAspect,
  mediaAspect,
  onChange,
  onCommit,
}: CropDragOptions) {
  const origin = useRef<DragOrigin | null>(null)
  // Tracks the most recent rect directly, rather than trusting the `rect`
  // prop to have caught up via a re-render before pointerup fires. Synced in
  // an effect (not during render) because writing a ref while rendering is
  // exactly the tearing hazard `react-hooks/refs` guards against.
  const lastRect = useRef(rect)
  useEffect(() => {
    lastRect.current = rect
  }, [rect])

  const startDrag = useCallback(
    (handle: CropHandle) => (event: React.PointerEvent) => {
      event.stopPropagation()
      event.currentTarget.setPointerCapture(event.pointerId)
      origin.current = {
        handle,
        pointerX: event.clientX,
        pointerY: event.clientY,
        rect: lastRect.current,
      }
    },
    [],
  )

  const onPointerMove = useCallback(
    (event: React.PointerEvent) => {
      const start = origin.current
      const box = containerRef.current?.getBoundingClientRect()
      if (!start || !box || box.width === 0 || box.height === 0) return
      const next = dragCropRect({
        start: start.rect,
        handle: start.handle,
        dx: (event.clientX - start.pointerX) / box.width,
        dy: (event.clientY - start.pointerY) / box.height,
        lockAspect,
        mediaAspect,
      })
      lastRect.current = next
      onChange(next)
    },
    [containerRef, lockAspect, mediaAspect, onChange],
  )

  const endDrag = useCallback(
    (event: React.PointerEvent) => {
      if (!origin.current) return
      event.currentTarget.releasePointerCapture(event.pointerId)
      origin.current = null
      onCommit(lastRect.current)
    },
    [onCommit],
  )

  return { startDrag, onPointerMove, endDrag }
}
