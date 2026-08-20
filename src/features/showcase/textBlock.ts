import type { Rect } from './layoutMath'
import type { ShowcaseTextConfig, TextPosition } from './schema'
import { BAND_PADDING, BLOCK_GAP, LINE_HEIGHT, REFERENCE_WIDTH, fontString } from './textFont'
import { wrapText } from './textWrap'

export interface TextGroup {
  lines: string[]
  size: number
}

/** Wrapped headline and subheading, ready to measure a reserved band or draw. */
export interface TextBlock {
  headline: TextGroup
  subheading: TextGroup
  totalHeight: number
}

/**
 * Wraps and measures the headline/subheading against a real
 * `CanvasRenderingContext2D`, so line breaks match exactly what will be
 * drawn. `config.size` is scaled from its 1600px reference so the same
 * headline reads the same size whether the export is a 1179px phone shot or
 * an 8192px banner.
 */
export function measureTextBlock(
  ctx: CanvasRenderingContext2D,
  config: ShowcaseTextConfig,
  canvasWidth: number,
): TextBlock {
  const scale = canvasWidth / REFERENCE_WIDTH
  const headlineSize = config.size * scale
  const subheadingSize = headlineSize * 0.5
  const maxWidth = canvasWidth * 0.86

  const headline = wrapGroup(ctx, config.headline, headlineSize, config.weight, maxWidth)
  const subheading = wrapGroup(ctx, config.subheading, subheadingSize, 'regular', maxWidth)

  const headlineHeight = headline.lines.length * headline.size * LINE_HEIGHT
  const subheadingHeight = subheading.lines.length * subheading.size * LINE_HEIGHT
  const gap = headline.lines.length > 0 && subheading.lines.length > 0 ? headlineSize * BLOCK_GAP : 0

  return { headline, subheading, totalHeight: headlineHeight + gap + subheadingHeight }
}

function wrapGroup(
  ctx: CanvasRenderingContext2D,
  text: string,
  size: number,
  weight: Parameters<typeof fontString>[1],
  maxWidth: number,
): TextGroup {
  ctx.font = fontString(size, weight)
  return { lines: wrapText((line) => ctx.measureText(line).width, text, maxWidth), size }
}

/**
 * The area left for devices once `block`'s band is reserved. Above/below
 * reserve a band plus padding; overlay leaves the full canvas untouched,
 * since overlay text is drawn on top of the devices, not beside them.
 */
export function contentRectFor(
  canvasWidth: number,
  canvasHeight: number,
  position: TextPosition,
  block: TextBlock,
): Rect {
  if (block.totalHeight === 0 || position === 'overlay') {
    return { x: 0, y: 0, width: canvasWidth, height: canvasHeight }
  }
  const reserved = block.totalHeight + canvasHeight * BAND_PADDING * 2
  const height = Math.max(canvasHeight * 0.4, canvasHeight - reserved)
  const y = position === 'above' ? canvasHeight - height : 0
  return { x: 0, y, width: canvasWidth, height }
}
