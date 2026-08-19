import { describe, expect, it } from 'vitest'
import { clampRadius, squirclePoints, type Point2 } from './squircle'

const WIDTH = 70.6
const HEIGHT = 146.6
const RADIUS = 12

const outline = (overrides = {}) =>
  squirclePoints({ width: WIDTH, height: HEIGHT, radius: RADIUS, ...overrides })

const maxAbs = (points: Point2[], axis: 0 | 1) =>
  points.reduce((max, p) => Math.max(max, Math.abs(p[axis])), 0)

describe('squirclePoints', () => {
  it('stays within the requested bounding box and reaches its edges', () => {
    const points = outline()
    expect(maxAbs(points, 0)).toBeCloseTo(WIDTH / 2, 6)
    expect(maxAbs(points, 1)).toBeCloseTo(HEIGHT / 2, 6)
  })

  it('is symmetric about both axes', () => {
    const points = outline()
    for (const [x, y] of points) {
      expect(points.some((p) => close(p, [-x, y]))).toBe(true)
      expect(points.some((p) => close(p, [x, -y]))).toBe(true)
    }
  })

  it('contains no duplicate consecutive points, including at the wrap', () => {
    const points = outline()
    for (let i = 0; i < points.length; i += 1) {
      const a = points[i]
      const b = points[(i + 1) % points.length]
      expect(a && b && close(a, b)).toBe(false)
    }
  })

  it('produces a strictly convex, non-self-intersecting loop', () => {
    // Every cross product of consecutive edges must share one sign; a kink or a
    // self-intersection would flip it.
    const points = outline({ segments: 16 })
    const signs = new Set<number>()
    for (let i = 0; i < points.length; i += 1) {
      const a = points[i]
      const b = points[(i + 1) % points.length]
      const c = points[(i + 2) % points.length]
      if (!a || !b || !c) continue
      const cross = (b[0] - a[0]) * (c[1] - b[1]) - (b[1] - a[1]) * (c[0] - b[0])
      if (Math.abs(cross) > 1e-6) signs.add(Math.sign(cross))
    }
    expect(signs.size).toBe(1)
  })

  it('winds counter-clockwise so extrusion faces outward', () => {
    expect(signedArea(outline())).toBeGreaterThan(0)
  })

  it('at exponent 2 matches a circular arc corner', () => {
    const points = squirclePoints({
      width: 100,
      height: 100,
      radius: 50,
      exponent: 2,
      segments: 64,
    })
    // radius === half the side, so the shape is a circle of radius 50.
    for (const [x, y] of points) {
      expect(Math.hypot(x, y)).toBeCloseTo(50, 4)
    }
  })

  it('bulges outside the circular arc at higher exponents', () => {
    const circular = squirclePoints({
      width: 100,
      height: 100,
      radius: 50,
      exponent: 2,
    })
    const squircle = squirclePoints({
      width: 100,
      height: 100,
      radius: 50,
      exponent: 5,
    })
    expect(area(squircle)).toBeGreaterThan(area(circular))
  })

  it('clamps an over-large radius instead of self-intersecting', () => {
    const points = squirclePoints({ width: 40, height: 100, radius: 999 })
    expect(maxAbs(points, 0)).toBeCloseTo(20, 6)
    expect(signedArea(points)).toBeGreaterThan(0)
  })

  it('degenerates to a rectangle at radius zero', () => {
    const points = squirclePoints({ width: 10, height: 20, radius: 0 })
    expect(points).toHaveLength(4)
    expect(area(points)).toBeCloseTo(200, 6)
  })
})

describe('clampRadius', () => {
  it('never exceeds half the shorter side and never goes negative', () => {
    expect(clampRadius(999, 40, 100)).toBe(20)
    expect(clampRadius(-5, 40, 100)).toBe(0)
    expect(clampRadius(8, 40, 100)).toBe(8)
  })
})

function close(a: Point2, b: Point2): boolean {
  return Math.abs(a[0] - b[0]) < 1e-6 && Math.abs(a[1] - b[1]) < 1e-6
}

function signedArea(points: Point2[]): number {
  let sum = 0
  for (let i = 0; i < points.length; i += 1) {
    const a = points[i]
    const b = points[(i + 1) % points.length]
    if (!a || !b) continue
    sum += a[0] * b[1] - b[0] * a[1]
  }
  return sum / 2
}

const area = (points: Point2[]) => Math.abs(signedArea(points))
