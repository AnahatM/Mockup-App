import { extractPalette } from '@/lib/color/extract'

/** Downsample target for palette extraction. Colour identity survives easily
 *  at this size, and it keeps the read off the main thread's critical path. */
const SAMPLE = 160

/**
 * Reads the dominant colours out of a decoded image or video frame.
 *
 * Drawing to a small offscreen canvas first is the point: reading pixels back
 * from a full-resolution screenshot is slow and buys nothing, since the palette
 * is about broad colour identity rather than detail.
 */
export function paletteFromSource(
  source: CanvasImageSource,
  width: number,
  height: number,
): string[] {
  if (width <= 0 || height <= 0) return []

  const scale = Math.min(1, SAMPLE / Math.max(width, height))
  const w = Math.max(1, Math.round(width * scale))
  const h = Math.max(1, Math.round(height * scale))

  const canvas = document.createElement('canvas')
  canvas.width = w
  canvas.height = h
  const ctx = canvas.getContext('2d', { willReadFrequently: true })
  if (!ctx) return []

  try {
    ctx.drawImage(source, 0, 0, w, h)
    const { data } = ctx.getImageData(0, 0, w, h)
    return extractPalette(data, { count: 6, stride: 1 })
  } catch {
    // A tainted canvas cannot be read. Not fatal — the palette is a convenience.
    return []
  }
}
