import type { Vec3Tuple } from '@/lib/schema/primitives'
import { normalizeWheelDelta } from './wheel'

/**
 * Fly-camera maths, kept free of three.js and React so it can be reasoned
 * about — and tested — as plain numbers.
 *
 * Velocity is *damped* toward whatever the current input asks for, rather
 * than being applied as an instantaneous step. That is what makes movement
 * predictable instead of feeling like it drifts: the input can change
 * abruptly (a key goes up mid-frame) but the camera's speed only ever
 * approaches its target smoothly — and, critically, the target for "no
 * input" is exactly zero, so releasing every key brings the camera to a
 * genuine stop rather than letting it coast.
 */

/** How quickly velocity closes the gap to its target, in 1/seconds. Tuned so
 *  the camera feels immediate (most of the way there within a couple of
 *  frames) but never snaps or overshoots. */
export const FLY_DAMPING_RATE = 14

/** Below this speed (units/second) the camera is considered stopped, so it
 *  settles at exactly zero instead of approaching it forever — exponential
 *  decay never truly reaches its target. */
export const FLY_STOP_EPSILON = 1e-3

/** Frame-rate-independent exponential approach of `current` toward `target`
 *  at the given rate, over a timestep `dt` (seconds). */
export function approach(
  current: number,
  target: number,
  rate: number,
  dt: number,
): number {
  if (dt <= 0) return current
  const t = 1 - Math.exp(-rate * dt)
  const next = current + (target - current) * t
  return Math.abs(next - target) < FLY_STOP_EPSILON ? target : next
}

/** Damps a velocity vector toward a target velocity, one axis at a time. */
export function approachVelocity(
  current: Vec3Tuple,
  target: Vec3Tuple,
  dt: number,
  rate: number = FLY_DAMPING_RATE,
): Vec3Tuple {
  return [
    approach(current[0], target[0], rate, dt),
    approach(current[1], target[1], rate, dt),
    approach(current[2], target[2], rate, dt),
  ]
}

/** Normalises a WASD/RF input triple so moving on two axes at once is not
 *  faster than moving on one, then scales it to the configured fly speed. */
export function targetVelocity(input: Vec3Tuple, speed: number): Vec3Tuple {
  const length = Math.hypot(input[0], input[1], input[2])
  if (length === 0) return [0, 0, 0]
  const scale = speed / length
  return [input[0] * scale, input[1] * scale, input[2] * scale]
}

/** Clamps pitch just short of straight up/down, since crossing that point
 *  would otherwise flip yaw by 180 degrees the instant it happens. */
export function clampPitch(pitch: number): number {
  const LIMIT = Math.PI / 2 - 0.01
  return Math.min(Math.max(pitch, -LIMIT), LIMIT)
}

/**
 * Wheel-to-dolly for fly mode: scroll to move forward/back along the view
 * ray, the fly-camera equivalent of orbit mode's scroll-to-zoom. Scaled by
 * the event's magnitude (see `wheel.ts`) so a trackpad's two-finger scroll
 * feels proportional rather than covering the same ground in far more,
 * smaller-feeling steps than a mouse wheel.
 *
 * A negative deltaY (scrolling "up", or a two-finger push away from the
 * body) moves forward — the same convention orbit mode's zoom-in uses.
 */
export function wheelDollyDistance(
  deltaY: number,
  deltaMode: number,
  speed: number,
): number {
  const step = normalizeWheelDelta(deltaY, deltaMode)
  return step * speed * 0.01
}
