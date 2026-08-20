import { resolveContainerLook } from './containerLooks'
import { roundRect, type Frame } from './draw/chrome'
import { drawContainerBorder, drawRecess, drawSheen } from './draw/containerChrome'
import { drawShadow } from './draw/shadow'
import { drawBrowserBar, drawMacBar, type BarGeometry } from './draw/titleBar'
import type { FlatConfig } from './schema'

/**
 * Window proportion — 16:10 reads as a desktop window. Shared by the device
 * screen texture, the flat export, and the live preview so all three ever
 * agree on the canvas shape they hand to `composeWindow`.
 */
export const WINDOW_ASPECT = 16 / 10

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
  /** Screenshot's dominant colour, for the "adaptive" shadow preset. */
  dominant: string | null
}

/**
 * Draws a framed window: shadow, content, chrome, then the container's border
 * on top. When `hideMockup` is set, skips the frame entirely and draws the
 * content over the whole canvas, so the screenshot sits directly on the
 * backdrop with no chrome at all.
 *
 * Content is drawn with a cover fit so a screenshot of any aspect fills its
 * target area without letterboxing or distortion — the same compose call
 * produces both the on-device screen texture and the flat PNG export.
 */
export function composeWindow(options: ComposeOptions): void {
  const { ctx, width, height, config, content, contentAspect } = options
  ctx.clearRect(0, 0, width, height)

  if (!config.transparentBackground) {
    ctx.fillStyle = config.background
    ctx.fillRect(0, 0, width, height)
  }

  if (config.hideMockup) {
    drawCover(ctx, { x: 0, y: 0, width, height }, content, contentAspect)
    return
  }

  composeFrame(options)
}

function composeFrame({
  ctx,
  width,
  height,
  config,
  content,
  contentAspect,
  chrome,
  dominant,
}: ComposeOptions): void {
  const look = resolveContainerLook(config.containerStyle)
  const margin = width * config.margin
  const frame: Frame = {
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

  drawShadow(ctx, width, frame, radius, config, chrome, dominant)
  drawContent(ctx, frame, bar.height, radius, content, contentAspect, config)
  drawRecess(ctx, frame, frame.y + bar.height, radius, look)
  drawSheen(ctx, frame, radius, look)

  ctx.save()
  ctx.globalAlpha = look.chromeOpacity
  if (config.style === 'macos') drawMacBar(ctx, bar, config, chrome)
  if (config.style === 'browser') drawBrowserBar(ctx, bar, config, chrome)
  ctx.restore()

  drawContainerBorder(ctx, frame, radius, look, chrome)
}

function drawContent(
  ctx: CanvasRenderingContext2D,
  frame: Frame,
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

  const body: Frame = { x: frame.x, y: bodyY, width: frame.width, height: bodyHeight }
  drawCover(ctx, body, content, contentAspect)

  ctx.restore()
}

/**
 * Draws `content` to cover `area` without distortion: scales up until both
 * axes are covered, then centres the overflow.
 */
function drawCover(
  ctx: CanvasRenderingContext2D,
  area: Frame,
  content: CanvasImageSource | null,
  contentAspect: number,
): void {
  if (!content) return

  const aspect = contentAspect > 0 ? contentAspect : 1
  const areaAspect = area.width / area.height
  const drawWidth = aspect > areaAspect ? area.height * aspect : area.width
  const drawHeight = aspect > areaAspect ? area.height : area.width / aspect
  ctx.drawImage(
    content,
    area.x + (area.width - drawWidth) / 2,
    area.y + (area.height - drawHeight) / 2,
    drawWidth,
    drawHeight,
  )
}
