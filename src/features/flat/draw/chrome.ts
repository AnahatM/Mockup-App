/** Shared canvas helpers for window chrome. */

export interface Frame {
  x: number
  y: number
  width: number
  height: number
}

export function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
): void {
  const radius = Math.max(0, Math.min(r, w / 2, h / 2))
  ctx.beginPath()
  ctx.moveTo(x + radius, y)
  ctx.arcTo(x + w, y, x + w, y + h, radius)
  ctx.arcTo(x + w, y + h, x, y + h, radius)
  ctx.arcTo(x, y + h, x, y, radius)
  ctx.arcTo(x, y, x + w, y, radius)
  ctx.closePath()
}

/** Path covering only the top corners, for a title bar sitting on flat content. */
export function topRoundedRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
): void {
  const radius = Math.max(0, Math.min(r, w / 2, h))
  ctx.beginPath()
  ctx.moveTo(x, y + h)
  ctx.lineTo(x, y + radius)
  ctx.arcTo(x, y, x + radius, y, radius)
  ctx.lineTo(x + w - radius, y)
  ctx.arcTo(x + w, y, x + w, y + radius, radius)
  ctx.lineTo(x + w, y + h)
  ctx.closePath()
}

/**
 * The three window controls.
 *
 * These colours are the one place literal colours are legitimate outside the
 * token layer: they are a rendering of another operating system's UI, not this
 * application's styling, so they must not shift with the app's theme.
 */
const LIGHTS = ['#ff5f57', '#febc2e', '#28c840'] as const
const MUTED = '#c8c6c2'

export function drawTrafficLights(
  ctx: CanvasRenderingContext2D,
  x: number,
  midY: number,
  radius: number,
  muted: boolean,
): number {
  const gap = radius * 3.2
  LIGHTS.forEach((color, index) => {
    ctx.beginPath()
    ctx.arc(x + index * gap, midY, radius, 0, Math.PI * 2)
    ctx.fillStyle = muted ? MUTED : color
    ctx.fill()
  })
  return gap * 2 + radius
}

/** `color` is a full CSS colour (rgba/hex), so callers control the shadow tint. */
export const withShadow = (
  ctx: CanvasRenderingContext2D,
  blur: number,
  offsetY: number,
  color: string,
): void => {
  ctx.shadowColor = color
  ctx.shadowBlur = blur
  ctx.shadowOffsetY = offsetY
}

export const clearShadow = (ctx: CanvasRenderingContext2D): void => {
  ctx.shadowColor = 'transparent'
  ctx.shadowBlur = 0
  ctx.shadowOffsetY = 0
}
