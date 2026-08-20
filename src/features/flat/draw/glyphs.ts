/**
 * The toolbar symbols a browser window carries.
 *
 * These are drawn rather than shipped as an icon font or SVG sprite for the
 * same reason the devices are procedural: the window chrome is composited into
 * a canvas that becomes both a PNG export and a WebGL texture, at whatever
 * resolution the export asks for. A raster sprite would have to be authored at
 * a size, and would blur the moment someone exports at 4x.
 *
 * Every glyph is drawn centred on (cx, cy) inside a box of `size`, and takes
 * the stroke weight from the caller so a whole toolbar stays visually even.
 * They are modelled on SF Symbols — the set Safari's own toolbar draws from —
 * so they read as a browser rather than as generic shapes.
 */

export interface GlyphOptions {
  ctx: CanvasRenderingContext2D
  cx: number
  cy: number
  size: number
}

const stroked = ({ ctx, size }: GlyphOptions, weight = 0.11): void => {
  ctx.lineWidth = Math.max(size * weight, 1)
  ctx.lineCap = 'round'
  ctx.lineJoin = 'round'
}

/**
 * `chevron.left` / `chevron.right` — the back and forward controls.
 *
 * Deliberately narrow: SF's chevrons are about half as wide as they are tall.
 * At the 1:1.3 an equilateral arrow gives you they stop reading as a browser
 * control and start reading as a mathematical less-than sign.
 */
export function chevron(options: GlyphOptions, direction: 1 | -1): void {
  const { ctx, cx, cy, size } = options
  const w = size * 0.17
  const h = size * 0.3
  stroked(options, 0.125)
  ctx.beginPath()
  ctx.moveTo(cx + w * direction, cy - h)
  ctx.lineTo(cx - w * direction, cy)
  ctx.lineTo(cx + w * direction, cy + h)
  ctx.stroke()
}

/** `plus` — the new-tab control at the end of the tab strip. */
export function plus(options: GlyphOptions): void {
  const { ctx, cx, cy, size } = options
  const arm = size * 0.3
  stroked(options)
  ctx.beginPath()
  ctx.moveTo(cx - arm, cy)
  ctx.lineTo(cx + arm, cy)
  ctx.moveTo(cx, cy - arm)
  ctx.lineTo(cx, cy + arm)
  ctx.stroke()
}

/** `xmark` — the close control on the active tab. */
export function xmark(options: GlyphOptions): void {
  const { ctx, cx, cy, size } = options
  const arm = size * 0.24
  stroked(options, 0.13)
  ctx.beginPath()
  ctx.moveTo(cx - arm, cy - arm)
  ctx.lineTo(cx + arm, cy + arm)
  ctx.moveTo(cx + arm, cy - arm)
  ctx.lineTo(cx - arm, cy + arm)
  ctx.stroke()
}

/** `lock.fill` — the padlock shown at the left of a secure address field. */
export function lock(options: GlyphOptions): void {
  const { ctx, cx, cy, size } = options
  const bodyW = size * 0.52
  const bodyH = size * 0.42
  const bodyY = cy - bodyH * 0.1
  const shackle = bodyW * 0.3

  stroked(options, 0.1)
  ctx.beginPath()
  ctx.arc(cx, bodyY, shackle, Math.PI, 0)
  ctx.stroke()

  ctx.beginPath()
  const r = bodyH * 0.28
  ctx.moveTo(cx - bodyW / 2 + r, bodyY)
  ctx.arcTo(cx + bodyW / 2, bodyY, cx + bodyW / 2, bodyY + bodyH, r)
  ctx.arcTo(cx + bodyW / 2, bodyY + bodyH, cx - bodyW / 2, bodyY + bodyH, r)
  ctx.arcTo(cx - bodyW / 2, bodyY + bodyH, cx - bodyW / 2, bodyY, r)
  ctx.arcTo(cx - bodyW / 2, bodyY, cx + bodyW / 2, bodyY, r)
  ctx.closePath()
  ctx.fill()
}

/** `arrow.clockwise` — reload, which Safari parks inside the address field. */
export function reload(options: GlyphOptions): void {
  const { ctx, cx, cy, size } = options
  const r = size * 0.3
  stroked(options, 0.1)
  ctx.beginPath()
  ctx.arc(cx, cy, r, Math.PI * -0.35, Math.PI * 1.35)
  ctx.stroke()

  const tip = size * 0.15
  ctx.beginPath()
  ctx.moveTo(cx + r * 0.62, cy - r * 0.62 - tip)
  ctx.lineTo(cx + r * 0.62 + tip * 0.9, cy - r * 0.62 + tip * 0.25)
  ctx.lineTo(cx + r * 0.62 - tip * 0.5, cy - r * 0.62 + tip * 0.55)
  ctx.closePath()
  ctx.fill()
}

/** `square.and.arrow.up` — share. */
export function share(options: GlyphOptions): void {
  const { ctx, cx, cy, size } = options
  const w = size * 0.44
  const top = cy - size * 0.36
  stroked(options, 0.1)

  ctx.beginPath()
  ctx.moveTo(cx - w / 2, cy - size * 0.06)
  ctx.lineTo(cx - w / 2, cy + size * 0.34)
  ctx.lineTo(cx + w / 2, cy + size * 0.34)
  ctx.lineTo(cx + w / 2, cy - size * 0.06)
  ctx.stroke()

  ctx.beginPath()
  ctx.moveTo(cx, cy + size * 0.14)
  ctx.lineTo(cx, top)
  ctx.moveTo(cx - size * 0.14, top + size * 0.14)
  ctx.lineTo(cx, top)
  ctx.lineTo(cx + size * 0.14, top + size * 0.14)
  ctx.stroke()
}

/** `sidebar.left`, and `square.on.square` for the tab overview. */
export function panes(options: GlyphOptions, kind: 'sidebar' | 'tabs'): void {
  const { ctx, cx, cy, size } = options
  const w = size * 0.62
  const h = size * 0.5
  stroked(options, 0.09)

  if (kind === 'sidebar') {
    ctx.strokeRect(cx - w / 2, cy - h / 2, w, h)
    ctx.beginPath()
    ctx.moveTo(cx - w / 2 + w * 0.34, cy - h / 2)
    ctx.lineTo(cx - w / 2 + w * 0.34, cy + h / 2)
    ctx.stroke()
    return
  }

  const offset = size * 0.1
  ctx.strokeRect(cx - w / 2 + offset, cy - h / 2 + offset, w, h)
  ctx.strokeRect(cx - w / 2 - offset, cy - h / 2 - offset, w, h)
}
