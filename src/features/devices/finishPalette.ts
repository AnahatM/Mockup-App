import { DEVICES } from './spec/registry'
import type { PaintColor } from './paint'

/**
 * Every real product finish in the catalogue, as a paint palette.
 *
 * Derived from the device specs rather than restated: the colourways are
 * already authored per device, and a second hand-written list of the same
 * colours would drift the first time someone adds a device or corrects a shade.
 *
 * This exists so a finish is not locked to the device that ships it — putting
 * a titanium grey on a tablet, or Midnight on a laptop, is a legitimate thing
 * to want and was previously impossible without typing the hex by hand.
 */
export function deviceFinishPalette(): PaintColor[] {
  const seen = new Set<string>()
  const palette: PaintColor[] = []

  for (const device of DEVICES) {
    for (const colorway of device.colorways) {
      const key = colorway.body.toLowerCase()
      if (seen.has(key)) continue
      seen.add(key)
      // Keyed by the colour, not the colourway id: several devices ship a
      // "midnight" in slightly different shades, so the ids are not unique
      // across the catalogue even though the colours are.
      palette.push({
        id: `finish-${key.slice(1)}`,
        label: colorway.label,
        body: colorway.body,
      })
    }
  }

  return palette
}
