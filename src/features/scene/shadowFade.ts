/**
 * How much of the contact shadow survives at a given viewing angle.
 *
 * A contact shadow is a flat, single-sided cheat: a soft blob painted on a
 * plane lying on the floor. It reads perfectly from above and not at all from
 * the side, and the catalogue of camera presets includes one — Low hero — that
 * puts the camera twelve degrees *below* the floor.
 *
 * At that angle the whole plane compresses into a few pixels and renders as a
 * hard grey streak running off both sides of the product, well past anything
 * casting it. It looks like a scratch on the render. Orbiting through the
 * horizon does the same thing on the way past, and `orbitBelowFloor` lets the
 * camera go all the way under.
 *
 * So the shadow fades out as the camera approaches the floor and is gone
 * before it passes through. Eased rather than switched, because a shadow that
 * blinks off mid-orbit is a worse artefact than the streak.
 */

/**
 * Elevation, as a sine, at which the shadow is back to full strength.
 *
 * About fourteen degrees. Low enough that every preset above the floor keeps
 * its shadow intact, high enough that the streak is gone before it is thin
 * enough to read as a line.
 */
const FULL_AT = Math.sin((14 * Math.PI) / 180)

/**
 * @param height    Camera height above the shadow plane, in scene units.
 * @param horizontal Camera distance from the plane's centre, along the floor.
 */
export function shadowFade(height: number, horizontal: number): number {
  // Directly overhead: nothing to graze.
  if (horizontal <= 0) return height > 0 ? 1 : 0

  const sine = height / Math.hypot(height, horizontal)
  if (sine <= 0) return 0
  if (sine >= FULL_AT) return 1

  const t = sine / FULL_AT
  return t * t * (3 - 2 * t)
}
