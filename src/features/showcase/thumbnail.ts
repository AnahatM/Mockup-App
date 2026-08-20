import { layoutSlots, type Rect } from './layoutMath'
import type { ShowcaseLayoutId } from './schema'

/** A generic portrait-phone silhouette. Illustrative only — the real export
 * uses the live viewport's own aspect (see `composeShowcase.ts`). */
const THUMB_ASPECT = 0.6

/**
 * Draws a small diagram of `layout` directly onto `canvas`, using the exact
 * same `layoutSlots` maths the real export composites with — so the gallery
 * shows the true arrangement rather than a hand-drawn approximation that can
 * drift from what actually gets exported. No bundled or fetched images: it
 * is geometry, drawn with rounded rects that pick up the current theme's
 * tokens so the gallery stays legible in light and dark.
 */
export function drawLayoutThumbnail(canvas: HTMLCanvasElement, layout: ShowcaseLayoutId): void {
  const ctx = canvas.getContext('2d')
  if (!ctx) return
  const { width, height } = canvas
  ctx.clearRect(0, 0, width, height)

  const theme = getComputedStyle(canvas)
  const fill = theme.getPropertyValue('--control-bg').trim() || '#d8d8d4'
  const stroke = theme.getPropertyValue('--border-strong').trim() || '#8a8a86'
  const accent = theme.getPropertyValue('--accent').trim() || '#5b6ef5'

  const margin = width * 0.1
  const rect: Rect = {
    x: margin,
    y: margin,
    width: width - margin * 2,
    height: height - margin * 2,
  }
  const slots = [...layoutSlots(layout, rect, THUMB_ASPECT)].sort((a, b) => a.z - b.z)

  slots.forEach((slot, index) => {
    ctx.save()
    ctx.translate(slot.cx, slot.cy)
    ctx.rotate((slot.rotationDeg * Math.PI) / 180)
    ctx.fillStyle = index === slots.length - 1 ? accent : fill
    ctx.strokeStyle = stroke
    ctx.lineWidth = Math.max(1, width * 0.012)
    ctx.beginPath()
    const radius = Math.min(slot.width, slot.height) * 0.14
    ctx.roundRect(-slot.width / 2, -slot.height / 2, slot.width, slot.height, radius)
    ctx.fill()
    ctx.stroke()
    ctx.restore()
  })
}
