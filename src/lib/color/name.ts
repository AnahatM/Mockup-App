import { hexToRgb, type Rgb } from './hex'

/**
 * Names for arbitrary colours.
 *
 * Colours extracted from a screenshot arrive as bare hex, and a row of
 * unlabelled chips is unusable — you cannot tell two similar blues apart, and
 * you cannot refer to one in conversation. Naming them approximately is far
 * more useful than not naming them.
 */

interface NamedColor {
  name: string
  rgb: Rgb
  saturation: number
}

/** Coarse on purpose: these are labels for chips, not paint-shop matches. */
const REFERENCE: ReadonlyArray<readonly [string, string]> = [
  ['Black', '#000000'],
  ['Charcoal', '#333333'],
  ['Graphite', '#4d4d4d'],
  ['Grey', '#808080'],
  ['Silver', '#c0c0c0'],
  ['Off-white', '#f2f0eb'],
  ['White', '#ffffff'],

  ['Maroon', '#7b1e2b'],
  ['Red', '#e02020'],
  ['Coral', '#f4685c'],
  ['Pink', '#f06292'],
  ['Crimson', '#d81b60'],
  ['Magenta', '#c2185b'],

  ['Brown', '#7a4a2f'],
  ['Rust', '#b7410e'],
  ['Orange', '#f57c00'],
  ['Amber', '#ffb300'],
  ['Gold', '#d4af37'],
  ['Yellow', '#f5e050'],
  ['Cream', '#f5e9c8'],

  ['Olive', '#6b7a2f'],
  ['Lime', '#8bc34a'],
  ['Green', '#2e9e4f'],
  ['Forest', '#1b5e34'],
  ['Mint', '#7fd6b0'],
  ['Teal', '#0f8a80'],

  ['Cyan', '#20c4d4'],
  ['Sky', '#4aa8f0'],
  ['Blue', '#2255cc'],
  ['Navy', '#1a2b6b'],
  ['Indigo', '#3f47c4'],
  ['Violet', '#7b3fd4'],
  ['Lavender', '#b39ddb'],
  ['Purple', '#6a2fa0'],

  ['Tan', '#c8a97e'],
  ['Beige', '#ddd0b8'],
  ['Sand', '#c2b280'],
]

const TABLE: readonly NamedColor[] = REFERENCE.map(([name, hex]) => {
  const rgb = hexToRgb(hex)
  return { name, rgb, saturation: saturationOf(rgb) }
})

/** 0 for a grey, 1 for a fully saturated colour. */
function saturationOf({ r, g, b }: Rgb): number {
  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  return max === 0 ? 0 : (max - min) / max
}

/**
 * Distance between two colours, using the "redmean" approximation.
 *
 * Plain RGB distance calls navy and forest green near-identical because it
 * treats all three channels as equally visible. Redmean weights them by where
 * the colour sits on the red axis, which is close enough to how the eye works
 * to pick sensible names — and unlike a Lab conversion it is four lines.
 */
function distance(a: Rgb, b: Rgb): number {
  const meanRed = (a.r + b.r) / 2
  const dr = a.r - b.r
  const dg = a.g - b.g
  const db = a.b - b.b
  return (
    (2 + meanRed / 256) * dr * dr + 4 * dg * dg + (2 + (255 - meanRed) / 256) * db * db
  )
}

/**
 * How strongly a saturation mismatch is punished.
 *
 * Without this, a dark navy is named "Charcoal": the greys sit in the middle of
 * the cube, so in absolute distance they are near everything dark, and the
 * nearest neutral beats the correct hue. Comparing how *colourful* two colours
 * are separates the neutral ramp from the hues regardless of brightness.
 */
const SATURATION_WEIGHT = 90_000

/** The closest name in the reference table. Never fails — there is always a nearest. */
export function nameColor(hex: string): string {
  const rgb = hexToRgb(hex)
  const saturation = saturationOf(rgb)
  let best = TABLE[0]
  let bestDistance = Infinity

  for (const candidate of TABLE) {
    const mismatch = saturation - candidate.saturation
    const d = distance(rgb, candidate.rgb) + SATURATION_WEIGHT * mismatch * mismatch
    if (d < bestDistance) {
      bestDistance = d
      best = candidate
    }
  }

  return best?.name ?? 'Colour'
}
