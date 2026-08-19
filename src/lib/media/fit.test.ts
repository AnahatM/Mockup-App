import { describe, expect, it } from 'vitest'
import { fitMedia, type FitMode } from './fit'

// A portrait phone screen, and media in three shapes relative to it.
const SCREEN = { screenWidth: 66.4, screenHeight: 142.4 }
const SCREEN_ASPECT = SCREEN.screenWidth / SCREEN.screenHeight
const WIDER = SCREEN_ASPECT * 2
const TALLER = SCREEN_ASPECT / 2

const fit = (mode: FitMode, mediaAspect: number, extra = {}) =>
  fitMedia({ ...SCREEN, mediaAspect, mode, ...extra })

describe('cover', () => {
  it('keeps the plane full-screen so the media reaches the edges', () => {
    const result = fit('cover', WIDER)
    expect(result.planeWidth).toBe(SCREEN.screenWidth)
    expect(result.planeHeight).toBe(SCREEN.screenHeight)
  })

  it('crops the long axis of wider media and leaves the other untouched', () => {
    const { repeat } = fit('cover', WIDER)
    expect(repeat[0]).toBeCloseTo(0.5, 6)
    expect(repeat[1]).toBe(1)
  })

  it('crops vertically for taller media', () => {
    const { repeat } = fit('cover', TALLER)
    expect(repeat[0]).toBe(1)
    expect(repeat[1]).toBeCloseTo(0.5, 6)
  })

  it('centres the crop', () => {
    const { offset } = fit('cover', WIDER)
    expect(offset[0]).toBeCloseTo(0.25, 6)
    expect(offset[1]).toBeCloseTo(0, 6)
  })

  it('does not crop when the aspects already match', () => {
    const { repeat, offset } = fit('cover', SCREEN_ASPECT)
    expect(repeat).toEqual([1, 1])
    expect(offset).toEqual([0, 0])
  })
})

describe('contain', () => {
  it('shrinks the plane rather than cropping the texture', () => {
    const { planeWidth, planeHeight, repeat } = fit('contain', WIDER)
    expect(repeat).toEqual([1, 1])
    expect(planeWidth).toBe(SCREEN.screenWidth)
    expect(planeHeight).toBeLessThan(SCREEN.screenHeight)
  })

  it('produces a plane matching the media aspect', () => {
    const { planeWidth, planeHeight } = fit('contain', WIDER)
    expect(planeWidth / planeHeight).toBeCloseTo(WIDER, 6)
  })

  it('never exceeds the screen in either axis', () => {
    for (const aspect of [0.2, 0.5, 1, 2, 5]) {
      const { planeWidth, planeHeight } = fit('contain', aspect)
      expect(planeWidth).toBeLessThanOrEqual(SCREEN.screenWidth + 1e-9)
      expect(planeHeight).toBeLessThanOrEqual(SCREEN.screenHeight + 1e-9)
    }
  })
})

describe('stretch', () => {
  it('fills the screen with the whole texture, distorting it', () => {
    const { planeWidth, planeHeight, repeat } = fit('stretch', WIDER)
    expect(planeWidth).toBe(SCREEN.screenWidth)
    expect(planeHeight).toBe(SCREEN.screenHeight)
    expect(repeat).toEqual([1, 1])
  })
})

describe('zoom and pan', () => {
  it('zoom crops further in every mode', () => {
    const { repeat } = fit('stretch', SCREEN_ASPECT, { zoom: 2 })
    expect(repeat[0]).toBeCloseTo(0.5, 6)
    expect(repeat[1]).toBeCloseTo(0.5, 6)
  })

  it('keeps the zoomed window centred by default', () => {
    const { offset } = fit('stretch', SCREEN_ASPECT, { zoom: 2 })
    expect(offset[0]).toBeCloseTo(0.25, 6)
    expect(offset[1]).toBeCloseTo(0.25, 6)
  })

  it('pans within the crop slack without running off the texture', () => {
    for (const pan of [-1, -0.5, 0, 0.5, 1]) {
      const { offset, repeat } = fit('stretch', SCREEN_ASPECT, { zoom: 2, panX: pan })
      expect(offset[0]).toBeGreaterThanOrEqual(0)
      expect(offset[0] + repeat[0]).toBeLessThanOrEqual(1 + 1e-9)
    }
  })

  it('clamps pan beyond -1..1 instead of sampling outside the texture', () => {
    const extreme = fit('stretch', SCREEN_ASPECT, { zoom: 2, panX: 99 })
    const limit = fit('stretch', SCREEN_ASPECT, { zoom: 2, panX: 1 })
    expect(extreme.offset[0]).toBeCloseTo(limit.offset[0], 9)
  })

  it('has no pan slack when nothing is cropped', () => {
    const { offset } = fit('stretch', SCREEN_ASPECT, { panX: 1, panY: -1 })
    expect(offset).toEqual([0, 0])
  })
})

describe('robustness', () => {
  it('falls back to square for a degenerate aspect rather than producing NaN', () => {
    for (const bad of [0, -3, Number.NaN, Number.POSITIVE_INFINITY]) {
      const result = fit('contain', bad)
      expect(Number.isFinite(result.planeWidth)).toBe(true)
      expect(Number.isFinite(result.planeHeight)).toBe(true)
      expect(result.planeWidth / result.planeHeight).toBeCloseTo(1, 6)
    }
  })

  it('survives a zero or negative zoom', () => {
    const result = fit('cover', SCREEN_ASPECT, { zoom: 0 })
    expect(Number.isFinite(result.repeat[0])).toBe(true)
  })
})
