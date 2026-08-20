import { mix } from '@/lib/color/hex'
import type { ContainerLook } from '../containerLooks'
import { roundRect, type Frame } from './chrome'

/**
 * Outer stroke around the whole frame, tinted from the chrome colour.
 *
 * Drawn last in the compose order (see `compose.ts`), on top of the bar and
 * content, so "Outline" and "Border" read as crisp edges rather than being
 * partly obscured by whatever sits inside the frame.
 */
export function drawContainerBorder(
  ctx: CanvasRenderingContext2D,
  frame: Frame,
  radius: number,
  look: ContainerLook,
  chrome: string,
): void {
  const width = frame.width * look.borderWidth
  if (look.borderOpacity <= 0 || width <= 0) return

  ctx.save()
  ctx.globalAlpha = look.borderOpacity
  ctx.strokeStyle = mix(chrome, look.tone === 'light' ? '#ffffff' : '#000000', 0.6)
  ctx.lineWidth = width
  roundRect(
    ctx,
    frame.x + width / 2,
    frame.y + width / 2,
    frame.width - width,
    frame.height - width,
    radius,
  )
  ctx.stroke()
  ctx.restore()
}

/**
 * Soft top-lit gradient over the content — the closest a flat canvas gets to
 * a frosted-glass sheen without a real backdrop to blur. See the approximation
 * note in `containerLooks.ts`.
 */
export function drawSheen(
  ctx: CanvasRenderingContext2D,
  frame: Frame,
  radius: number,
  look: ContainerLook,
): void {
  if (look.sheenOpacity <= 0) return

  const tint = look.tone === 'light' ? '255, 255, 255' : '0, 0, 0'
  const gradient = ctx.createLinearGradient(0, frame.y, 0, frame.y + frame.height)
  gradient.addColorStop(0, `rgba(${tint}, ${look.sheenOpacity})`)
  gradient.addColorStop(0.55, `rgba(${tint}, 0)`)

  ctx.save()
  roundRect(ctx, frame.x, frame.y, frame.width, frame.height, radius)
  ctx.clip()
  ctx.fillStyle = gradient
  ctx.fillRect(frame.x, frame.y, frame.width, frame.height)
  ctx.restore()
}

/**
 * Inner shadow hugging the content's top edge — an approximation of a screen
 * recessed into its bezel, since canvas cannot cast a true inset/bevel shadow.
 */
export function drawRecess(
  ctx: CanvasRenderingContext2D,
  frame: Frame,
  bodyY: number,
  radius: number,
  look: ContainerLook,
): void {
  if (look.recessOpacity <= 0) return

  const bandHeight = frame.height * 0.16
  const gradient = ctx.createLinearGradient(0, bodyY, 0, bodyY + bandHeight)
  gradient.addColorStop(0, `rgba(0, 0, 0, ${look.recessOpacity})`)
  gradient.addColorStop(1, 'rgba(0, 0, 0, 0)')

  ctx.save()
  roundRect(ctx, frame.x, frame.y, frame.width, frame.height, radius)
  ctx.clip()
  ctx.fillStyle = gradient
  ctx.fillRect(frame.x, bodyY, frame.width, bandHeight)
  ctx.restore()
}
