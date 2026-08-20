import { describe, expect, it } from 'vitest'
import { gizmoScaleForDistance, isAimedAtOrigin, lightDirection } from './gizmoMath'

describe('isAimedAtOrigin', () => {
  it('is true for zero rotation', () => {
    expect(isAimedAtOrigin([0, 0, 0])).toBe(true)
  })

  it('is false once any axis is rotated', () => {
    expect(isAimedAtOrigin([0, Math.PI, 0])).toBe(false)
  })
})

describe('lightDirection', () => {
  it('points toward the origin when aimed', () => {
    const [x, y, z] = lightDirection({ position: [0, 0, 4], rotation: [0, 0, 0] })
    expect(x).toBeCloseTo(0)
    expect(y).toBeCloseTo(0)
    expect(z).toBeCloseTo(-1)
  })

  it('normalises a diagonal aimed position', () => {
    const [x, y, z] = lightDirection({ position: [3, 4, 0], rotation: [0, 0, 0] })
    expect(x).toBeCloseTo(-0.6)
    expect(y).toBeCloseTo(-0.8)
    expect(z).toBeCloseTo(0)
  })

  it('falls back to -Z when a light sits exactly at the origin', () => {
    const [x, y, z] = lightDirection({ position: [0, 0, 0], rotation: [0, 0, 0] })
    expect([x, y, z]).toEqual([0, 0, -1])
  })

  it('follows an explicit rotation instead of the origin', () => {
    const [x, y, z] = lightDirection({ position: [0, 0, 4], rotation: [0, Math.PI, 0] })
    expect(x).toBeCloseTo(0)
    expect(y).toBeCloseTo(0)
    expect(z).toBeCloseTo(1)
  })
})

describe('gizmoScaleForDistance', () => {
  it('grows linearly with distance', () => {
    const near = gizmoScaleForDistance(2, 50, 1000, 40)
    const far = gizmoScaleForDistance(4, 50, 1000, 40)
    expect(far).toBeCloseTo(near * 2)
  })

  it('shrinks as the viewport gets taller for the same pixel target', () => {
    const small = gizmoScaleForDistance(5, 50, 500, 40)
    const large = gizmoScaleForDistance(5, 50, 2000, 40)
    expect(large).toBeLessThan(small)
  })

  it('is defensive against a zero-height viewport', () => {
    expect(gizmoScaleForDistance(5, 50, 0, 40)).toBe(1)
  })
})
