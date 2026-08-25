import { glyph, roundRect, type OverlayCanvas } from './context'
import { pointScale, type ReferenceScreen } from './points'
import type { OverlaysConfig } from '../schema'

/**
 * The bottom of the screen: iOS's home indicator, or Android's three buttons.
 *
 * Measured in platform points rather than fractions of the canvas — see
 * `points.ts`. The previous numbers were invented: the indicator was
 * `width * 0.36` by `height * 0.0042`, which happens to land near the truth on
 * a phone and nowhere near it on a tablet, where the pill is more than twice as
 * wide in points but a *smaller* share of the screen.
 */

/** iPhone 15 Pro: a 139 x 5pt pill, 8pt clear of the bottom edge. */
const INDICATOR_WIDTH_PT = 139
const INDICATOR_HEIGHT_PT = 5
const INDICATOR_BOTTOM_PT = 8

/**
 * The indicator is a fixed share of the screen's width rather than a fixed
 * width: 139 of 393 on a phone, 320 of 1024 on an iPad. Both are just over a
 * third, which is the one thing about it that does generalise.
 */
const INDICATOR_SHARE = INDICATOR_WIDTH_PT / 393

export function drawGestureBar(
  canvas: OverlayCanvas,
  config: OverlaysConfig,
  reference: ReferenceScreen,
): void {
  const { ctx, width, height } = canvas
  const pt = pointScale(canvas, reference)

  const barWidth = width * INDICATOR_SHARE
  const barHeight = INDICATOR_HEIGHT_PT * pt
  const y = height - INDICATOR_BOTTOM_PT * pt - barHeight

  ctx.save()
  ctx.fillStyle = glyph(config.gestureBarDark)
  ctx.globalAlpha = 0.92
  roundRect(ctx, (width - barWidth) / 2, y, barWidth, barHeight, barHeight)
  ctx.fill()
  ctx.restore()
}

/**
 * Android's three-button navigation: back, home, recents.
 *
 * The bar is 48dp tall and the icons 24dp, on thirds of the width — which is
 * where Android actually puts them, and near enough to what the old fractions
 * were doing that this is a correction of provenance more than of pixels. That
 * is worth having anyway: the next person can check 48 against a screenshot,
 * and could never have checked 0.026.
 */
const NAV_HEIGHT_DP = 48
const NAV_ICON_DP = 24
const NAV_STROKE_DP = 2

export function drawNavBar(
  canvas: OverlayCanvas,
  config: OverlaysConfig,
  reference: ReferenceScreen,
): void {
  const { ctx, width, height } = canvas
  const pt = pointScale(canvas, reference)
  const ink = glyph(config.gestureBarDark)

  const midY = height - (NAV_HEIGHT_DP / 2) * pt
  const icon = NAV_ICON_DP * pt

  ctx.save()
  ctx.strokeStyle = ink
  ctx.fillStyle = ink
  ctx.lineWidth = Math.max(NAV_STROKE_DP * pt, 1)
  ctx.lineJoin = 'round'
  ctx.globalAlpha = 0.9

  // Back: a triangle pointing left.
  const backX = width * 0.25
  ctx.beginPath()
  ctx.moveTo(backX + icon * 0.3, midY - icon * 0.36)
  ctx.lineTo(backX - icon * 0.3, midY)
  ctx.lineTo(backX + icon * 0.3, midY + icon * 0.36)
  ctx.closePath()
  ctx.fill()

  // Home: a circle.
  ctx.beginPath()
  ctx.arc(width * 0.5, midY, icon * 0.36, 0, Math.PI * 2)
  ctx.stroke()

  // Recents: a rounded square.
  const recentX = width * 0.75
  const side = icon * 0.64
  roundRect(ctx, recentX - side / 2, midY - side / 2, side, side, icon * 0.08)
  ctx.stroke()

  ctx.restore()
}
