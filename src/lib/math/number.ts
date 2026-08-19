/** Numeric helpers shared across controls, geometry and animation. */

export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max)
}

export function lerp(from: number, to: number, t: number): number {
  return from + (to - from) * t
}

/** Maps a value from one range to another without clamping. */
export function mapRange(
  value: number,
  fromMin: number,
  fromMax: number,
  toMin: number,
  toMax: number,
): number {
  const span = fromMax - fromMin
  return span === 0 ? toMin : toMin + ((value - fromMin) / span) * (toMax - toMin)
}

/**
 * Snaps to the nearest multiple of `step`, then strips binary float noise so
 * 0.1-sized steps do not accumulate a trailing 0.30000000000000004.
 */
export function roundToStep(value: number, step: number): number {
  if (step <= 0) return value
  const snapped = Math.round(value / step) * step
  const decimals = decimalPlaces(step)
  return Number(snapped.toFixed(decimals))
}

export function decimalPlaces(step: number): number {
  const text = String(step)
  const dot = text.indexOf('.')
  return dot === -1 ? 0 : text.length - dot - 1
}

export const degToRad = (deg: number): number => (deg * Math.PI) / 180
export const radToDeg = (rad: number): number => (rad * 180) / Math.PI
