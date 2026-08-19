import { clearShadow, roundRect, withShadow } from './draw/chrome'
import { drawBrowserBar, drawMacBar, type BarGeometry } from './draw/titleBar'
import type { FlatConfig } from './schema'

export interface ComposeOptions {
  ctx: CanvasRenderingContext2D
  width: number
  height: number
  config: FlatConfig
  /** The user's screenshot or a video frame. */
  content: CanvasImageSource | null
  /** Aspect of `content`, used to fill the window without distortion. */
  contentAspect: number
  /** Chrome colour, already resolved from the palette when colour-matching. */
  chrome: string
}

/**
 * Draws a framed window: chrome, then the content clipped inside it.
 *
 * Content is drawn with a cover fit so a screenshot of any aspect fills the
 * window body without letterboxing or distortion — the window's proportions are
 * chosen by the user, and the screenshot should conform to them.
 */
export function composeWindow({
  ctx,
  width,
  height,
  config,
  content,
  contentAspect,
  chrome,
}: ComposeOptions): void {
  ctx.clearRect(0, 0, width, height)

  if (!config.transparentBackground) {
    ctx.fillStyle = config.background
    ctx.fillRect(0, 0, width, height)
  }

  const margin = width * config.margin
  const frame = {
    x: margin,
    y: margin,
    width: width - margin * 2,
    height: height - margin * 2,
  }
  const radius = width * config.cornerRadius
  const barHeight = config.style === 'none' ? 0 : width * config.barHeight
  const bar: BarGeometry = {
    x: frame.x,
    y: frame.y,
    width: frame.width,
    height: config.style === 'browser' ? barHeight * 1.75 : barHeight,
    radius,
  }

  // Shadow is cast by a filled silhouette, then cleared, so the chrome and
  // content drawn afterwards do not each cast their own.
  if (config.shadow > 0) {
    ctx.save()
    withShadow(ctx, width * 0.05, width * 0.014, config.shadow)
    roundRect(ctx, frame.x, frame.y, frame.width, frame.height, radius)
    ctx.fillStyle = chrome
    ctx.fill()
    ctx.restore()
    clearShadow(ctx)
  }

  drawContent(ctx, frame, bar.height, radius, content, contentAspect, config)

  if (config.style === 'macos') drawMacBar(ctx, bar, config, chrome)
  if (config.style === 'browser') drawBrowserBar(ctx, bar, config, chrome)
}

function drawContent(
  ctx: CanvasRenderingContext2D,
  frame: { x: number; y: number; width: number; height: number },
  barHeight: number,
  radius: number,
  content: CanvasImageSource | null,
  contentAspect: number,
  config: FlatConfig,
): void {
  const bodyY = frame.y + barHeight
  const bodyHeight = frame.height - barHeight
  if (bodyHeight <= 0) return

  ctx.save()
  roundRect(ctx, frame.x, frame.y, frame.width, frame.height, radius)
  ctx.clip()

  ctx.fillStyle = config.dark ? '#15171b' : '#ffffff'
  ctx.fillRect(frame.x, bodyY, frame.width, bodyHeight)

  if (content) {
    // Cover fit: scale up until both axes are covered, then centre the overflow.
    const aspect = contentAspect > 0 ? contentAspect : 1
    const bodyAspect = frame.width / bodyHeight
    const drawWidth = aspect > bodyAspect ? bodyHeight * aspect : frame.width
    const drawHeight = aspect > bodyAspect ? bodyHeight : frame.width / aspect
    ctx.drawImage(
      content,
      frame.x + (frame.width - drawWidth) / 2,
      bodyY + (bodyHeight - drawHeight) / 2,
      drawWidth,
      drawHeight,
    )
  }

  ctx.restore()
}
