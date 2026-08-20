import { surfaceHeight, type HeightConfig } from './height'
import type { SurfaceTextureKind } from './schema'

/**
 * The only DOM-touching module in this feature. Every generator above is a
 * pure function of position; this is where a canvas is created and handed to
 * them, per the "generators are handed a canvas, not reaching for `document`"
 * rule — `heightField` itself never touches the DOM, only its two callers do.
 */
export function canvas2d(size: number): CanvasRenderingContext2D | null {
  const element = document.createElement('canvas')
  element.width = size
  element.height = size
  return element.getContext('2d')
}

/** One height sample per pixel of a `size` x `size` tile. */
export function heightField(
  kind: SurfaceTextureKind,
  size: number,
  cfg: HeightConfig,
): Float32Array {
  const field = new Float32Array(size * size)
  for (let py = 0; py < size; py += 1) {
    const v = py / size
    for (let px = 0; px < size; px += 1) {
      const u = px / size
      field[py * size + px] = surfaceHeight(kind, { u, v, px, py, size }, cfg)
    }
  }
  return field
}

/** Paints a height field as roughness, centred on `base` and spread by
 *  `contrast` — the finish's own roughness value stays the surface's mean. */
export function paintRoughness(
  ctx: CanvasRenderingContext2D,
  field: Float32Array,
  size: number,
  base: number,
  contrast: number,
): void {
  const image = ctx.createImageData(size, size)
  for (let i = 0; i < field.length; i += 1) {
    const h = field[i] ?? 0.5
    const level = Math.max(0, Math.min(1, base + (h - 0.5) * 2 * contrast))
    const shade = Math.round(level * 255)
    const o = i * 4
    image.data[o] = shade
    image.data[o + 1] = shade
    image.data[o + 2] = shade
    image.data[o + 3] = 255
  }
  ctx.putImageData(image, 0, 0)
}

/** Sobel-style gradient of the height field, encoded as a tangent-space
 *  normal map. Neighbours wrap modulo `size`, so the encoded slope is
 *  seamless at the tile edge exactly where the height field already is. */
export function paintNormal(
  ctx: CanvasRenderingContext2D,
  field: Float32Array,
  size: number,
  strength: number,
): void {
  const image = ctx.createImageData(size, size)
  const at = (x: number, y: number): number =>
    field[((y + size) % size) * size + ((x + size) % size)] ?? 0.5
  const gain = strength * 3
  for (let py = 0; py < size; py += 1) {
    for (let px = 0; px < size; px += 1) {
      const dx = (at(px + 1, py) - at(px - 1, py)) * gain
      const dy = (at(px, py + 1) - at(px, py - 1)) * gain
      const len = Math.hypot(dx, dy, 1) || 1
      const o = (py * size + px) * 4
      image.data[o] = Math.round((-dx / len) * 0.5 * 255 + 127.5)
      image.data[o + 1] = Math.round((-dy / len) * 0.5 * 255 + 127.5)
      image.data[o + 2] = Math.round((1 / len) * 0.5 * 255 + 127.5)
      image.data[o + 3] = 255
    }
  }
  ctx.putImageData(image, 0, 0)
}
