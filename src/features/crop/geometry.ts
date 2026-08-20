import type { CropRect } from './schema'

/**
 * Pure rectangle maths for the crop tool — clamping, aspect constraints, and
 * pixel/normalised conversions. No DOM, no React, so every case here is
 * covered by `geometry.test.ts` without a browser.
 *
 * See `bake.ts` for the (deliberate, and separately documented) decision of
 * *how* a `CropRect` actually reaches the device's screen.
 */

export type CropHandle = 'move' | 'n' | 's' | 'e' | 'w' | 'ne' | 'nw' | 'se' | 'sw'

/** Below this, a handle drag or a keyboard nudge could shrink the crop to
 * nothing; the resulting image would be un-showable and un-recoverable. */
const MIN_SIZE = 0.03

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max)
}

/** Keeps a rect's size sane and its position fully inside the unit square. */
export function clampCropRect(rect: CropRect): CropRect {
  const width = clamp(rect.width, MIN_SIZE, 1)
  const height = clamp(rect.height, MIN_SIZE, 1)
  const x = clamp(rect.x, 0, 1 - width)
  const y = clamp(rect.y, 0, 1 - height)
  return { x, y, width, height }
}

const EPS = 1e-4

/** True for the whole, uncropped image — the fast path that skips baking. */
export function isIdentityCrop(rect: CropRect): boolean {
  return (
    Math.abs(rect.x) < EPS &&
    Math.abs(rect.y) < EPS &&
    Math.abs(rect.width - 1) < EPS &&
    Math.abs(rect.height - 1) < EPS
  )
}

/**
 * The largest centred rect whose PIXEL aspect ratio — not its normalised
 * width/height, which only means the same thing when the source image is
 * itself square — equals `targetAspect`.
 *
 * A rect's true pixel aspect is `(width/height) * mediaAspect`, since width
 * and height are fractions of the image's own (possibly non-square) axes.
 * Solving that for a normalised width/height ratio gives `targetAspect /
 * mediaAspect`: at most 1 on each axis, so it always fits without a second
 * clamp pass changing the aspect it was asked for.
 */
export function rectForAspect(targetAspect: number, mediaAspect: number): CropRect {
  const safeMedia = mediaAspect > 0 && Number.isFinite(mediaAspect) ? mediaAspect : 1
  const safeTarget =
    targetAspect > 0 && Number.isFinite(targetAspect) ? targetAspect : safeMedia
  const ratio = safeTarget / safeMedia
  const width = ratio <= 1 ? ratio : 1
  const height = ratio <= 1 ? 1 : 1 / ratio
  return clampCropRect({ x: (1 - width) / 2, y: (1 - height) / 2, width, height })
}

export interface PixelRect {
  x: number
  y: number
  width: number
  height: number
}

/** Normalised rect -> integer pixel rect against a media's natural size. */
export function cropRectToPixels(
  rect: CropRect,
  mediaWidth: number,
  mediaHeight: number,
): PixelRect {
  return {
    x: Math.round(rect.x * mediaWidth),
    y: Math.round(rect.y * mediaHeight),
    width: Math.max(1, Math.round(rect.width * mediaWidth)),
    height: Math.max(1, Math.round(rect.height * mediaHeight)),
  }
}

/** Inverse of `cropRectToPixels`, clamped back into a valid crop rect. */
export function pixelsToCropRect(
  px: PixelRect,
  mediaWidth: number,
  mediaHeight: number,
): CropRect {
  if (mediaWidth <= 0 || mediaHeight <= 0) return { x: 0, y: 0, width: 1, height: 1 }
  return clampCropRect({
    x: px.x / mediaWidth,
    y: px.y / mediaHeight,
    width: px.width / mediaWidth,
    height: px.height / mediaHeight,
  })
}

export interface DragParams {
  start: CropRect
  handle: CropHandle
  /** Pointer or key delta, normalised against the image's own size. */
  dx: number
  dy: number
  /** Pixel-space aspect to preserve on a corner drag; `null` is free-form. */
  lockAspect: number | null
  mediaAspect: number
}

/**
 * Applies one drag delta to a rect, anchored at the edge/corner opposite the
 * one being dragged — so the side under the pointer moves and everything
 * else stays put, exactly like every other crop tool.
 */
export function dragCropRect({
  start,
  handle,
  dx,
  dy,
  lockAspect,
  mediaAspect,
}: DragParams): CropRect {
  if (handle === 'move') {
    return clampCropRect({ ...start, x: start.x + dx, y: start.y + dy })
  }

  const right = start.x + start.width
  const bottom = start.y + start.height
  let { x, y, width, height } = start

  if (handle.includes('w')) {
    x += dx
    width = right - x
  }
  if (handle.includes('e')) width += dx
  if (handle.includes('n')) {
    y += dy
    height = bottom - y
  }
  if (handle.includes('s')) height += dy

  // Only corner handles carry an unambiguous "keep this ratio" direction —
  // an edge handle changes one axis only, so there is nothing to lock.
  if (lockAspect != null && handle.length === 2) {
    const safeMedia = mediaAspect > 0 ? mediaAspect : 1
    height = width / (lockAspect / safeMedia)
    if (handle.includes('n')) y = bottom - height
  }

  return clampCropRect({ x, y, width, height })
}
