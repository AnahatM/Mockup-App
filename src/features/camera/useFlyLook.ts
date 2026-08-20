import { useEffect, useRef } from 'react'
import type { RefObject } from 'react'

export interface FlyLook {
  x: number
  y: number
}

/**
 * Accumulates *relative* pointer motion while a button is held, in CSS
 * pixels, until `FlyCamera` consumes and clears it once per frame. Returns
 * the ref itself — rather than its `.current` — so the mutable value is only
 * ever read from inside `FlyCamera`'s `useFrame` callback, not during render.
 *
 * `event.movementX/Y` is what actually fixes the fly-mode "drift": it is the
 * delta since the last event regardless of input device, so a drag on a
 * trackpad produces the same kind of stream as a mouse — many small steps
 * that sum to the right rotation. The previous control (drei's
 * `FlyControls` with `dragToLook`) instead read the cursor's *absolute
 * offset from the canvas centre* on every pointermove, so the camera kept
 * turning for as long as the pointer sat off-centre — even with a
 * perfectly still hand. A relative delta is exactly zero the moment the
 * hand stops.
 */
export function useFlyLook(domElement: HTMLElement): RefObject<FlyLook> {
  const look = useRef<FlyLook>({ x: 0, y: 0 })
  const dragging = useRef(false)

  useEffect(() => {
    const onPointerDown = (event: PointerEvent) => {
      dragging.current = true
      domElement.setPointerCapture(event.pointerId)
    }
    const onPointerUp = (event: PointerEvent) => {
      dragging.current = false
      if (domElement.hasPointerCapture(event.pointerId)) {
        domElement.releasePointerCapture(event.pointerId)
      }
    }
    const onPointerMove = (event: PointerEvent) => {
      if (!dragging.current) return
      look.current.x += event.movementX
      look.current.y += event.movementY
    }

    domElement.addEventListener('pointerdown', onPointerDown)
    domElement.addEventListener('pointerup', onPointerUp)
    domElement.addEventListener('pointercancel', onPointerUp)
    domElement.addEventListener('pointermove', onPointerMove)
    return () => {
      domElement.removeEventListener('pointerdown', onPointerDown)
      domElement.removeEventListener('pointerup', onPointerUp)
      domElement.removeEventListener('pointercancel', onPointerUp)
      domElement.removeEventListener('pointermove', onPointerMove)
      dragging.current = false
    }
  }, [domElement])

  return look
}
