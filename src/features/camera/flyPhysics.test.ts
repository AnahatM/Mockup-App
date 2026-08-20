import { describe, expect, it } from 'vitest'
import {
  approach,
  approachVelocity,
  clampPitch,
  FLY_STOP_EPSILON,
  targetVelocity,
  wheelDollyDistance,
} from './flyPhysics'

describe('approach', () => {
  it('moves toward the target rather than jumping to it', () => {
    const next = approach(0, 10, 14, 1 / 60)
    expect(next).toBeGreaterThan(0)
    expect(next).toBeLessThan(10)
  })

  it('is frame-rate independent: two half-steps land at the same place as one full step', () => {
    const half = approach(approach(0, 10, 14, 0.05), 10, 14, 0.05)
    const full = approach(0, 10, 14, 0.1)
    expect(half).toBeCloseTo(full, 5)
  })

  it('settles at exactly the target instead of approaching it forever', () => {
    let value = 0
    for (let i = 0; i < 500; i += 1) value = approach(value, 10, 14, 1 / 60)
    expect(value).toBe(10)
  })

  it('does nothing on a zero or negative timestep', () => {
    expect(approach(3, 10, 14, 0)).toBe(3)
  })
})

describe('approachVelocity', () => {
  it('decays to exactly zero once every axis has released, so the camera stops', () => {
    let v: [number, number, number] = [5, -3, 2]
    for (let i = 0; i < 500; i += 1) v = approachVelocity(v, [0, 0, 0], 1 / 60)
    expect(v).toEqual([0, 0, 0])
  })

  it('never overshoots the target speed while accelerating', () => {
    let v: [number, number, number] = [0, 0, 0]
    for (let i = 0; i < 60; i += 1) {
      v = approachVelocity(v, [4, 0, 0], 1 / 60)
      expect(v[0]).toBeLessThanOrEqual(4 + FLY_STOP_EPSILON)
    }
  })
})

describe('targetVelocity', () => {
  it('scales a single-axis input to the configured speed', () => {
    expect(targetVelocity([1, 0, 0], 3)).toEqual([3, 0, 0])
  })

  it('normalises diagonal input so it is not faster than a single axis', () => {
    const [x, , z] = targetVelocity([1, 0, 1], 3)
    expect(Math.hypot(x, z)).toBeCloseTo(3)
  })

  it('leaves a zero input at zero rather than dividing by zero', () => {
    expect(targetVelocity([0, 0, 0], 3)).toEqual([0, 0, 0])
  })
})

describe('clampPitch', () => {
  it('passes small angles through unchanged', () => {
    expect(clampPitch(0.4)).toBeCloseTo(0.4)
  })

  it('clamps just short of straight up', () => {
    expect(clampPitch(10)).toBeLessThan(Math.PI / 2)
    expect(clampPitch(10)).toBeGreaterThan(Math.PI / 2 - 0.05)
  })

  it('clamps just short of straight down', () => {
    expect(clampPitch(-10)).toBeGreaterThan(-Math.PI / 2)
    expect(clampPitch(-10)).toBeLessThan(-Math.PI / 2 + 0.05)
  })
})

describe('wheelDollyDistance', () => {
  it('scrolling up (negative deltaY) moves forward (a negative distance)', () => {
    expect(wheelDollyDistance(-100, 0, 2)).toBeLessThan(0)
  })

  it('scrolling down (positive deltaY) moves backward (a positive distance)', () => {
    expect(wheelDollyDistance(100, 0, 2)).toBeGreaterThan(0)
  })

  it('scales with fly speed', () => {
    const slow = Math.abs(wheelDollyDistance(100, 0, 1))
    const fast = Math.abs(wheelDollyDistance(100, 0, 5))
    expect(fast).toBeGreaterThan(slow)
  })
})
