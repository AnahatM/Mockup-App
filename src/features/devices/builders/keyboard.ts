import { CanvasTexture, SRGBColorSpace, type Texture } from 'three'
import { KEY_ROWS, KEY_UNITS, type KeyRow } from './keyLayout'

/**
 * Generates a keyboard deck as a texture rather than as ~80 meshes.
 *
 * At the scale a laptop mockup is viewed, individual keycaps are a few pixels
 * across. Drawing them costs one texture instead of thousands of triangles, and
 * the recess shading reads the same. Cached, since every laptop shares it.
 *
 * The *layout* is in `keyLayout.ts` — see there for why a grid of identical
 * keys was the single thing giving these renders away.
 */
let cached: Texture | null = null

/** Canvas pixels per key unit. The deck is 15 units wide and a little under 6
 *  tall, so this lands close to a 1024-wide texture without stretching. */
const UNIT = 72

/** Share of a unit left as the gap between two keycaps. */
const GAP = 0.11

export function keyboardTexture(): Texture | null {
  if (cached) return cached

  const rows = KEY_ROWS.reduce((total, row) => total + row.height, 0)
  const width = KEY_UNITS * UNIT
  const height = Math.round((rows + GAP) * UNIT)

  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d')
  if (!ctx) return null

  // The recess the keys sit in. Darker than any keycap, so the gaps read as
  // shadow between them rather than as grout.
  ctx.fillStyle = '#131417'
  ctx.fillRect(0, 0, width, height)

  let y = (GAP / 2) * UNIT
  for (const row of KEY_ROWS) {
    drawRow(ctx, row, y)
    y += row.height * UNIT
  }

  const texture = new CanvasTexture(canvas)
  texture.colorSpace = SRGBColorSpace
  cached = texture
  return texture
}

function drawRow(ctx: CanvasRenderingContext2D, row: KeyRow, top: number): void {
  const height = (row.height - GAP) * UNIT
  let x = 0

  for (const [index, units] of row.keys.entries()) {
    const last = index === row.keys.length - 1
    if (last && row.arrows) {
      drawArrows(ctx, x, top, units, row.height)
      return
    }
    drawKey(ctx, x, top, units, height)
    x += units * UNIT
  }
}

/**
 * The inverted-T. Left and right are full height; up and down split the middle
 * column between them, which is the detail that makes an arrow cluster
 * recognisable at a glance rather than four keys in a row.
 */
function drawArrows(
  ctx: CanvasRenderingContext2D,
  x: number,
  top: number,
  units: number,
  rowHeight: number,
): void {
  const key = (units / 3) * UNIT
  const full = (rowHeight - GAP) * UNIT
  const half = (full - GAP * UNIT) / 2

  drawKey(ctx, x, top, units / 3, full)
  drawKey(ctx, x + key, top, units / 3, half)
  drawKey(ctx, x + key, top + half + GAP * UNIT, units / 3, half)
  drawKey(ctx, x + key * 2, top, units / 3, full)
}

function drawKey(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  units: number,
  height: number,
): void {
  const gap = GAP * UNIT
  const width = units * UNIT - gap
  const radius = Math.min(UNIT * 0.09, height * 0.28)

  // Keycap face, with a lighter top band so it reads as raised rather than as
  // a hole. Both are flat fills: a gradient here is invisible at the size a
  // keycap occupies on screen and costs a paint per key.
  ctx.fillStyle = '#232529'
  roundRect(ctx, x + gap / 2, y, width, height, radius)
  ctx.fill()
  ctx.fillStyle = '#2c2f34'
  roundRect(ctx, x + gap / 2, y, width, height * 0.42, radius)
  ctx.fill()
}

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
): void {
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.arcTo(x + w, y, x + w, y + h, r)
  ctx.arcTo(x + w, y + h, x, y + h, r)
  ctx.arcTo(x, y + h, x, y, r)
  ctx.arcTo(x, y, x + w, y, r)
  ctx.closePath()
}
