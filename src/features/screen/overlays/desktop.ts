import { glyph, roundRect, type OverlayCanvas } from './context'
import type { OverlaysConfig } from '../schema'

const MENUS = ['Finder', 'File', 'Edit', 'View', 'Go', 'Window', 'Help']

/** Desktop menu bar: a translucent strip with menu titles and a clock. */
export function drawMenuBar(canvas: OverlayCanvas, config: OverlaysConfig): void {
  const { ctx, width, height } = canvas
  const barHeight = height * 0.032
  const ink = glyph(config.menuBarDark)

  ctx.save()
  // A faint scrim so titles stay legible over any screenshot behind them.
  ctx.fillStyle = config.menuBarDark ? '#ffffff' : '#000000'
  ctx.globalAlpha = 0.18
  ctx.fillRect(0, 0, width, barHeight)
  ctx.globalAlpha = 1

  const fontSize = barHeight * 0.46
  ctx.fillStyle = ink
  ctx.font = `500 ${fontSize}px -apple-system, "Segoe UI", system-ui, sans-serif`
  ctx.textBaseline = 'middle'
  ctx.textAlign = 'left'

  let x = width * 0.014
  ctx.beginPath()
  ctx.arc(x + fontSize * 0.4, barHeight / 2, fontSize * 0.42, 0, Math.PI * 2)
  ctx.fill()
  x += fontSize * 1.5

  MENUS.forEach((menu, index) => {
    ctx.globalAlpha = index === 0 ? 1 : 0.82
    ctx.font = `${index === 0 ? 700 : 500} ${fontSize}px -apple-system, system-ui, sans-serif`
    ctx.fillText(menu, x, barHeight / 2)
    x += ctx.measureText(menu).width + fontSize * 0.9
  })

  ctx.globalAlpha = 0.9
  ctx.textAlign = 'right'
  ctx.font = `500 ${fontSize}px -apple-system, system-ui, sans-serif`
  ctx.fillText(config.time, width * 0.986, barHeight / 2)
  ctx.restore()
}

/** Translucent dock with rounded app tiles. */
export function drawDock(canvas: OverlayCanvas, config: OverlaysConfig): void {
  const { ctx, width, height } = canvas
  const count = Math.max(3, Math.min(12, Math.round(config.dockIcons)))
  const icon = Math.min(height * 0.085, width * 0.055)
  const gap = icon * 0.22
  const pad = icon * 0.18
  const dockW = count * icon + (count - 1) * gap + pad * 2
  const dockH = icon + pad * 2
  const x = (width - dockW) / 2
  const y = height - dockH - height * 0.018

  ctx.save()
  ctx.fillStyle = config.menuBarDark ? '#ffffff' : '#1c1c20'
  ctx.globalAlpha = 0.22
  roundRect(ctx, x, y, dockW, dockH, dockH * 0.24)
  ctx.fill()

  ctx.globalAlpha = 0.9
  for (let i = 0; i < count; i += 1) {
    // Cycle hues so the dock reads as distinct apps without shipping icon art.
    ctx.fillStyle = `hsl(${(i * 47) % 360} 62% 58%)`
    roundRect(ctx, x + pad + i * (icon + gap), y + pad, icon, icon, icon * 0.24)
    ctx.fill()
  }
  ctx.restore()
}
