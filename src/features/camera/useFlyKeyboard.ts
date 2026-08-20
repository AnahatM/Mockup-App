import { useEffect, useRef } from 'react'
import type { RefObject } from 'react'

type Axis = 'x' | 'y' | 'z'

const KEY_AXES: Record<string, readonly [axis: Axis, sign: number]> = {
  KeyD: ['x', 1],
  KeyA: ['x', -1],
  // Q/E are primary (Unity's fly-camera convention: E up, Q down). R/F are
  // kept working as aliases rather than removed — someone may already have
  // the old binding in muscle memory, and a shortcut that silently stops
  // working is worse than one with two names.
  KeyE: ['y', 1],
  KeyQ: ['y', -1],
  KeyR: ['y', 1],
  KeyF: ['y', -1],
  KeyW: ['z', -1],
  KeyS: ['z', 1],
}

/** The plain `event.key` letters fly navigation claims, lower-cased. Read by
 *  `useShortcuts` so the global "F = frame device" shortcut (and any other
 *  single-letter shortcut that happens to reuse one of these) does not fire
 *  underneath fly mode's own use of the same key — see that file. */
export const FLY_NAV_KEYS: ReadonlySet<string> = new Set(
  Object.keys(KEY_AXES).map((code) => code.replace('Key', '').toLowerCase()),
)

const isEditable = (target: EventTarget | null): boolean =>
  target instanceof HTMLElement &&
  (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable)

export interface FlyMoveInput {
  x: number
  y: number
  z: number
}

/**
 * WASD (strafe/forward) plus Q/E (up/down, with R/F as aliases), read
 * straight into a ref so a key repeat never triggers a React re-render.
 * Returns the ref itself — rather than its `.current` — so the mutable
 * value is only ever read from inside `FlyCamera`'s `useFrame` callback,
 * not during render.
 *
 * Movement is level-triggered — an axis is ±1 for as long as its key is
 * held and snaps to 0 the instant it is released — so `FlyCamera` only ever
 * has to damp *toward* this value every frame, never chase a queue of
 * discrete steps.
 */
export function useFlyKeyboard(): RefObject<FlyMoveInput> {
  const move = useRef<FlyMoveInput>({ x: 0, y: 0, z: 0 })
  const held = useRef(new Set<string>())

  useEffect(() => {
    const heldKeys = held.current
    const moveState = move.current

    const recompute = () => {
      let x = 0
      let y = 0
      let z = 0
      for (const code of heldKeys) {
        const axis = KEY_AXES[code]
        if (!axis) continue
        if (axis[0] === 'x') x += axis[1]
        else if (axis[0] === 'y') y += axis[1]
        else z += axis[1]
      }
      moveState.x = x
      moveState.y = y
      moveState.z = z
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (isEditable(event.target) || !(event.code in KEY_AXES)) return
      heldKeys.add(event.code)
      recompute()
    }
    const onKeyUp = (event: KeyboardEvent) => {
      heldKeys.delete(event.code)
      recompute()
    }
    // A key can go up outside the window (alt-tab mid-press); without this
    // the axis it drove would stay "held" forever.
    const onBlur = () => {
      heldKeys.clear()
      recompute()
    }

    window.addEventListener('keydown', onKeyDown)
    window.addEventListener('keyup', onKeyUp)
    window.addEventListener('blur', onBlur)
    return () => {
      window.removeEventListener('keydown', onKeyDown)
      window.removeEventListener('keyup', onKeyUp)
      window.removeEventListener('blur', onBlur)
      heldKeys.clear()
      moveState.x = 0
      moveState.y = 0
      moveState.z = 0
    }
  }, [])

  return move
}
