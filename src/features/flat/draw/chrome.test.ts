import { describe, expect, it } from 'vitest'
import { flatSchema } from '../schema'
import type { FlatConfig } from '../schema'
import { drawMacBar } from './macBar'
import { drawBrowserBar } from './browserBar'
import { recordingContext } from './recordingContext'

/**
 * The window chrome is measured off the real thing, in macOS points, and
 * nothing about it is visible to the type checker: every number is a float
 * multiplied by another float, and getting one wrong produces a mockup that is
 * merely slightly wrong-looking rather than a test failure.
 *
 * These lock the measurements that were calibrated by eye against screenshots:
 * 12pt window buttons on a 20pt pitch, 20pt in from the edge, on both a 28pt
 * title bar and a 52pt Safari toolbar. The bug this exists to prevent is the
 * one that shipped first — expressing those as fractions of whatever bar they
 * were on, which quietly made the browser's buttons nearly twice full size.
 */

const config = (overrides: Partial<FlatConfig> = {}): FlatConfig => ({
  ...flatSchema.parse({}),
  ...overrides,
})

/*
 * The measurements, restated here as plain numbers rather than imported from
 * the module under test. Importing the constants would make every assertion
 * below a tautology: change `LIGHT_DIAMETER_PT` to 14 and both the code and its
 * "expected" value move together, and the suite stays green while every mockup
 * in the app grows fat window buttons. Verified by doing exactly that.
 */
const TITLE_BAR = 28
const TOOLBAR = 52
const BUTTON = 12
const PITCH = 20
const INSET = 20

/** A 28pt title bar at 4px per point, so every metric below is a round number. */
const PX_PER_PT = 4
const BAR = { x: 100, y: 50, width: 1000, height: TITLE_BAR * PX_PER_PT, radius: 8 }

describe('macOS title bar', () => {
  it('draws 12pt buttons on a 20pt pitch, 20pt in from the window edge', () => {
    const { ctx, arcs } = recordingContext()
    drawMacBar(ctx, BAR, config({ style: 'macos' }), '#e9e7e2')

    // Two arcs per button: the disc, then the rim stroked inside it.
    const discs = arcs.filter((arc) => arc.op === 'fill')
    expect(discs).toHaveLength(3)

    expect(discs.map((d) => d.x)).toEqual([
      BAR.x + INSET * PX_PER_PT,
      BAR.x + (INSET + PITCH) * PX_PER_PT,
      BAR.x + (INSET + PITCH * 2) * PX_PER_PT,
    ])
    expect((discs[0]?.radius ?? 0) * 2).toBe(BUTTON * PX_PER_PT)
  })

  it('gives an unfocused window three identical grey buttons', () => {
    const { ctx, arcs } = recordingContext()
    drawMacBar(ctx, BAR, config({ style: 'macos', trafficLightsMuted: true }), '#e9e7e2')

    const fills = new Set(arcs.filter((arc) => arc.op === 'fill').map((a) => a.color))
    expect(fills.size).toBe(1)
    expect(fills.has('#ff5f57')).toBe(false)
  })

  it('centres the title on the window, not on the space left of the buttons', () => {
    const { ctx, texts } = recordingContext()
    drawMacBar(ctx, BAR, config({ style: 'macos', title: 'Mockup Studio' }), '#e9e7e2')

    const title = texts.find((text) => text.text === 'Mockup Studio')
    expect(title?.align).toBe('center')
    expect(title?.x).toBe(BAR.x + BAR.width / 2)
  })

  it('draws no buttons at all when they are switched off', () => {
    const { ctx, arcs } = recordingContext()
    drawMacBar(ctx, BAR, config({ style: 'macos', trafficLights: false }), '#e9e7e2')
    expect(arcs).toHaveLength(0)
  })
})

describe('browser chrome', () => {
  /** The browser bar is 1.75x the title bar — see `compose.ts`. */
  const wide = { ...BAR, height: BAR.height * 1.75 }

  it('keeps the window buttons at 12pt on the taller toolbar', () => {
    const { ctx, arcs } = recordingContext()
    drawBrowserBar(ctx, wide, config({ style: 'browser', tabs: 3 }), '#e9e7e2')

    const discs = arcs.filter((arc) => arc.op === 'fill')
    expect(discs).toHaveLength(3)

    /*
     * The bug this replaces: the buttons were sized against the *bar*, which
     * on the browser meant the toolbar row plus the tab strip. Measured against
     * the toolbar row alone they come out at Safari's 12-out-of-52, and the
     * ratio below is the whole assertion — a button that grows with the tab
     * strip is a button drawn against the wrong box.
     */
    const toolbar = (wide.height * TOOLBAR) / (TOOLBAR + 36)
    expect((discs[0]?.radius ?? 0) * 2).toBeCloseTo((BUTTON / TOOLBAR) * toolbar, 6)
    expect(discs[0]?.x).toBeCloseTo(wide.x + (INSET / TOOLBAR) * toolbar, 6)
  })

  it('hides the tab strip when there are no tabs, as Safari does', () => {
    const withTabs = recordingContext()
    drawBrowserBar(withTabs.ctx, wide, config({ style: 'browser', tabs: 3 }), '#e9e7e2')
    const without = recordingContext()
    drawBrowserBar(without.ctx, wide, config({ style: 'browser', tabs: 0 }), '#e9e7e2')

    /*
     * The strip is the only full-width band painted in a flat colour — the
     * toolbar above it is a gradient, which the recorder reports as no colour,
     * and the separator under it is exactly one pixel tall.
     */
    const strip = (r: { width: number; height: number; fill: string }) =>
      r.width === wide.width && r.height > 1 && r.fill !== ''
    expect(withTabs.rects.some(strip)).toBe(true)
    expect(without.rects.some(strip)).toBe(false)
  })

  it('puts the page title in the frontmost tab and the address in the field', () => {
    const { ctx, texts } = recordingContext()
    const cfg = config({ style: 'browser', tabs: 3, title: 'Mockup Studio', url: 'example.test' })
    drawBrowserBar(ctx, wide, cfg, '#e9e7e2')

    expect(texts.map((text) => text.text)).toEqual(['example.test', 'Mockup Studio'])
  })
})
