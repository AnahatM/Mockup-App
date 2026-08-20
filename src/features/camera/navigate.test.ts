import { describe, expect, it } from 'vitest'
import { dolly, orbitDistance, wheelZoomFactor } from './navigate'
import type { Vec3Tuple } from '@/lib/schema/primitives'

const target: Vec3Tuple = [0, 0, 0]
const position: Vec3Tuple = [0, 0, 10]

describe('dolly', () => {
  it('moves the camera closer when the factor is below one', () => {
    const moved = dolly(position, target, 0.5, 0.1, 100)
    expect(orbitDistance(moved, target)).toBeCloseTo(5)
  })

  it('moves the camera further away when the factor is above one', () => {
    const moved = dolly(position, target, 2, 0.1, 100)
    expect(orbitDistance(moved, target)).toBeCloseTo(20)
  })

  it('keeps the camera on its original view ray', () => {
    const angled: Vec3Tuple = [3, 4, 0]
    const moved = dolly(angled, target, 0.5, 0.1, 100)
    // Same direction, half the length.
    expect(moved[0] / moved[1]).toBeCloseTo(angled[0] / angled[1])
    expect(orbitDistance(moved, target)).toBeCloseTo(2.5)
  })

  it('respects the near limit, so zooming in cannot bury the camera', () => {
    const moved = dolly(position, target, 0.01, 2, 100)
    expect(orbitDistance(moved, target)).toBeCloseTo(2)
  })

  it('respects the far limit, so zooming out cannot escape the scene', () => {
    const moved = dolly(position, target, 100, 0.1, 25)
    expect(orbitDistance(moved, target)).toBeCloseTo(25)
  })

  it('dollies about an off-origin target', () => {
    const offset: Vec3Tuple = [5, 5, 5]
    const from: Vec3Tuple = [5, 5, 15]
    const moved = dolly(from, offset, 0.5, 0.1, 100)
    expect(moved).toEqual([5, 5, 10])
  })

  it('leaves a degenerate camera alone rather than dividing by zero', () => {
    expect(dolly(target, target, 0.5, 0.1, 100)).toEqual(target)
  })

  it('is reversible — in then out returns to the start', () => {
    const inward = dolly(position, target, 0.8, 0.1, 100)
    const back = dolly(inward, target, 1 / 0.8, 0.1, 100)
    expect(orbitDistance(back, target)).toBeCloseTo(10)
  })
})

describe('wheelZoomFactor', () => {
  it('zooms out (factor above 1) for a positive deltaY', () => {
    expect(wheelZoomFactor(100, 0, 1)).toBeGreaterThan(1)
  })

  it('zooms in (factor below 1) for a negative deltaY', () => {
    expect(wheelZoomFactor(-100, 0, 1)).toBeLessThan(1)
  })

  it('a stationary wheel produces no zoom', () => {
    expect(wheelZoomFactor(0, 0, 1)).toBeCloseTo(1)
  })

  it('scales with the configured zoom speed', () => {
    const slow = wheelZoomFactor(100, 0, 0.5)
    const fast = wheelZoomFactor(100, 0, 2)
    expect(fast).toBeGreaterThan(slow)
  })

  it('is symmetric: scrolling in then out by the same amount returns to 1', () => {
    const out = wheelZoomFactor(100, 0, 1)
    const back = wheelZoomFactor(-100, 0, 1)
    expect(out * back).toBeCloseTo(1)
  })
})
