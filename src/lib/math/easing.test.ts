import { describe, expect, it } from 'vitest'
import { EASINGS, ease, pingPong } from './easing'

describe('ease', () => {
  it('pins every curve to 0 at the start and 1 at the end', () => {
    for (const curve of EASINGS) {
      expect(ease(curve, 0), curve).toBeCloseTo(0, 6)
      expect(ease(curve, 1), curve).toBeCloseTo(1, 6)
    }
  })

  it('clamps input outside 0-1 rather than extrapolating', () => {
    for (const curve of EASINGS) {
      expect(ease(curve, -5), curve).toBeCloseTo(ease(curve, 0), 9)
      expect(ease(curve, 9), curve).toBeCloseTo(ease(curve, 1), 9)
    }
  })

  it('is monotonic for the non-overshooting curves', () => {
    for (const curve of ['linear', 'ease-in', 'ease-out', 'ease-in-out'] as const) {
      let previous = -Infinity
      for (let i = 0; i <= 40; i += 1) {
        const value = ease(curve, i / 40)
        expect(value, `${curve} at ${i / 40}`).toBeGreaterThanOrEqual(previous - 1e-9)
        previous = value
      }
    }
  })

  it('makes spring overshoot past 1, which is what gives it its pop', () => {
    const peak = Math.max(
      ...Array.from({ length: 100 }, (_, i) => ease('spring', i / 99)),
    )
    expect(peak).toBeGreaterThan(1)
  })

  it('starts slow for ease-in and fast for ease-out', () => {
    expect(ease('ease-in', 0.25)).toBeLessThan(0.25)
    expect(ease('ease-out', 0.25)).toBeGreaterThan(0.25)
  })

  it('falls back to linear for an unknown curve from an old preset', () => {
    // @ts-expect-error deliberately passing a curve that no longer exists
    expect(ease('does-not-exist', 0.4)).toBeCloseTo(0.4, 6)
  })
})

describe('pingPong', () => {
  it('rises to 1 at the halfway point and returns to 0', () => {
    expect(pingPong(0)).toBeCloseTo(0, 6)
    expect(pingPong(0.5)).toBeCloseTo(1, 6)
    expect(pingPong(0.999)).toBeCloseTo(0, 2)
  })

  it('repeats every whole unit, so looping never jumps', () => {
    for (const t of [0.1, 0.37, 0.62, 0.94]) {
      expect(pingPong(t + 3)).toBeCloseTo(pingPong(t), 6)
    }
  })

  it('stays within 0-1', () => {
    for (let i = 0; i <= 200; i += 1) {
      const value = pingPong(i / 37)
      expect(value).toBeGreaterThanOrEqual(0)
      expect(value).toBeLessThanOrEqual(1)
    }
  })
})
