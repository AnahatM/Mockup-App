import type { BandSpec, BodySpec } from './types'

/**
 * The ellipse a fastened watch strap traces, in millimetres.
 *
 * The strap used to sweep up and backwards from each lug and simply stop,
 * which on a watch standing on a plinth read as two ribbons floating past the
 * case rather than as a band. A watch in a product shot is fastened: the strap
 * leaves the top lug, curves round the back, and meets the one coming up from
 * the bottom lug, enclosing the space a wrist would occupy.
 *
 * Pure geometry, in `spec/` rather than `builders/`, because the framing maths
 * needs the same numbers the mesh does. `groundOffsetMm` has to know how far
 * the loop hangs below the case or the watch sinks into the pedestal, and it
 * cannot import a three.js builder to find out.
 *
 * The ellipse is centred behind the case at `centreZ`, and both straps are
 * arcs of it. Its two halves have to *arrive* at the lugs rather than start
 * near them, so `centreZ` is solved rather than chosen: given the vertical
 * radius and the depth, it is the offset that puts the ellipse through
 * (±height/2, 0) exactly.
 */
export interface BandLoop {
  /** Vertical semi-axis. Always greater than the case's half-height, or the
   *  ellipse cannot reach the lugs at all. */
  radiusY: number
  /** Depth semi-axis: how far back the loop bulges. */
  radiusZ: number
  /** Centre of the ellipse, behind the case. */
  centreZ: number
  /** Angle, from the loop's back, at which the strap meets the top lug. */
  lugAngle: number
}

/**
 * How much taller than the case the loop stands.
 *
 * A real strap leaves the lug already curving outward, so the loop is wider
 * than the case in both axes. It must exceed 1 by a real margin: at exactly 1
 * the lug sits on the ellipse's own extreme and the strap leaves it at a right
 * angle to the case, which reads as a bracket rather than a band.
 */
const LOOP_RISE = 1.34

export function bandLoop(body: BodySpec, band: BandSpec): BandLoop {
  const halfHeight = body.height / 2
  const radiusY = halfHeight * LOOP_RISE
  const radiusZ = band.curve

  // Solved, not chosen: this is the only centre that puts the ellipse through
  // the lugs. `radiusY > halfHeight` is what keeps the asin in range, which is
  // the whole reason LOOP_RISE is bounded away from 1.
  const lugAngle = Math.asin(halfHeight / radiusY)
  const centreZ = -radiusZ * Math.cos(lugAngle)

  return { radiusY, radiusZ, centreZ, lugAngle }
}

/**
 * A point on one strap, at `t` from the lug (0) to the back of the loop (1).
 *
 * `direction` is +1 for the strap leaving the top lug and -1 for the bottom,
 * and the two meet at the back — which is why both run to the same place and
 * the loop closes without either knowing about the other.
 */
export function bandPoint(
  loop: BandLoop,
  direction: 1 | -1,
  t: number,
): [number, number, number] {
  const angle = direction * (loop.lugAngle + t * (Math.PI - loop.lugAngle))
  return [
    0,
    loop.radiusY * Math.sin(angle),
    loop.centreZ + loop.radiusZ * Math.cos(angle),
  ]
}
