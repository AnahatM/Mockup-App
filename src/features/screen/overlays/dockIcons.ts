import { roundRect } from './context'

/**
 * One Dock tile.
 *
 * These used to be `hsl(i * 47, ...)` — a rainbow gradient, the one thing a
 * real Dock never looks like, since it is a row of unrelated apps in unrelated
 * colours. It is now a fixed rotation of plausible app hues, each drawn the way
 * a Big Sur-and-later icon is drawn: a rounded square with a vertical light
 * ramp and a simple white mark.
 *
 * The colours are literal on purpose. They are a rendering of another operating
 * system's UI rather than this application's styling, so they must not move
 * with the theme — the same argument the window chrome's traffic lights make.
 */
export interface AppIcon {
  top: string
  bottom: string
  mark: 'circle' | 'bar' | 'grid' | 'chevron'
}

export const APPS: readonly AppIcon[] = [
  { top: '#6fb3ff', bottom: '#2d7ff0', mark: 'grid' },
  { top: '#7ee0a8', bottom: '#27b268', mark: 'circle' },
  { top: '#ffb37a', bottom: '#f07a2d', mark: 'bar' },
  { top: '#b79bff', bottom: '#7c4dff', mark: 'circle' },
  { top: '#ff8f8f', bottom: '#e94b4b', mark: 'bar' },
  { top: '#7fd7e8', bottom: '#1fa3bd', mark: 'chevron' },
  { top: '#ffd982', bottom: '#f0ab1c', mark: 'grid' },
  { top: '#9aa4b8', bottom: '#5d6880', mark: 'bar' },
]

/** The Trash, which the Dock keeps past its divider and never colours. */
export const TRASH: AppIcon = { top: '#dfe3ea', bottom: '#aeb6c4', mark: 'bar' }

export function drawIcon(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  app: AppIcon,
): void {
  const ramp = ctx.createLinearGradient(0, y, 0, y + size)
  ramp.addColorStop(0, app.top)
  ramp.addColorStop(1, app.bottom)

  ctx.save()
  // 22.5% is the corner radius Apple's own icon template uses.
  roundRect(ctx, x, y, size, size, size * 0.225)
  ctx.fillStyle = ramp
  ctx.fill()

  ctx.clip()
  ctx.fillStyle = '#ffffff'
  ctx.strokeStyle = '#ffffff'
  ctx.globalAlpha = 0.9
  drawMark(ctx, x, y, size, app.mark)
  ctx.restore()
}

function drawMark(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  mark: AppIcon['mark'],
): void {
  const cx = x + size / 2
  const cy = y + size / 2

  if (mark === 'circle') {
    ctx.lineWidth = size * 0.1
    ctx.beginPath()
    ctx.arc(cx, cy, size * 0.22, 0, Math.PI * 2)
    ctx.stroke()
    return
  }

  if (mark === 'chevron') {
    ctx.lineWidth = size * 0.1
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'
    ctx.beginPath()
    ctx.moveTo(cx - size * 0.1, cy - size * 0.16)
    ctx.lineTo(cx + size * 0.12, cy)
    ctx.lineTo(cx - size * 0.1, cy + size * 0.16)
    ctx.stroke()
    return
  }

  const rows = mark === 'grid' ? 2 : 1
  const w = size * (mark === 'grid' ? 0.18 : 0.44)
  const h = size * 0.14
  for (let r = 0; r < rows; r += 1) {
    for (let c = 0; c < rows; c += 1) {
      const gx = cx - (rows * w + (rows - 1) * h) / 2 + c * (w + h)
      const gy = cy - (rows * h + (rows - 1) * h) / 2 + r * (h * 2)
      roundRect(ctx, gx, gy, w, h, h * 0.4)
      ctx.fill()
    }
  }
}
