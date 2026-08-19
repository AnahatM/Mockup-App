import { CanvasTexture, SRGBColorSpace, type Texture } from 'three'

/**
 * Generates a keyboard deck as a texture rather than as ~80 meshes.
 *
 * At the scale a laptop mockup is viewed, individual keycaps are a few pixels
 * across. Drawing them costs one texture instead of thousands of triangles, and
 * the recess shading reads the same. Cached, since every laptop shares it.
 */
let cached: Texture | null = null

const ROWS = [14, 14, 13, 12, 11] as const
const FUNCTION_ROW = 13

export function keyboardTexture(): Texture | null {
  if (cached) return cached

  const width = 1024
  const height = 420
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d')
  if (!ctx) return null

  // Deck recess
  ctx.fillStyle = '#131417'
  ctx.fillRect(0, 0, width, height)

  const padX = 14
  const gap = 5
  const rowHeight = (height - padX * 2) / (ROWS.length + 1)

  drawRow(ctx, FUNCTION_ROW, padX, padX, width - padX * 2, rowHeight * 0.62, gap)

  ROWS.forEach((count, index) => {
    const y = padX + rowHeight * 0.72 + index * rowHeight
    drawRow(ctx, count, padX, y, width - padX * 2, rowHeight - gap, gap)
  })

  const texture = new CanvasTexture(canvas)
  texture.colorSpace = SRGBColorSpace
  cached = texture
  return texture
}

function drawRow(
  ctx: CanvasRenderingContext2D,
  count: number,
  x: number,
  y: number,
  totalWidth: number,
  keyHeight: number,
  gap: number,
): void {
  const keyWidth = (totalWidth - gap * (count - 1)) / count

  for (let i = 0; i < count; i += 1) {
    const kx = x + i * (keyWidth + gap)
    // Keycap face, with a lighter top edge so it reads as raised.
    ctx.fillStyle = '#232529'
    roundRect(ctx, kx, y, keyWidth, keyHeight, 3)
    ctx.fill()
    ctx.fillStyle = '#2c2f34'
    roundRect(ctx, kx, y, keyWidth, keyHeight * 0.42, 3)
    ctx.fill()
  }
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
