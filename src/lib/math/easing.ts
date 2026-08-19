/**
 * Easing curves for animation clips.
 *
 * All take and return a normalised 0-1 value. Kept pure so clips are simple
 * functions of time and can be evaluated deterministically for frame-accurate
 * capture as well as for live playback.
 */

export const EASINGS = [
  'linear',
  'ease-in',
  'ease-out',
  'ease-in-out',
  'spring',
  'bounce',
] as const

export type Easing = (typeof EASINGS)[number]

const linear = (t: number): number => t
const easeIn = (t: number): number => t * t * t
const easeOut = (t: number): number => 1 - (1 - t) ** 3
const easeInOut = (t: number): number =>
  t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2

/** Overshoots slightly then settles — the "pop" in a pop-in. */
const spring = (t: number): number => {
  const c = 1.70158 * 1.525
  return t < 0.5
    ? ((2 * t) ** 2 * ((c + 1) * 2 * t - c)) / 2
    : ((2 * t - 2) ** 2 * ((c + 1) * (t * 2 - 2) + c) + 2) / 2
}

const bounce = (t: number): number => {
  const n = 7.5625
  const d = 2.75
  if (t < 1 / d) return n * t * t
  if (t < 2 / d) return n * (t -= 1.5 / d) * t + 0.75
  if (t < 2.5 / d) return n * (t -= 2.25 / d) * t + 0.9375
  return n * (t -= 2.625 / d) * t + 0.984375
}

const CURVES: Record<Easing, (t: number) => number> = {
  linear,
  'ease-in': easeIn,
  'ease-out': easeOut,
  'ease-in-out': easeInOut,
  spring,
  bounce,
}

/** Applies a named curve, clamping the input to 0-1. */
export function ease(curve: Easing, t: number): number {
  const clamped = Math.min(Math.max(t, 0), 1)
  return (CURVES[curve] ?? linear)(clamped)
}

/** Ping-pongs 0..1..0, for clips that should return to where they started. */
export function pingPong(t: number): number {
  const wrapped = t % 1
  return wrapped < 0.5 ? wrapped * 2 : 2 - wrapped * 2
}
