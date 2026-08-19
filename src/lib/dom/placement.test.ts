import { describe, expect, it } from 'vitest'
import { place, type Rect } from './placement'

const viewport: Rect = { left: 0, top: 0, width: 1000, height: 800 }
const floating: Rect = { left: 0, top: 0, width: 120, height: 30 }

/** An anchor of the given size, centred at (x, y). */
const anchorAt = (x: number, y: number, width = 32, height = 32): Rect => ({
  left: x - width / 2,
  top: y - height / 2,
  width,
  height,
})

describe('place', () => {
  it('uses the preferred side when there is room', () => {
    const result = place({ anchor: anchorAt(500, 400), floating, viewport })
    expect(result.side).toBe('top')
    // Horizontally centred on the anchor.
    expect(result.left).toBe(500 - 60)
  })

  it('flips below when there is no room above', () => {
    const result = place({ anchor: anchorAt(500, 20), floating, viewport })
    expect(result.side).toBe('bottom')
    expect(result.top).toBeGreaterThan(20)
  })

  it('flips above when there is no room below', () => {
    const result = place({
      anchor: anchorAt(500, 780),
      floating,
      viewport,
      preferred: 'bottom',
    })
    expect(result.side).toBe('top')
  })

  it('keeps a left-edge tooltip fully on screen', () => {
    const result = place({ anchor: anchorAt(10, 400), floating, viewport })
    expect(result.left).toBeGreaterThanOrEqual(0)
  })

  it('keeps a right-edge tooltip fully on screen', () => {
    const result = place({ anchor: anchorAt(990, 400), floating, viewport })
    expect(result.left + floating.width).toBeLessThanOrEqual(viewport.width)
  })

  it('handles the top-left corner, where no side fits cleanly', () => {
    const result = place({ anchor: anchorAt(8, 8), floating, viewport })
    expect(result.left).toBeGreaterThanOrEqual(0)
    expect(result.top).toBeGreaterThanOrEqual(0)
    expect(result.left + floating.width).toBeLessThanOrEqual(viewport.width)
    expect(result.top + floating.height).toBeLessThanOrEqual(viewport.height)
  })

  it('handles the bottom-right corner', () => {
    const result = place({ anchor: anchorAt(992, 792), floating, viewport })
    expect(result.left + floating.width).toBeLessThanOrEqual(viewport.width)
    expect(result.top + floating.height).toBeLessThanOrEqual(viewport.height)
  })

  it('never places anything outside the viewport, wherever the anchor is', () => {
    for (let x = 0; x <= 1000; x += 50) {
      for (let y = 0; y <= 800; y += 50) {
        for (const preferred of ['top', 'bottom', 'left', 'right'] as const) {
          const result = place({ anchor: anchorAt(x, y), floating, viewport, preferred })
          expect(result.left).toBeGreaterThanOrEqual(0)
          expect(result.top).toBeGreaterThanOrEqual(0)
          expect(result.left + floating.width).toBeLessThanOrEqual(viewport.width)
          expect(result.top + floating.height).toBeLessThanOrEqual(viewport.height)
        }
      }
    }
  })

  it('respects a non-zero viewport origin', () => {
    const scrolled: Rect = { left: 100, top: 50, width: 500, height: 400 }
    const result = place({ anchor: anchorAt(110, 60), floating, viewport: scrolled })
    expect(result.left).toBeGreaterThanOrEqual(100)
    expect(result.top).toBeGreaterThanOrEqual(50)
  })

  it('prefers the opposite side before going across', () => {
    // No room above, plenty everywhere else: must choose bottom, not right.
    expect(place({ anchor: anchorAt(500, 5), floating, viewport }).side).toBe('bottom')
  })
})
