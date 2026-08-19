import { CanvasTexture, RepeatWrapping, type Texture } from 'three'

/**
 * Procedurally generated material maps.
 *
 * Drawn on a canvas at runtime rather than shipped as image files, which keeps
 * the app fully local, keeps the repo small, and — the real reason — keeps device
 * colours *changeable*, since nothing is baked into a texture.
 *
 * Generated maps are cached by their parameters, so every titanium device in the
 * catalogue shares one texture.
 */

const cache = new Map<string, Texture>()

function cached(key: string, build: () => Texture): Texture {
  const existing = cache.get(key)
  if (existing) return existing
  const created = build()
  cache.set(key, created)
  return created
}

function canvas2d(size: number): CanvasRenderingContext2D | null {
  const element = document.createElement('canvas')
  element.width = size
  element.height = size
  return element.getContext('2d')
}

function toTexture(ctx: CanvasRenderingContext2D, repeat: number): Texture {
  const texture = new CanvasTexture(ctx.canvas)
  texture.wrapS = RepeatWrapping
  texture.wrapT = RepeatWrapping
  texture.repeat.set(repeat, repeat)
  texture.anisotropy = 8
  return texture
}

export interface BrushedOptions {
  /** Mid roughness the streaks vary around, 0-1. */
  base: number
  /** How far the streaks deviate from `base`. */
  contrast: number
  /** Streak direction. Rails are brushed along their length. */
  vertical: boolean
  size?: number
  repeat?: number
}

/**
 * Brushed-metal roughness. The fine directional variation is what breaks a
 * reflection into the streaked highlight that reads as machined metal rather
 * than as a mirror.
 */
export function brushedRoughness({
  base,
  contrast,
  vertical,
  size = 512,
  repeat = 1,
}: BrushedOptions): Texture | null {
  const key = `brushed:${base}:${contrast}:${vertical}:${size}:${repeat}`
  const existing = cache.get(key)
  if (existing) return existing

  const ctx = canvas2d(size)
  if (!ctx) return null

  const level = Math.round(base * 255)
  ctx.fillStyle = `rgb(${level},${level},${level})`
  ctx.fillRect(0, 0, size, size)

  // Many thin, low-alpha strokes accumulate into smooth directional noise —
  // cheaper and better-looking than per-pixel noise at this size.
  const strokes = size * 3
  ctx.lineWidth = 1
  for (let i = 0; i < strokes; i += 1) {
    const offset = Math.random() * size
    const delta = (Math.random() * 2 - 1) * contrast * 255
    const shade = Math.max(0, Math.min(255, Math.round(level + delta)))
    ctx.strokeStyle = `rgba(${shade},${shade},${shade},${0.06 + Math.random() * 0.12})`
    ctx.beginPath()
    if (vertical) {
      ctx.moveTo(offset, 0)
      ctx.lineTo(offset + (Math.random() * 2 - 1), size)
    } else {
      ctx.moveTo(0, offset)
      ctx.lineTo(size, offset + (Math.random() * 2 - 1))
    }
    ctx.stroke()
  }

  return cached(key, () => toTexture(ctx, repeat))
}

/** Fine even micro-texture for matte glass and soft-touch plastic. */
export function speckleRoughness(
  base: number,
  contrast: number,
  size = 256,
): Texture | null {
  const key = `speckle:${base}:${contrast}:${size}`
  const existing = cache.get(key)
  if (existing) return existing

  const ctx = canvas2d(size)
  if (!ctx) return null

  const image = ctx.createImageData(size, size)
  const level = base * 255
  for (let i = 0; i < image.data.length; i += 4) {
    const shade = Math.max(
      0,
      Math.min(255, level + (Math.random() * 2 - 1) * contrast * 255),
    )
    image.data[i] = shade
    image.data[i + 1] = shade
    image.data[i + 2] = shade
    image.data[i + 3] = 255
  }
  ctx.putImageData(image, 0, 0)

  return cached(key, () => toTexture(ctx, 4))
}

/** Frees every generated map. Used when tearing down for a hot reload. */
export function disposeMaps(): void {
  for (const texture of cache.values()) texture.dispose()
  cache.clear()
}
