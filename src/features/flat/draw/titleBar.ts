import { mix } from '@/lib/color/hex'
import { readableOn } from '@/lib/color/contrast'
import { drawTrafficLights, roundRect, topRoundedRect } from './chrome'
import type { FlatConfig } from '../schema'

export interface BarGeometry {
  x: number
  y: number
  width: number
  height: number
  radius: number
}

/** macOS-style title bar: traffic lights on the left, title centred or beside them. */
export function drawMacBar(
  ctx: CanvasRenderingContext2D,
  bar: BarGeometry,
  config: FlatConfig,
  chrome: string,
): void {
  topRoundedRect(ctx, bar.x, bar.y, bar.width, bar.height, bar.radius)
  ctx.fillStyle = chrome
  ctx.fill()

  // Hairline separating the bar from the content, as the real chrome has.
  ctx.fillStyle = mix(chrome, config.dark ? '#000000' : '#000000', 0.12)
  ctx.fillRect(bar.x, bar.y + bar.height - 1, bar.width, 1)

  const midY = bar.y + bar.height / 2
  const radius = bar.height * 0.16
  let left = bar.x + bar.height * 0.55

  if (config.trafficLights) {
    left += drawTrafficLights(ctx, left, midY, radius, config.trafficLightsMuted)
    left += bar.height * 0.5
  }

  drawTitle(ctx, bar, config, chrome, left, midY)
}

function drawTitle(
  ctx: CanvasRenderingContext2D,
  bar: BarGeometry,
  config: FlatConfig,
  chrome: string,
  left: number,
  midY: number,
): void {
  if (!config.title) return

  const size = bar.height * 0.4
  ctx.font = `600 ${size}px -apple-system, "Segoe UI", system-ui, sans-serif`
  ctx.textBaseline = 'middle'
  // Pick the readable foreground rather than assuming, since the bar can be
  // colour-matched to an arbitrary screenshot.
  ctx.fillStyle = readableOn(chrome, '#f4f3ee', '#1a1a18')

  if (config.titleAlign === 'center') {
    ctx.textAlign = 'center'
    ctx.fillText(config.title, bar.x + bar.width / 2, midY)
  } else {
    ctx.textAlign = 'left'
    ctx.fillText(config.title, left, midY)
  }
}

/** Browser bar: tabs above, a URL pill below. */
export function drawBrowserBar(
  ctx: CanvasRenderingContext2D,
  bar: BarGeometry,
  config: FlatConfig,
  chrome: string,
): void {
  const tabStripHeight = bar.height * 0.52
  const ink = readableOn(chrome, '#f4f3ee', '#1a1a18')

  topRoundedRect(ctx, bar.x, bar.y, bar.width, bar.height, bar.radius)
  ctx.fillStyle = mix(chrome, config.dark ? '#000000' : '#8a8a8a', 0.18)
  ctx.fill()

  const midTab = bar.y + tabStripHeight / 2
  const radius = tabStripHeight * 0.2
  let left = bar.x + tabStripHeight * 0.6

  if (config.trafficLights) {
    left += drawTrafficLights(ctx, left, midTab, radius, config.trafficLightsMuted)
    left += tabStripHeight * 0.6
  }

  drawTabs(ctx, config, chrome, ink, left, bar, tabStripHeight)
  drawUrlBar(ctx, config, chrome, ink, bar, tabStripHeight)
}

function drawTabs(
  ctx: CanvasRenderingContext2D,
  config: FlatConfig,
  chrome: string,
  ink: string,
  left: number,
  bar: BarGeometry,
  tabStripHeight: number,
): void {
  const tabWidth = Math.min(bar.width * 0.22, bar.width * 0.9 - left)
  const tabHeight = tabStripHeight * 0.72
  const top = bar.y + tabStripHeight - tabHeight

  for (let i = 0; i < config.tabs; i += 1) {
    const x = left + i * (tabWidth + tabStripHeight * 0.12)
    if (x + tabWidth > bar.x + bar.width) break
    roundRect(ctx, x, top, tabWidth, tabHeight, tabHeight * 0.26)
    ctx.fillStyle = i === 0 ? chrome : mix(chrome, '#000000', 0.08)
    ctx.fill()

    ctx.globalAlpha = i === 0 ? 0.85 : 0.5
    ctx.fillStyle = ink
    roundRect(
      ctx,
      x + tabHeight * 0.34,
      top + tabHeight * 0.42,
      tabWidth * 0.5,
      tabHeight * 0.16,
      tabHeight * 0.08,
    )
    ctx.fill()
    ctx.globalAlpha = 1
  }
}

function drawUrlBar(
  ctx: CanvasRenderingContext2D,
  config: FlatConfig,
  chrome: string,
  ink: string,
  bar: BarGeometry,
  tabStripHeight: number,
): void {
  const rowHeight = bar.height - tabStripHeight
  const pillHeight = rowHeight * 0.56
  const inset = bar.height * 0.28
  const y = bar.y + tabStripHeight + (rowHeight - pillHeight) / 2

  ctx.fillStyle = chrome
  ctx.fillRect(bar.x, bar.y + tabStripHeight, bar.width, rowHeight)

  roundRect(ctx, bar.x + inset, y, bar.width - inset * 2, pillHeight, pillHeight / 2)
  ctx.fillStyle = mix(chrome, config.dark ? '#ffffff' : '#000000', 0.08)
  ctx.fill()

  if (!config.url) return
  const size = pillHeight * 0.52
  ctx.font = `500 ${size}px -apple-system, "Segoe UI", system-ui, sans-serif`
  ctx.textAlign = 'left'
  ctx.textBaseline = 'middle'
  ctx.globalAlpha = 0.75
  ctx.fillStyle = ink
  ctx.fillText(config.url, bar.x + inset + pillHeight * 0.6, y + pillHeight / 2)
  ctx.globalAlpha = 1
}
