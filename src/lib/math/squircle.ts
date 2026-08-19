/**
 * Squircle (superelliptical) rounded rectangles.
 *
 * This is the single most load-bearing shape in the app. A phone drawn with
 * circular corner arcs reads as "a rounded box"; the thing that makes it read as
 * a real device is *continuous curvature* — the corner easing into the straight
 * edge with no visible kink where the arc meets it.
 *
 * Each corner is a quarter superellipse:
 *
 *     x = cx + r * cos(t)^(2/n)
 *     y = cy + r * sin(t)^(2/n)      for t in [0, PI/2]
 *
 * At n = 2 that is exactly a circular arc. At n = 4-5 it becomes the continuous
 * corner used by modern phone hardware and by iOS/Figma corner smoothing. The
 * curve stays tangent to the straight edges at both ends for any n, so the
 * outline is always closed and smooth.
 *
 * Pure and unit-tested; no three.js types cross this boundary.
 */

export type Point2 = readonly [x: number, y: number]

export interface SquircleOptions {
  width: number
  height: number
  /** Corner radius, clamped to half the shorter side. */
  radius: number
  /** 2 = circular arc, 4-5 = continuous "squircle" corner. */
  exponent?: number
  /** Points generated per corner. Higher is smoother and heavier. */
  segments?: number
}

const QUADRANTS: ReadonlyArray<readonly [sx: number, sy: number]> = [
  [1, 1],
  [-1, 1],
  [-1, -1],
  [1, -1],
]

/**
 * Returns the outline as a closed loop of points, counter-clockwise, centred on
 * the origin. The first point is not repeated at the end.
 */
export function squirclePoints({
  width,
  height,
  radius,
  exponent = 4.4,
  segments = 12,
}: SquircleOptions): Point2[] {
  const halfW = width / 2
  const halfH = height / 2
  const r = clampRadius(radius, width, height)
  const power = 2 / Math.max(exponent, 0.01)
  const steps = Math.max(2, Math.floor(segments))

  const points: Point2[] = []

  for (const quadrant of QUADRANTS) {
    const [sx, sy] = quadrant
    const cx = sx * (halfW - r)
    const cy = sy * (halfH - r)

    for (let i = 0; i <= steps; i += 1) {
      // Sweep so consecutive quadrants join without duplicating the seam point.
      const t = (i / steps) * (Math.PI / 2)
      const [u, v] =
        sx * sy > 0 ? [Math.cos(t), Math.sin(t)] : [Math.sin(t), Math.cos(t)]
      points.push([cx + sx * r * u ** power, cy + sy * r * v ** power])
    }
  }

  return dedupe(points)
}

/** Corner radius cannot exceed half the shorter side without self-intersecting. */
export function clampRadius(radius: number, width: number, height: number): number {
  return Math.max(0, Math.min(radius, Math.min(width, height) / 2))
}

/** Drops consecutive duplicates, including the wrap from last point to first. */
function dedupe(points: Point2[]): Point2[] {
  const out: Point2[] = []
  for (const point of points) {
    const previous = out[out.length - 1]
    if (!previous || !samePoint(previous, point)) out.push(point)
  }
  const first = out[0]
  const last = out[out.length - 1]
  if (first && last && out.length > 1 && samePoint(first, last)) out.pop()
  return out
}

const EPSILON = 1e-9

function samePoint(a: Point2, b: Point2): boolean {
  return Math.abs(a[0] - b[0]) < EPSILON && Math.abs(a[1] - b[1]) < EPSILON
}
