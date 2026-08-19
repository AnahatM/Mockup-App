/** Shared drawing context for overlays, sized in screen pixels. */
export interface OverlayCanvas {
  ctx: CanvasRenderingContext2D
  width: number
  height: number
}

/** Rounded rectangle path, used by nearly every overlay. */
export function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
): void {
  const radius = Math.min(r, w / 2, h / 2)
  ctx.beginPath()
  ctx.moveTo(x + radius, y)
  ctx.arcTo(x + w, y, x + w, y + h, radius)
  ctx.arcTo(x + w, y + h, x, y + h, radius)
  ctx.arcTo(x, y + h, x, y, radius)
  ctx.arcTo(x, y, x + w, y, radius)
  ctx.closePath()
}

/**
 * Overlay glyphs are drawn in plain black or white and are the one place a
 * literal colour is legitimate outside the token layer — they are canvas paint
 * from a device's own UI, not application styling.
 */
export const glyph = (dark: boolean): string => (dark ? '#000000' : '#ffffff')
