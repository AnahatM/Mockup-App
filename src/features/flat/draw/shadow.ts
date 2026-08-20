import { resolveShadowLook, shadowColor } from '../shadowLooks'
import type { FlatConfig } from '../schema'
import { clearShadow, roundRect, withShadow, type Frame } from './chrome'

/**
 * Casts the container's drop shadow as a filled, blurred silhouette, then
 * clears the shadow state so nothing drawn afterwards casts its own.
 *
 * The silhouette is drawn larger than the frame by `spread` before blurring —
 * see `shadowLooks.ts` for why that is the shape of a canvas "spread".
 */
export function drawShadow(
  ctx: CanvasRenderingContext2D,
  canvasWidth: number,
  frame: Frame,
  radius: number,
  config: FlatConfig,
  chrome: string,
  dominant: string | null,
): void {
  if (config.shadowStyle === 'none' || config.shadow <= 0) return

  const look = resolveShadowLook(config.shadowStyle)
  const spread = canvasWidth * look.spread

  ctx.save()
  withShadow(
    ctx,
    canvasWidth * look.blur,
    canvasWidth * look.offsetY,
    shadowColor(look, config.shadow, dominant),
  )
  roundRect(
    ctx,
    frame.x - spread,
    frame.y - spread,
    frame.width + spread * 2,
    frame.height + spread * 2,
    radius + spread,
  )
  ctx.fillStyle = chrome
  ctx.fill()
  ctx.restore()
  clearShadow(ctx)
}
