import { hexToRgb, rgbToHex } from './hex'

/**
 * HSL conversion, for the colour moves that are awkward in RGB.
 *
 * Rotating a hue, pulling saturation down, or darkening while keeping a colour
 * recognisably itself are all one-line edits in HSL and fiddly interpolations
 * in RGB. Kept here beside the other colour maths and, like all of `lib/`,
 * pure: strings and numbers in, strings and numbers out.
 */

export interface Hsl {
  /** Degrees, 0-360. */
  h: number
  /** 0-1. */
  s: number
  /** 0-1. */
  l: number
}

const clamp01 = (v: number): number => Math.min(1, Math.max(0, v))

export function hexToHsl(hex: string): Hsl {
  const { r, g, b } = hexToRgb(hex)
  const rn = r / 255
  const gn = g / 255
  const bn = b / 255

  const max = Math.max(rn, gn, bn)
  const min = Math.min(rn, gn, bn)
  const delta = max - min
  const l = (max + min) / 2

  if (delta === 0) return { h: 0, s: 0, l }

  const s = delta / (1 - Math.abs(2 * l - 1))
  let h: number
  if (max === rn) h = ((gn - bn) / delta) % 6
  else if (max === gn) h = (bn - rn) / delta + 2
  else h = (rn - gn) / delta + 4

  return { h: (h * 60 + 360) % 360, s, l }
}

export function hslToHex({ h, s, l }: Hsl): string {
  const hue = ((h % 360) + 360) % 360
  const sat = clamp01(s)
  const light = clamp01(l)

  const c = (1 - Math.abs(2 * light - 1)) * sat
  const x = c * (1 - Math.abs(((hue / 60) % 2) - 1))
  const m = light - c / 2

  const [r, g, b] = sector(hue, c, x)
  return rgbToHex({ r: (r + m) * 255, g: (g + m) * 255, b: (b + m) * 255 })
}

/** Which face of the hue hexagon `hue` falls on. */
function sector(hue: number, c: number, x: number): [number, number, number] {
  if (hue < 60) return [c, x, 0]
  if (hue < 120) return [x, c, 0]
  if (hue < 180) return [0, c, x]
  if (hue < 240) return [0, x, c]
  if (hue < 300) return [x, 0, c]
  return [c, 0, x]
}

/** Shifts a colour in HSL space. Omitted fields are left alone; `rotate` is
 *  additive in degrees, while saturation and lightness are set outright. */
export function shift(
  hex: string,
  change: { rotate?: number; saturation?: number; lightness?: number },
): string {
  const hsl = hexToHsl(hex)
  return hslToHex({
    h: hsl.h + (change.rotate ?? 0),
    s: change.saturation ?? hsl.s,
    l: change.lightness ?? hsl.l,
  })
}
