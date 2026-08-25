import { describe, expect, it } from 'vitest'
import { recordingContext } from '@/lib/canvas/recordingContext'
import { overlaysSchema } from '../schema'
import { composeOverlays } from './compose'
import { referenceFor } from './points'

/**
 * The on-screen chrome, held to the platform's own measurements.
 *
 * This is ADR 0008 extended past the flat window chrome. Before it, the home
 * indicator was `width * 0.36` by `height * 0.0042` and the Android back button
 * `width * 0.25` — numbers that read as deliberate, encode nothing, and cannot
 * be checked by anyone holding a screenshot of the real thing.
 *
 * As in `chrome.test.ts`, every expected measurement is written out rather than
 * imported. Importing `INDICATOR_HEIGHT_PT` would make each assertion move with
 * the bug it exists to catch.
 */

const config = (overrides = {}) => overlaysSchema.parse(overrides)

/** A phone screen at 4 device pixels per point, so metrics come out round. */
const PX_PER_PT = 4
const PHONE = { width: 393 * PX_PER_PT, height: 852 * PX_PER_PT }

const canvasFor = (size: { width: number; height: number }) => {
  const recording = recordingContext()
  return { ...recording, canvas: { ctx: recording.ctx, ...size } }
}

describe('the iOS home indicator', () => {
  it('is 5pt tall and sits 8pt clear of the bottom edge', () => {
    const { canvas, paths } = canvasFor(PHONE)
    composeOverlays(
      canvas,
      ['gesture-bar'],
      config({ gestureBar: true, statusBar: false }),
      'phone',
    )

    // One rounded pill: the recorder reports its bounding rect.
    const pill = paths.at(-1)
    expect(pill).toBeDefined()
    expect(pill?.height).toBeCloseTo(5 * PX_PER_PT, 6)
    expect(PHONE.height - (pill?.y ?? 0) - (pill?.height ?? 0)).toBeCloseTo(
      8 * PX_PER_PT,
      6,
    )
  })

  it('is just over a third of the screen wide, and centred', () => {
    const { canvas, paths } = canvasFor(PHONE)
    composeOverlays(canvas, ['gesture-bar'], config({ gestureBar: true }), 'phone')

    const pill = paths.at(-1)
    expect((pill?.width ?? 0) / PHONE.width).toBeCloseTo(139 / 393, 3)
    expect((pill?.x ?? 0) + (pill?.width ?? 0) / 2).toBeCloseTo(PHONE.width / 2, 6)
  })
})

describe('reference screens', () => {
  it('does not treat a tablet as a large phone', () => {
    /*
     * The whole reason a single reference is not enough. An iPhone's status bar
     * is 54pt on a 393pt-wide screen; an iPad's is 24pt on a 1024pt one. Scaling
     * the phone's figures to tablet width would put a bar nearly three times
     * too deep on every tablet in the catalogue.
     */
    const phone = referenceFor('phone', 'ios')
    const tablet = referenceFor('tablet', 'ios')
    expect(tablet.width).toBeGreaterThan(phone.width * 2)
    expect(phone.width).toBe(393)
    expect(tablet.width).toBe(1024)
  })

  it('sends laptops and desktops to the same macOS screen', () => {
    // macOS chrome is a fixed point size on every display it runs on, so one
    // reference covers the laptop, the monitor and the all-in-one.
    expect(referenceFor('laptop', 'ios')).toEqual(referenceFor('desktop', 'ios'))
    expect(referenceFor('laptop', 'ios').width).toBe(1512)
  })

  it('gives Android its own screen, because dp is not pt', () => {
    expect(referenceFor('phone', 'android').width).toBe(412)
    expect(referenceFor('phone', 'ios').width).toBe(393)
  })
})
