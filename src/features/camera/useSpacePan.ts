import { useEffect, useRef } from 'react'
import type { RefObject } from 'react'
import { MOUSE } from 'three'
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib'
import { setSpacePanDrag } from './spacePan'

const PAN_KEYS = new Set([' ', 'Shift'])

const isEditable = (target: EventTarget | null): boolean =>
  target instanceof HTMLElement &&
  (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable)

/**
 * Hold Space (or Shift) and drag to pan — the same convention as Figma,
 * Photoshop and Blender, and the main way a single-button trackpad, with no
 * real middle- or right-click, reaches panning at all.
 *
 * Space is also the studio's play/pause shortcut (`shortcuts/registry.ts`).
 * The two are reconciled by timing, not by picking one: holding a pan key
 * arms panning immediately — reassigning left-drag on the live
 * `OrbitControls` instance directly, the same "mutate three.js, not React
 * state" reasoning as the capture gizmo guards — so a drag is never raced
 * against a toggle. The toggle itself is deferred to key-up (see the `play`
 * entry's `fireOn: 'keyup'`) and only actually fires if `spacePan.ts`
 * reports no drag happened during the hold. Tap Space -> play/pause, as
 * always; hold Space and drag -> pan, and releasing does not also toggle
 * playback.
 *
 * Only reassigns `mouseButtons.LEFT`: it is restored to whatever `CameraRig`
 * last set it to, so this never has to know the value, only how to put it
 * back.
 */
export function useSpacePan(
  domElement: HTMLElement,
  controls: RefObject<OrbitControlsImpl | null>,
): void {
  const held = useRef(new Set<string>())
  const originalLeft = useRef<number>(MOUSE.ROTATE)

  useEffect(() => {
    const heldKeys = held.current

    const setPanning = (panning: boolean) => {
      const live = controls.current
      if (!live) return
      if (panning) {
        originalLeft.current = live.mouseButtons.LEFT ?? MOUSE.ROTATE
        live.mouseButtons.LEFT = MOUSE.PAN
      } else {
        live.mouseButtons.LEFT = originalLeft.current
      }
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (!PAN_KEYS.has(event.key) || isEditable(event.target)) return
      if (heldKeys.size === 0) {
        setSpacePanDrag(false)
        setPanning(true)
      }
      heldKeys.add(event.key)
    }
    const onKeyUp = (event: KeyboardEvent) => {
      if (!PAN_KEYS.has(event.key)) return
      heldKeys.delete(event.key)
      if (heldKeys.size === 0) setPanning(false)
    }
    const onPointerMove = (event: PointerEvent) => {
      if (heldKeys.size > 0 && event.buttons !== 0) setSpacePanDrag(true)
    }

    window.addEventListener('keydown', onKeyDown)
    window.addEventListener('keyup', onKeyUp)
    domElement.addEventListener('pointermove', onPointerMove)
    return () => {
      window.removeEventListener('keydown', onKeyDown)
      window.removeEventListener('keyup', onKeyUp)
      domElement.removeEventListener('pointermove', onPointerMove)
      if (heldKeys.size > 0) {
        heldKeys.clear()
        setPanning(false)
      }
    }
  }, [domElement, controls])
}
