import { describe, expect, it } from 'vitest'
import {
  clampCropRect,
  cropRectToPixels,
  dragCropRect,
  isIdentityCrop,
  pixelsToCropRect,
  rectForAspect,
} from './geometry'

describe('clampCropRect', () => {
  it('leaves an already-valid rect untouched', () => {
    const rect = { x: 0.1, y: 0.2, width: 0.5, height: 0.3 }
    expect(clampCropRect(rect)).toEqual(rect)
  })

  it('pulls x and y back so the rect never spills past the far edge', () => {
    const result = clampCropRect({ x: 0.9, y: 0.9, width: 0.5, height: 0.5 })
    expect(result.x).toBeCloseTo(0.5, 6)
    expect(result.y).toBeCloseTo(0.5, 6)
    expect(result.x + result.width).toBeLessThanOrEqual(1 + 1e-9)
    expect(result.y + result.height).toBeLessThanOrEqual(1 + 1e-9)
  })

  it('clamps negative origins to zero', () => {
    const result = clampCropRect({ x: -0.4, y: -0.2, width: 0.3, height: 0.3 })
    expect(result.x).toBe(0)
    expect(result.y).toBe(0)
  })

  it('never shrinks below the minimum size, even when asked to', () => {
    const result = clampCropRect({ x: 0.5, y: 0.5, width: 0, height: -1 })
    expect(result.width).toBeGreaterThan(0)
    expect(result.height).toBeGreaterThan(0)
  })

  it('never grows past the full image', () => {
    const result = clampCropRect({ x: 0, y: 0, width: 5, height: 5 })
    expect(result.width).toBe(1)
    expect(result.height).toBe(1)
  })
})

describe('isIdentityCrop', () => {
  it('is true for the full, untouched image', () => {
    expect(isIdentityCrop({ x: 0, y: 0, width: 1, height: 1 })).toBe(true)
  })

  it('is false for anything cropped', () => {
    expect(isIdentityCrop({ x: 0.1, y: 0, width: 1, height: 1 })).toBe(false)
    expect(isIdentityCrop({ x: 0, y: 0, width: 0.9, height: 1 })).toBe(false)
  })

  it('tolerates float noise from repeated drags', () => {
    expect(isIdentityCrop({ x: 1e-9, y: -1e-9, width: 1, height: 1 - 1e-9 })).toBe(true)
  })
})

describe('rectForAspect', () => {
  it('produces a rect whose true pixel aspect matches the target, for a square image', () => {
    const rect = rectForAspect(16 / 9, 1)
    expect((rect.width / rect.height) * 1).toBeCloseTo(16 / 9, 6)
  })

  it('accounts for a non-square source image', () => {
    // A 2:1 image cropped to a 1:1 target needs a normalised rect of 0.5x1.
    const rect = rectForAspect(1, 2)
    expect(rect.width).toBeCloseTo(0.5, 6)
    expect(rect.height).toBeCloseTo(1, 6)
    expect((rect.width / rect.height) * 2).toBeCloseTo(1, 6)
  })

  it('centres the crop', () => {
    const rect = rectForAspect(16 / 9, 1)
    expect(rect.x).toBeCloseTo((1 - rect.width) / 2, 6)
    expect(rect.y).toBeCloseTo((1 - rect.height) / 2, 6)
  })

  it('falls back sanely for a degenerate aspect', () => {
    const rect = rectForAspect(0, 1)
    expect(Number.isFinite(rect.width)).toBe(true)
    expect(Number.isFinite(rect.height)).toBe(true)
  })
})

describe('pixel <-> normalised conversion', () => {
  it('round-trips through pixels and back', () => {
    const rect = { x: 0.25, y: 0.1, width: 0.5, height: 0.6 }
    const px = cropRectToPixels(rect, 2000, 1000)
    const back = pixelsToCropRect(px, 2000, 1000)
    expect(back.x).toBeCloseTo(rect.x, 3)
    expect(back.y).toBeCloseTo(rect.y, 3)
    expect(back.width).toBeCloseTo(rect.width, 3)
    expect(back.height).toBeCloseTo(rect.height, 3)
  })

  it('the identity crop covers every pixel of the source', () => {
    const px = cropRectToPixels({ x: 0, y: 0, width: 1, height: 1 }, 800, 600)
    expect(px).toEqual({ x: 0, y: 0, width: 800, height: 600 })
  })

  it('never produces a zero-pixel dimension from a tiny rect', () => {
    const px = cropRectToPixels({ x: 0, y: 0, width: 0.001, height: 0.001 }, 100, 100)
    expect(px.width).toBeGreaterThanOrEqual(1)
    expect(px.height).toBeGreaterThanOrEqual(1)
  })
})

describe('dragCropRect', () => {
  const start = { x: 0.2, y: 0.2, width: 0.4, height: 0.4 }

  it('move keeps the size and shifts position', () => {
    const result = dragCropRect({
      start,
      handle: 'move',
      dx: 0.1,
      dy: -0.05,
      lockAspect: null,
      mediaAspect: 1,
    })
    expect(result.width).toBeCloseTo(start.width, 6)
    expect(result.height).toBeCloseTo(start.height, 6)
    expect(result.x).toBeCloseTo(0.3, 6)
    expect(result.y).toBeCloseTo(0.15, 6)
  })

  it('a zero-delta drag on any handle is the identity operation', () => {
    for (const handle of ['n', 's', 'e', 'w', 'ne', 'nw', 'se', 'sw'] as const) {
      const result = dragCropRect({
        start,
        handle,
        dx: 0,
        dy: 0,
        lockAspect: null,
        mediaAspect: 1,
      })
      // `toBeCloseTo`, not `toEqual`: an "n"/"w" handle recomputes its edge as
      // `farEdge - near`, which for a zero delta is only equal to the
      // original up to float error, not bit-for-bit.
      expect(result.x).toBeCloseTo(start.x, 9)
      expect(result.y).toBeCloseTo(start.y, 9)
      expect(result.width).toBeCloseTo(start.width, 9)
      expect(result.height).toBeCloseTo(start.height, 9)
    }
  })

  it('dragging the se corner keeps the nw corner fixed', () => {
    const result = dragCropRect({
      start,
      handle: 'se',
      dx: 0.1,
      dy: 0.1,
      lockAspect: null,
      mediaAspect: 1,
    })
    expect(result.x).toBeCloseTo(start.x, 6)
    expect(result.y).toBeCloseTo(start.y, 6)
    expect(result.width).toBeCloseTo(0.5, 6)
    expect(result.height).toBeCloseTo(0.5, 6)
  })

  it('dragging the nw corner keeps the se corner fixed', () => {
    const result = dragCropRect({
      start,
      handle: 'nw',
      dx: -0.1,
      dy: -0.1,
      lockAspect: null,
      mediaAspect: 1,
    })
    const startRight = start.x + start.width
    const startBottom = start.y + start.height
    expect(result.x + result.width).toBeCloseTo(startRight, 6)
    expect(result.y + result.height).toBeCloseTo(startBottom, 6)
  })

  it('locks the pixel aspect on a corner drag for a non-square image', () => {
    const result = dragCropRect({
      start: { x: 0.1, y: 0.1, width: 0.3, height: 0.3 },
      handle: 'se',
      dx: 0.2,
      dy: 0,
      lockAspect: 1,
      mediaAspect: 2,
    })
    expect((result.width / result.height) * 2).toBeCloseTo(1, 6)
  })
})
