import { CanvasTexture, SRGBColorSpace } from 'three'

/**
 * A small bulb-and-rays icon, drawn once on a canvas and shared by every
 * gizmo. It is white so a sprite can tint it to each light's colour with a
 * plain material colour multiply, rather than baking colour into the pixels
 * and redrawing per light.
 *
 * Procedural rather than an image asset: the project takes no network
 * requests and bundles no binary icon files, so the icon is drawn with the
 * 2D canvas API instead.
 */
let cached: CanvasTexture | null = null

export function getLightIconTexture(): CanvasTexture {
  if (cached) return cached
  cached = buildIconTexture()
  return cached
}

function buildIconTexture(): CanvasTexture {
  const size = 128
  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size
  const ctx = canvas.getContext('2d')
  if (!ctx) return new CanvasTexture(canvas)

  const cx = size / 2
  const cy = size / 2
  ctx.fillStyle = '#ffffff'
  ctx.strokeStyle = '#ffffff'
  ctx.lineWidth = size * 0.05

  // Rays first, so the bulb disc sits cleanly on top of them.
  for (let i = 0; i < 8; i += 1) {
    const angle = (i / 8) * Math.PI * 2
    const inner = size * 0.36
    const outer = size * 0.47
    ctx.beginPath()
    ctx.moveTo(cx + Math.cos(angle) * inner, cy + Math.sin(angle) * inner)
    ctx.lineTo(cx + Math.cos(angle) * outer, cy + Math.sin(angle) * outer)
    ctx.stroke()
  }

  ctx.beginPath()
  ctx.arc(cx, cy, size * 0.26, 0, Math.PI * 2)
  ctx.fill()

  const texture = new CanvasTexture(canvas)
  texture.colorSpace = SRGBColorSpace
  texture.needsUpdate = true
  return texture
}
