import { describe, expect, it } from 'vitest'
import { fitPreviewLayout } from './previewSize'

const ASPECT = 16 / 10

describe('fitPreviewLayout', () => {
  it('constrains by height when the available box is relatively wider than the aspect', () => {
    const layout = fitPreviewLayout({ width: 2000, height: 400 }, ASPECT, 1)
    expect(layout.displayHeight).toBe(400)
    expect(layout.displayWidth).toBeCloseTo(400 * ASPECT)
    expect(layout.displayWidth).toBeLessThan(2000)
  })

  it('constrains by width when the available box is relatively taller than the aspect', () => {
    const layout = fitPreviewLayout({ width: 300, height: 900 }, ASPECT, 1)
    expect(layout.displayWidth).toBe(300)
    expect(layout.displayHeight).toBeCloseTo(300 / ASPECT)
    expect(layout.displayHeight).toBeLessThan(900)
  })

  it('fills the box exactly when the available aspect already matches', () => {
    const layout = fitPreviewLayout({ width: 640, height: 400 }, ASPECT, 1)
    expect(layout.displayWidth).toBe(640)
    expect(layout.displayHeight).toBe(400)
  })

  it('never distorts the aspect ratio of the canvas backing store', () => {
    const layout = fitPreviewLayout({ width: 777, height: 321 }, ASPECT, 1.5)
    expect(layout.canvasWidth / layout.canvasHeight).toBeCloseTo(ASPECT, 1)
  })

  it('scales the canvas by devicePixelRatio, up to a cap of 2x', () => {
    const base = fitPreviewLayout({ width: 640, height: 400 }, ASPECT, 1)
    const hidpi = fitPreviewLayout({ width: 640, height: 400 }, ASPECT, 2)
    const overshoot = fitPreviewLayout({ width: 640, height: 400 }, ASPECT, 4)
    expect(hidpi.canvasWidth).toBe(base.canvasWidth * 2)
    expect(overshoot.canvasWidth).toBe(hidpi.canvasWidth)
  })

  it('never scales the canvas below 1x even for a sub-1 devicePixelRatio', () => {
    const layout = fitPreviewLayout({ width: 640, height: 400 }, ASPECT, 0.5)
    const unscaled = fitPreviewLayout({ width: 640, height: 400 }, ASPECT, 1)
    expect(layout.canvasWidth).toBe(unscaled.canvasWidth)
  })

  it('caps the canvas resolution well below export resolution for a huge viewport', () => {
    const layout = fitPreviewLayout({ width: 4000, height: 2500 }, ASPECT, 2)
    expect(layout.canvasWidth).toBeLessThanOrEqual(1400)
  })

  it('respects a custom max width', () => {
    const layout = fitPreviewLayout({ width: 4000, height: 2500 }, ASPECT, 2, 800)
    expect(layout.canvasWidth).toBe(800)
  })

  it('floors tiny boxes to a minimum readable canvas width', () => {
    const layout = fitPreviewLayout({ width: 40, height: 25 }, ASPECT, 1)
    expect(layout.canvasWidth).toBeGreaterThanOrEqual(240)
  })

  it('returns a degenerate but valid layout for an empty or invalid box', () => {
    expect(fitPreviewLayout({ width: 0, height: 0 }, ASPECT, 1)).toEqual({
      displayWidth: 0,
      displayHeight: 0,
      canvasWidth: 1,
      canvasHeight: 1,
    })
    expect(fitPreviewLayout({ width: 100, height: -5 }, ASPECT, 1).canvasWidth).toBe(1)
    expect(fitPreviewLayout({ width: 100, height: 100 }, 0, 1).canvasWidth).toBe(1)
  })
})
