import { glyph, roundRect, type OverlayCanvas } from './context'
import type { OverlaysConfig } from '../schema'

/** The iOS-style home indicator: a single rounded pill at the bottom. */
export function drawGestureBar(canvas: OverlayCanvas, config: OverlaysConfig): void {
  const { ctx, width, height } = canvas
  const barWidth = width * 0.36
  const barHeight = height * 0.0042
  const y = height - height * 0.011

  ctx.save()
  ctx.fillStyle = glyph(config.gestureBarDark)
  ctx.globalAlpha = 0.92
  roundRect(ctx, (width - barWidth) / 2, y, barWidth, barHeight, barHeight)
  ctx.fill()
  ctx.restore()
}

/** Classic three-button Android navigation: back, home, recents. */
export function drawNavBar(canvas: OverlayCanvas, config: OverlaysConfig): void {
  const { ctx, width, height } = canvas
  const ink = glyph(config.gestureBarDark)
  const midY = height - height * 0.026
  const size = width * 0.05

  ctx.save()
  ctx.strokeStyle = ink
  ctx.fillStyle = ink
  ctx.lineWidth = Math.max(width * 0.006, 1)
  ctx.lineJoin = 'round'
  ctx.globalAlpha = 0.9

  // Back: a triangle pointing left.
  const backX = width * 0.25
  ctx.beginPath()
  ctx.moveTo(backX + size * 0.35, midY - size * 0.42)
  ctx.lineTo(backX - size * 0.35, midY)
  ctx.lineTo(backX + size * 0.35, midY + size * 0.42)
  ctx.closePath()
  ctx.fill()

  // Home: a circle.
  ctx.beginPath()
  ctx.arc(width * 0.5, midY, size * 0.42, 0, Math.PI * 2)
  ctx.stroke()

  // Recents: a square.
  const recentX = width * 0.75
  roundRect(
    ctx,
    recentX - size * 0.38,
    midY - size * 0.38,
    size * 0.76,
    size * 0.76,
    size * 0.1,
  )
  ctx.stroke()

  ctx.restore()
}
