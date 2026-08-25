import { describe, expect, it } from 'vitest'
import { DEVICES } from './registry'
import type { DeviceSpec } from './types'

/**
 * A device's `screenAspect` and its actual screen geometry have to agree.
 *
 * They are two independent statements about the same rectangle. The geometry —
 * body size less the bezel insets — is what gets drawn; `screenAspect` is what
 * an uploaded screenshot is letterboxed into. When they disagree the mockup
 * shows a screenshot with bars down two sides of a screen that is not that
 * shape, which looks like a bug in the upload rather than a wrong number in a
 * catalogue file.
 *
 * It is also the only cross-check the catalogue has against a mistyped
 * dimension. Every number in a spec file is plausible on its own; the aspect
 * ratio is the one that is published separately and can therefore disagree.
 * Caught the folding phone's unfolded width at 142.9mm against a published
 * 132.6 — eight percent too wide, and invisible in every other way.
 */

/** The screen rectangle a spec actually draws, in millimetres. */
function screenSize(spec: DeviceSpec): { width: number; height: number } {
  const inset = spec.screen.inset
  return {
    width: spec.body.width - inset * 2,
    height:
      spec.body.height -
      (spec.screen.insetTop ?? inset) -
      (spec.screen.insetBottom ?? inset),
  }
}

/**
 * Compared as long-side over short-side, because the catalogue quotes each
 * device in its own natural orientation: a phone portrait, a laptop landscape.
 * Normalising sidesteps that without needing a rule about which is which.
 */
const ratio = ({ width, height }: { width: number; height: number }): number =>
  Math.max(width, height) / Math.min(width, height)

/**
 * How far the two may drift, as a fraction.
 *
 * Not zero: a bezel is a rounded real-world measurement and a display's
 * published resolution is exact, so the two never divide out perfectly. Three
 * percent is comfortably inside a millimetre of bezel on every device here and
 * still an order of magnitude tighter than the error it caught.
 */
const TOLERANCE = 0.03

describe.each(DEVICES.map((spec) => ({ name: spec.name, spec })))(
  '$name',
  ({ spec }) => {
    it('draws a screen the shape its aspect ratio claims', () => {
      const declared = spec.screenAspect
      if (declared === undefined) return

      const drawn = ratio(screenSize(spec))
      const claimed = Math.max(declared, 1 / declared)

      expect(Math.abs(drawn - claimed) / claimed).toBeLessThan(TOLERANCE)
    })

    it('has a screen that fits inside its own body', () => {
      const { width, height } = screenSize(spec)
      expect(width).toBeGreaterThan(0)
      expect(height).toBeGreaterThan(0)
      expect(width).toBeLessThan(spec.body.width)
      expect(height).toBeLessThan(spec.body.height)
    })
  },
)
