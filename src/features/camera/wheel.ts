/**
 * Normalises a wheel event's `deltaY` to a small, roughly device-independent
 * step.
 *
 * A physical mouse wheel reports a handful of large deltas per notch; a
 * trackpad's two-finger scroll reports many small deltas for the same
 * gesture. Both `navigate.ts`'s `wheelZoomFactor` and `flyPhysics.ts`'s
 * `wheelDollyDistance` scale their result by this *magnitude* rather than
 * treating every wheel event as one fixed-size "tick" — which is what makes
 * a trackpad feel proportional instead of jumpy: counting events instead of
 * their size would make the same physical scroll gesture move roughly ten
 * times as far on a trackpad (many small events) as on a mouse (one or two
 * large ones).
 */
export function normalizeWheelDelta(deltaY: number, deltaMode: number): number {
  // deltaMode 1 = "line" units (Firefox's default for a physical wheel), 2 =
  // "page" units. Chromium reports 0 (pixels) for both mice and trackpads, so
  // this mainly guards other engines rather than doing any real work here.
  const pixels = deltaMode === 1 ? deltaY * 16 : deltaMode === 2 ? deltaY * 480 : deltaY
  // Clamps a single very fast flick from producing an outsized jump.
  return Math.max(-120, Math.min(120, pixels))
}
