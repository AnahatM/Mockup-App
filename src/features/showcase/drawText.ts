import type { ShowcaseTextConfig, TextPosition, TextWeight } from './schema'
import type { TextBlock, TextGroup } from './textBlock'
import { BAND_PADDING, BLOCK_GAP, LINE_HEIGHT, fontString } from './textFont'

/**
 * Draws the headline/subheading onto the export canvas itself — not a DOM
 * overlay — which is what makes the text survive `canvas.toBlob()`. See the
 * design note in `composeShowcase.ts` for why compositing beats a 3D text
 * mesh here.
 */
export function drawTextBlock(
  ctx: CanvasRenderingContext2D,
  config: ShowcaseTextConfig,
  canvasWidth: number,
  canvasHeight: number,
  block: TextBlock,
): void {
  if (block.totalHeight === 0) return

  const bandTop = bandTopFor(config.position, canvasHeight, block.totalHeight)
  const x = xFor(config.align, canvasWidth)
  ctx.textAlign = config.align
  ctx.textBaseline = 'alphabetic'

  let y = bandTop + canvasHeight * BAND_PADDING + block.headline.size
  if (block.headline.lines.length > 0) {
    y = drawGroup(ctx, block.headline, config.weight, config.color, x, y)
    y += block.headline.size * BLOCK_GAP
  }
  if (block.subheading.lines.length > 0) {
    drawGroup(ctx, block.subheading, 'regular', config.color, x, y)
  }
}

/** 'above' and 'overlay' both anchor to the top; only 'below' sits at the foot. */
function bandTopFor(position: TextPosition, canvasHeight: number, totalHeight: number): number {
  if (position === 'below') return canvasHeight - (totalHeight + canvasHeight * BAND_PADDING * 2)
  return 0
}

function xFor(align: ShowcaseTextConfig['align'], canvasWidth: number): number {
  if (align === 'left') return canvasWidth * 0.07
  if (align === 'right') return canvasWidth * 0.93
  return canvasWidth / 2
}

/** Draws one wrapped group and returns the y just past its last line. */
function drawGroup(
  ctx: CanvasRenderingContext2D,
  group: TextGroup,
  weight: TextWeight,
  color: string,
  x: number,
  y: number,
): number {
  ctx.font = fontString(group.size, weight)
  ctx.fillStyle = color
  let cursor = y
  for (const line of group.lines) {
    ctx.fillText(line, x, cursor)
    cursor += group.size * LINE_HEIGHT
  }
  return cursor
}
