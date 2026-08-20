export interface Box {
  width: number
  height: number
}

export interface PreviewLayout {
  /** CSS box size (px) — the fixed-aspect canvas letterboxed to fit `available`
   * without distortion or crop ("contain" fit). */
  displayWidth: number
  displayHeight: number
  /** Canvas backing-store resolution (px) — device-pixel-ratio scaled and
   * capped, so the compositor redraws a few hundred KB of pixels per frame
   * rather than several megapixels. */
  canvasWidth: number
  canvasHeight: number
}

/** Below this, a preview reads as a smudge rather than a mockup. */
const MIN_CANVAS_WIDTH = 240
/** Well under the 2400px flat export — see `exportFlat.ts` — since a preview
 * redraws on every control tweak, not once on demand. */
const DEFAULT_MAX_CANVAS_WIDTH = 1400

/**
 * Fits a fixed-aspect preview into whatever space is available, then picks a
 * canvas backing-store resolution for it.
 *
 * Two different concerns, deliberately kept in one function because they
 * share the same inputs: `displayWidth`/`displayHeight` are CSS pixels for
 * the element's box (the letterboxing), while `canvasWidth`/`canvasHeight`
 * are the backing-store resolution `composeWindow` actually draws at (the
 * redraw-cost control). Getting either wrong shows up as the same bug — a
 * preview that is stretched, cropped, or blurrier than it needs to be.
 */
export function fitPreviewLayout(
  available: Box,
  aspect: number,
  devicePixelRatio: number,
  maxCanvasWidth: number = DEFAULT_MAX_CANVAS_WIDTH,
): PreviewLayout {
  if (available.width <= 0 || available.height <= 0 || aspect <= 0) {
    return { displayWidth: 0, displayHeight: 0, canvasWidth: 1, canvasHeight: 1 }
  }

  const availableAspect = available.width / available.height
  const displayWidth =
    availableAspect > aspect ? available.height * aspect : available.width
  const displayHeight = displayWidth / aspect

  const scale = Math.min(Math.max(devicePixelRatio, 1), 2)
  const canvasWidth = Math.max(
    MIN_CANVAS_WIDTH,
    Math.min(Math.round(displayWidth * scale), maxCanvasWidth),
  )
  const canvasHeight = Math.round(canvasWidth / aspect)

  return { displayWidth, displayHeight, canvasWidth, canvasHeight }
}
