import { roundRect, type OverlayCanvas } from './context'
import { pointScale, type ReferenceScreen } from './points'
import { APPS, TRASH, drawIcon } from './dockIcons'
import type { OverlaysConfig } from '../schema'

/**
 * The macOS Dock: a translucent slab with a hairline rim, a row of app icons,
 * running-app dots, and the Trash past a divider.
 *
 * The divider is most of what makes a row of coloured squares read as *the
 * Dock* rather than as a toolbar, and the dots are the other half — a Dock with
 * nothing running is a Dock nobody has ever seen. Icons themselves live in
 * `dockIcons.ts`.
 */

/** How many icons show the "app is open" dot beneath them. */
const RUNNING = 3

/**
 * macOS's default Dock icon is 64pt, and it sits 8pt clear of the bottom edge.
 *
 * Converted once from the reference screen rather than kept as a share of the
 * canvas — see `points.ts`. As a share it was 8.5% of the height, taken against
 * a display no Mac has, which made the Dock a third too big and left it
 * crowding whatever screenshot was behind it.
 */
const ICON_PT = 64
const BOTTOM_PT = 8

export function drawDock(
  canvas: OverlayCanvas,
  config: OverlaysConfig,
  reference: ReferenceScreen,
): void {
  const { ctx, width, height } = canvas
  const pt = pointScale(canvas, reference)
  const count = Math.max(3, Math.min(12, Math.round(config.dockIcons)))
  const icon = ICON_PT * pt
  const gap = icon * 0.16
  const pad = icon * 0.24
  const divider = icon * 0.5

  const slabW = count * icon + (count - 1) * gap + pad * 2 + divider
  const slabH = icon + pad * 2
  const x = (width - slabW) / 2
  const y = height - slabH - BOTTOM_PT * pt

  drawSlab(ctx, { x, y, width: slabW, height: slabH }, config)

  for (let i = 0; i < count; i += 1) {
    // The last slot is the Trash, and the divider takes the space before it.
    const last = i === count - 1
    const left = x + pad + i * (icon + gap) + (last ? divider : 0)
    if (last) drawDivider(ctx, left - gap - divider / 2, y, slabH, config)

    drawIcon(ctx, left, y + pad, icon, last ? TRASH : (APPS[i % APPS.length] ?? TRASH))
    // Inside the slab, not below it — the Dock sits close enough to the bottom
    // edge that an indicator drawn under it would fall off the screen.
    if (i < RUNNING) drawDot(ctx, left + icon / 2, y + slabH - pad * 0.45, icon, config)
  }
}

interface Slab {
  x: number
  y: number
  width: number
  height: number
}

function drawSlab(
  ctx: CanvasRenderingContext2D,
  slab: Slab,
  config: OverlaysConfig,
): void {
  const radius = slab.height * 0.26
  ctx.save()
  ctx.fillStyle = config.menuBarDark ? '#ffffff' : '#1c1c20'
  ctx.globalAlpha = 0.2
  roundRect(ctx, slab.x, slab.y, slab.width, slab.height, radius)
  ctx.fill()

  // The rim is what separates the Dock from the wallpaper behind it; without
  // one, a translucent slab over a busy screenshot simply disappears.
  ctx.globalAlpha = 0.28
  ctx.lineWidth = Math.max(slab.height * 0.012, 1)
  ctx.strokeStyle = config.menuBarDark ? '#000000' : '#ffffff'
  roundRect(ctx, slab.x, slab.y, slab.width, slab.height, radius)
  ctx.stroke()
  ctx.restore()
}

function drawDot(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  size: number,
  config: OverlaysConfig,
): void {
  ctx.save()
  ctx.fillStyle = config.menuBarDark ? '#000000' : '#ffffff'
  ctx.globalAlpha = 0.7
  ctx.beginPath()
  ctx.arc(cx, cy, Math.max(size * 0.035, 0.5), 0, Math.PI * 2)
  ctx.fill()
  ctx.restore()
}

function drawDivider(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  height: number,
  config: OverlaysConfig,
): void {
  ctx.save()
  ctx.fillStyle = config.menuBarDark ? '#000000' : '#ffffff'
  ctx.globalAlpha = 0.22
  ctx.fillRect(x, y + height * 0.2, Math.max(height * 0.012, 1), height * 0.6)
  ctx.restore()
}
