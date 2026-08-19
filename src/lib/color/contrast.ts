import { hexToRgb, type Rgb } from './hex'

/**
 * WCAG relative luminance and contrast.
 *
 * Used to decide readable foregrounds automatically — for example picking the
 * traffic-light and title-bar text colour for a 2D window mockup that has been
 * colour-matched to the user's screenshot.
 */

function channelLuminance(value: number): number {
  const c = value / 255
  return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4
}

export function relativeLuminance({ r, g, b }: Rgb): number {
  return (
    0.2126 * channelLuminance(r) +
    0.7152 * channelLuminance(g) +
    0.0722 * channelLuminance(b)
  )
}

/** Ranges from 1 (identical) to 21 (black on white). */
export function contrastRatio(hexA: string, hexB: string): number {
  const a = relativeLuminance(hexToRgb(hexA))
  const b = relativeLuminance(hexToRgb(hexB))
  const [lighter, darker] = a > b ? [a, b] : [b, a]
  return (lighter + 0.05) / (darker + 0.05)
}

/** Picks whichever candidate is more readable on `background`. */
export function readableOn(background: string, light: string, dark: string): string {
  return contrastRatio(background, light) >= contrastRatio(background, dark)
    ? light
    : dark
}

export function isDark(hex: string): boolean {
  return relativeLuminance(hexToRgb(hex)) < 0.35
}
