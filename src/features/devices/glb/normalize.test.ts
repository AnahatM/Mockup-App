import { Box3, Vector3 } from 'three'
import { describe, expect, it } from 'vitest'
import { normalizeBounds } from './normalize'

describe('normalizeBounds', () => {
  it('scales the largest dimension to the target envelope', () => {
    const box = new Box3(new Vector3(0, 0, 0), new Vector3(0.1, 0.2, 0.01))
    const result = normalizeBounds(box)
    expect(result).not.toBeNull()
    const largestScaled = Math.max(...(result?.sizeMm ?? []))
    expect(largestScaled).toBeCloseTo(220, 5)
  })

  it('works the same whether the model was authored in metres or millimetres', () => {
    const meters = normalizeBounds(new Box3(new Vector3(0, 0, 0), new Vector3(0.07, 0.15, 0.008)))
    const millimeters = normalizeBounds(
      new Box3(new Vector3(0, 0, 0), new Vector3(70, 150, 8)),
    )
    // Same proportions, so the resulting mm-equivalent footprint should match.
    expect(meters?.sizeMm[0]).toBeCloseTo(millimeters?.sizeMm[0] ?? 0, 3)
    expect(meters?.sizeMm[1]).toBeCloseTo(millimeters?.sizeMm[1] ?? 0, 3)
  })

  it('offsets by the negative centre, so the box is centred at the origin', () => {
    const box = new Box3(new Vector3(10, 20, 30), new Vector3(20, 40, 50))
    const result = normalizeBounds(box)
    expect(result?.offset).toEqual([-15, -30, -40])
  })

  it('returns null for a degenerate (zero-size) box', () => {
    const box = new Box3(new Vector3(1, 1, 1), new Vector3(1, 1, 1))
    expect(normalizeBounds(box)).toBeNull()
  })

  it('returns null for an empty (uninitialised) box', () => {
    expect(normalizeBounds(new Box3())).toBeNull()
  })
})
