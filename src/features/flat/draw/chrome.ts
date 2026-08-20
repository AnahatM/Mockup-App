/** Shared canvas helpers for window chrome. */

export interface Frame {
  x: number
  y: number
  width: number
  height: number
}

/** A title bar's box, and the corner radius of the window it caps. */
export interface BarGeometry {
  x: number
  y: number
  width: number
  height: number
  radius: number
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
 * macOS chrome metrics, in macOS points.
 *
 * Authoring in points rather than in fractions-of-whatever-box is what lets one
 * set of numbers describe both bars honestly: a standard title bar is 28pt tall
 * and a Safari toolbar is 52pt, but both carry the same 12pt window buttons at
 * the same 20pt pitch, 20pt in from the window's edge. Each bar converts once —
 * `pt = itsHeight / itsReferenceHeight` — and every measurement below is then a
 * literal reading off the real thing.
 *
 * The previous code expressed these as fractions of the bar height, which
 * silently meant "12pt buttons" on the title bar and "22pt buttons" on the
 * browser toolbar, and the browser controls came out cartoonishly large.
 */
export const TITLE_BAR_PT = 28
export const TOOLBAR_PT = 52
export const LIGHT_DIAMETER_PT = 12
export const LIGHT_PITCH_PT = 20
export const LIGHT_INSET_PT = 20

/**
 * The three window controls, with the faint darker rim macOS gives them.
 *
 * These colours are the one place literal colours are legitimate outside the
 * token layer: they are a rendering of another operating system's UI, not this
 * application's styling, so they must not shift with the app's theme. An
 * unfocused macOS window greys all three out and drops the rim, which is what
 * `muted` reproduces.
 */
const LIGHTS = [
  { fill: '#ff5f57', rim: '#e0443e' },
  { fill: '#febc2e', rim: '#dea123' },
  { fill: '#28c840', rim: '#1aab29' },
] as const

const MUTED = { fill: '#d5d3cf', rim: '#c2c0bc' } as const

/** Returns the width consumed, so the caller can lay the title out beside it. */
export function drawTrafficLights(
  ctx: CanvasRenderingContext2D,
  x: number,
  midY: number,
  radius: number,
  muted: boolean,
  pitch: number,
): number {
  ctx.save()
  ctx.lineWidth = Math.max(radius * 0.09, 0.5)

  LIGHTS.forEach((light, index) => {
    const { fill, rim } = muted ? MUTED : light
    const cx = x + index * pitch

    ctx.beginPath()
    ctx.arc(cx, midY, radius, 0, Math.PI * 2)
    ctx.fillStyle = fill
    ctx.fill()

    // Inset by half the line width so the stroke lands inside the disc rather
    // than straddling its edge, which would fatten every button by a pixel.
    ctx.beginPath()
    ctx.arc(cx, midY, radius - ctx.lineWidth / 2, 0, Math.PI * 2)
    ctx.strokeStyle = rim
    ctx.stroke()
  })

  ctx.restore()
  return pitch * 2 + radius
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
