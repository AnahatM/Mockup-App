import { glyph, roundRect, type OverlayCanvas } from './context'
import { pointScale, type ReferenceScreen } from './points'
import type { OverlaysConfig } from '../schema'

/**
 * The phone status bar: time on the left, cellular/wifi/battery on the right.
 *
 * Every measurement is in the platform's own points, converted once from the
 * reference screen the device belongs to — see `points.ts`. That reference is
 * why the status bar no longer has to pretend a tablet is a big phone: an
 * iPhone's bar is 54pt on a 393pt-wide screen and an iPad's is 24pt on a
 * 1024pt one, which is not the same bar scaled.
 *
 * Android puts the clock hard left, which is the only place the two platforms
 * diverge here.
 */
const BAR_HEIGHT_PT = 54
const TIME_PT = 17
const IOS_TIME_CENTRE_PT = 60
const EDGE_INSET_PT = 16
const GLYPH_GAP_PT = 5
const BATTERY_PT = 26
const GLYPH_PT = 17

export function drawStatusBar(
  canvas: OverlayCanvas,
  config: OverlaysConfig,
  platform: 'ios' | 'android',
  reference: ReferenceScreen,
): void {
  const { ctx, width } = canvas
  const pt = pointScale(canvas, reference)
  const ink = glyph(config.statusBarDark)
  // The clock sits above the middle of the bar: below it is the notch's chin.
  const midY = BAR_HEIGHT_PT * pt * 0.55
  const inset = EDGE_INSET_PT * pt

  ctx.save()
  ctx.fillStyle = ink
  ctx.strokeStyle = ink

  // Time, and optionally a carrier name beside it.
  ctx.font = `600 ${TIME_PT * pt}px -apple-system, "SF Pro Text", "Segoe UI", system-ui, sans-serif`
  ctx.textAlign = platform === 'ios' ? 'center' : 'left'
  ctx.textBaseline = 'middle'
  const label = config.carrier ? `${config.carrier}  ${config.time}` : config.time
  ctx.fillText(label, platform === 'ios' ? IOS_TIME_CENTRE_PT * pt : inset, midY)

  // Right-hand glyph cluster, laid out right to left.
  const gap = GLYPH_GAP_PT * pt
  let x = width - inset
  if (config.showBattery) {
    x -= drawBattery(ctx, x, midY, BATTERY_PT * pt, config.batteryLevel, ink)
    x -= gap
  }
  if (config.showWifi) {
    x -= drawWifi(ctx, x, midY, GLYPH_PT * pt, ink)
    x -= gap
  }
  if (config.showSignal) {
    drawSignal(ctx, x, midY, GLYPH_PT * pt, ink)
  }

  ctx.restore()
}

/** Returns the width consumed, so the caller can lay glyphs out right to left. */
function drawBattery(
  ctx: CanvasRenderingContext2D,
  right: number,
  midY: number,
  size: number,
  level: number,
  ink: string,
): number {
  const h = size * 0.5
  const capW = size * 0.06
  const bodyW = size - capW - size * 0.05
  const x = right - size
  const y = midY - h / 2

  ctx.globalAlpha = 0.4
  ctx.lineWidth = Math.max(size * 0.045, 1)
  roundRect(ctx, x, y, bodyW, h, h * 0.34)
  ctx.stroke()

  ctx.globalAlpha = 1
  const fill = Math.max(0, Math.min(1, level))
  const pad = size * 0.05
  roundRect(ctx, x + pad, y + pad, (bodyW - pad * 2) * fill, h - pad * 2, h * 0.22)
  ctx.fill()

  ctx.globalAlpha = 0.4
  roundRect(ctx, x + bodyW + size * 0.03, midY - h * 0.18, capW, h * 0.36, capW * 0.5)
  ctx.fill()
  ctx.globalAlpha = 1

  ctx.fillStyle = ink
  return size
}

function drawWifi(
  ctx: CanvasRenderingContext2D,
  right: number,
  midY: number,
  size: number,
  ink: string,
): number {
  const cx = right - size / 2
  const cy = midY + size * 0.26
  ctx.fillStyle = ink

  for (let arc = 2; arc >= 0; arc -= 1) {
    const radius = size * (0.2 + arc * 0.19)
    ctx.beginPath()
    ctx.arc(cx, cy, radius, Math.PI * 1.22, Math.PI * 1.78)
    ctx.lineWidth = size * 0.13
    ctx.strokeStyle = ink
    ctx.stroke()
  }
  ctx.beginPath()
  ctx.arc(cx, cy, size * 0.07, 0, Math.PI * 2)
  ctx.fill()

  return size
}

function drawSignal(
  ctx: CanvasRenderingContext2D,
  right: number,
  midY: number,
  size: number,
  ink: string,
): number {
  const bars = 4
  const gap = size * 0.08
  const barW = (size - gap * (bars - 1)) / bars
  const maxH = size * 0.62
  ctx.fillStyle = ink

  for (let i = 0; i < bars; i += 1) {
    const h = maxH * (0.34 + (i / (bars - 1)) * 0.66)
    const x = right - size + i * (barW + gap)
    ctx.globalAlpha = i < 3 ? 1 : 0.35
    roundRect(ctx, x, midY + maxH / 2 - h, barW, h, barW * 0.35)
    ctx.fill()
  }
  ctx.globalAlpha = 1

  return size
}
