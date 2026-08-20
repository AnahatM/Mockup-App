import type { Vec3Tuple } from '@/lib/schema/primitives'
import { normalizeWheelDelta } from './wheel'

/**
 * Viewport navigation, as pure maths.
 *
 * The toolbar's zoom buttons have to do exactly what the scroll wheel does.
 * Both paths change the same store value through `dollyCamera` — the wheel
 * via `wheelZoomFactor` below, feeding `CameraRig`'s own wheel listener
 * rather than three-stdlib's `OrbitControls` (whose built-in wheel handling
 * is disabled here; see `CameraRig` for why) — so a zoom is a state change
 * like any other and survives a preset save.
 */

const subtract = (a: Vec3Tuple, b: Vec3Tuple): Vec3Tuple => [
  a[0] - b[0],
  a[1] - b[1],
  a[2] - b[2],
]

const length = (v: Vec3Tuple): number => Math.hypot(v[0], v[1], v[2])

/**
 * Moves the camera along its own view ray, towards or away from the target.
 *
 * `factor` below 1 zooms in, above 1 zooms out. The distance is clamped to the
 * camera's own limits so a held button cannot bury the camera inside the device
 * or send it out past the backdrop.
 */
export function dolly(
  position: Vec3Tuple,
  target: Vec3Tuple,
  factor: number,
  minDistance: number,
  maxDistance: number,
): Vec3Tuple {
  const offset = subtract(position, target)
  const distance = length(offset)

  // A camera sitting exactly on its target has no view ray to move along.
  if (distance === 0) return position

  const clamped = Math.min(Math.max(distance * factor, minDistance), maxDistance)
  const scale = clamped / distance

  return [
    target[0] + offset[0] * scale,
    target[1] + offset[1] * scale,
    target[2] + offset[2] * scale,
  ]
}

/** Distance between the camera and what it is looking at. */
export const orbitDistance = (position: Vec3Tuple, target: Vec3Tuple): number =>
  length(subtract(position, target))

/**
 * Converts a wheel event into the same multiplicative `dolly`/`dollyCamera`
 * factor the toolbar's zoom buttons use — see `wheel.ts` for why this scales
 * by the event's actual magnitude rather than counting events, which is what
 * makes a trackpad's two-finger scroll feel like the same *speed* of zoom as
 * a mouse wheel, not many times faster.
 */
export function wheelZoomFactor(deltaY: number, deltaMode: number, zoomSpeed: number): number {
  const step = normalizeWheelDelta(deltaY, deltaMode)
  // >1 zooms out, matching `dolly`'s convention — and a positive deltaY
  // (scrolling "down") is the universal convention for zooming out.
  return Math.pow(1.0008, step * zoomSpeed)
}
