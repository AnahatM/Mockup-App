/**
 * Fitting uploaded media onto a device screen.
 *
 * Pure geometry: given the screen's physical size and the media's aspect ratio,
 * work out how big the media plane should be and how its texture should be
 * cropped. No three.js types cross this boundary, so the tricky part is testable.
 */

export const FIT_MODES = ['cover', 'contain', 'stretch'] as const
export type FitMode = (typeof FIT_MODES)[number]

export interface MediaFit {
  /** Size of the quad the media is drawn on, in the same units as the screen. */
  planeWidth: number
  planeHeight: number
  /** Texture repeat — below 1 crops in, which is how `cover` works. */
  repeat: [number, number]
  /** Texture offset, already centred and panned. */
  offset: [number, number]
}

export interface FitOptions {
  screenWidth: number
  screenHeight: number
  /** width / height of the uploaded image or video. */
  mediaAspect: number
  mode: FitMode
  /** 1 is untouched; above 1 crops in. */
  zoom?: number
  /** -1 to 1 across the cropped region. */
  panX?: number
  panY?: number
}

/**
 * `cover` fills the screen and crops the overflow — the sensible default,
 * because a screenshot taken on the same class of device should reach the edges.
 *
 * `contain` shrinks the plane to the media's aspect so nothing is cropped; the
 * screen's own background shows through around it. This is done by resizing the
 * quad rather than by letterboxing the texture, because a texture scaled below
 * its plane would clamp and smear its edge pixels instead of leaving a gap.
 *
 * `stretch` distorts to fill.
 */
export function fitMedia({
  screenWidth,
  screenHeight,
  mediaAspect,
  mode,
  zoom = 1,
  panX = 0,
  panY = 0,
}: FitOptions): MediaFit {
  const safeAspect = mediaAspect > 0 && Number.isFinite(mediaAspect) ? mediaAspect : 1
  const safeZoom = Math.max(zoom, 0.01)
  const screenAspect = screenWidth / screenHeight

  let planeWidth = screenWidth
  let planeHeight = screenHeight
  let cropX = 1
  let cropY = 1

  if (mode === 'contain') {
    // Shrink the quad to the media's aspect, fitting inside the screen.
    if (safeAspect > screenAspect) planeHeight = screenWidth / safeAspect
    else planeWidth = screenHeight * safeAspect
  } else if (mode === 'cover') {
    // Keep the quad full-screen and crop the texture's long axis.
    if (safeAspect > screenAspect) cropX = screenAspect / safeAspect
    else cropY = safeAspect / screenAspect
  }

  const repeatX = cropX / safeZoom
  const repeatY = cropY / safeZoom

  // Centre the visible window, then pan within whatever slack the crop leaves.
  const slackX = Math.max(0, 1 - repeatX)
  const slackY = Math.max(0, 1 - repeatY)

  return {
    planeWidth,
    planeHeight,
    repeat: [repeatX, repeatY],
    offset: [
      slackX / 2 + (clamp11(panX) * slackX) / 2,
      slackY / 2 + (clamp11(panY) * slackY) / 2,
    ],
  }
}

const clamp11 = (value: number): number => Math.min(Math.max(value, -1), 1)
