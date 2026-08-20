import type { TextWeight } from './schema'

/**
 * System fonts only — no network fetch is possible for a canvas `font`
 * string, and this app makes no network requests at runtime (CLAUDE.md).
 * The stack covers macOS, Windows and Linux so the headline still renders
 * somewhere sane wherever the export runs.
 */
const FONT_STACK =
  '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif'

/** Headline `size` is authored at this canvas width; see `textBlock.ts`. */
export const REFERENCE_WIDTH = 1600
export const LINE_HEIGHT = 1.22
/** Gap between the headline and subheading blocks, × headline size. */
export const BLOCK_GAP = 0.45
/** Padding around the text band, × canvas height. */
export const BAND_PADDING = 0.045

export function fontString(px: number, weight: TextWeight): string {
  return `${weight === 'bold' ? 700 : 400} ${Math.round(px)}px ${FONT_STACK}`
}
