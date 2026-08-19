/**
 * Collision-aware placement for floating elements.
 *
 * Pure geometry: it is handed rectangles and returns coordinates, so it can be
 * tested without a browser and reused by anything that floats — tooltips today,
 * popovers later.
 */

export type Side = 'top' | 'bottom' | 'left' | 'right'

export interface Rect {
  left: number
  top: number
  width: number
  height: number
}

export interface Placement {
  left: number
  top: number
  /** Where it actually ended up, which may not be what was asked for. */
  side: Side
}

/** Fallback order for each preferred side: the opposite edge first, then across. */
const FALLBACKS: Record<Side, readonly Side[]> = {
  top: ['top', 'bottom', 'right', 'left'],
  bottom: ['bottom', 'top', 'right', 'left'],
  left: ['left', 'right', 'top', 'bottom'],
  right: ['right', 'left', 'top', 'bottom'],
}

function positionOn(side: Side, anchor: Rect, floating: Rect, gap: number): Placement {
  const centreX = anchor.left + anchor.width / 2 - floating.width / 2
  const centreY = anchor.top + anchor.height / 2 - floating.height / 2

  switch (side) {
    case 'top':
      return { left: centreX, top: anchor.top - floating.height - gap, side }
    case 'bottom':
      return { left: centreX, top: anchor.top + anchor.height + gap, side }
    case 'left':
      return { left: anchor.left - floating.width - gap, top: centreY, side }
    case 'right':
      return { left: anchor.left + anchor.width + gap, top: centreY, side }
  }
}

const fitsIn = (placement: Placement, floating: Rect, viewport: Rect, margin: number) =>
  placement.left >= viewport.left + margin &&
  placement.top >= viewport.top + margin &&
  placement.left + floating.width <= viewport.left + viewport.width - margin &&
  placement.top + floating.height <= viewport.top + viewport.height - margin

const clamp = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), max)

export interface PlaceOptions {
  anchor: Rect
  floating: Rect
  viewport: Rect
  preferred?: Side
  /** Distance between the anchor and the floating element. */
  gap?: number
  /** Minimum distance to keep from the viewport edge. */
  margin?: number
}

/**
 * Places `floating` beside `anchor`, staying inside `viewport`.
 *
 * Tries the preferred side, then the opposite, then across — and if nothing
 * fits outright, keeps the best candidate and slides it back inside the
 * viewport. Clamping last matters: a tooltip pinned to a control in the corner
 * of the screen has no side that fits cleanly, and showing it half off-screen
 * is the same as not showing it.
 */
export function place({
  anchor,
  floating,
  viewport,
  preferred = 'top',
  gap = 6,
  margin = 8,
}: PlaceOptions): Placement {
  const candidates = FALLBACKS[preferred].map((side) =>
    positionOn(side, anchor, floating, gap),
  )

  const fitting = candidates.find((candidate) =>
    fitsIn(candidate, floating, viewport, margin),
  )
  const chosen = fitting ?? candidates[0] ?? positionOn(preferred, anchor, floating, gap)

  return {
    side: chosen.side,
    left: clamp(
      chosen.left,
      viewport.left + margin,
      viewport.left + viewport.width - floating.width - margin,
    ),
    top: clamp(
      chosen.top,
      viewport.top + margin,
      viewport.top + viewport.height - floating.height - margin,
    ),
  }
}
