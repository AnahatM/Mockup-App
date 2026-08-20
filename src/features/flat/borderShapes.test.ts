import { describe, expect, it } from 'vitest'
import { BORDER_SHAPE_RADII, seedRadius } from './borderShapes'
import { BORDER_SHAPES } from './schema'

describe('seedRadius', () => {
  it.each(BORDER_SHAPES)('has a seed radius for "%s"', (shape) => {
    expect(seedRadius(shape)).toBeGreaterThanOrEqual(0)
    expect(seedRadius(shape)).toBeLessThanOrEqual(0.1)
  })

  it('is exactly square for "sharp"', () => {
    expect(seedRadius('sharp')).toBe(0)
  })

  it('orders sharp < curved < round', () => {
    expect(BORDER_SHAPE_RADII.sharp).toBeLessThan(BORDER_SHAPE_RADII.curved)
    expect(BORDER_SHAPE_RADII.curved).toBeLessThan(BORDER_SHAPE_RADII.round)
  })
})
