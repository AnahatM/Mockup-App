/**
 * The patch of floor the product is standing on, and how a structure gets out
 * of its way.
 *
 * Its own module because both kinds of environment need it and neither owns
 * it: the lattice fields ask per cell, the built room asks per floor tile, and
 * the radius itself comes from the device catalogue (`clearanceRadiusFor`).
 */

/**
 * How far past the device's footprint the field returns to full height.
 *
 * The ramp matters as much as the exclusion: cutting the wave off at a hard
 * circle reads as a bug of its own — a perfectly round crater in a rippling
 * field — where an eased one reads as the product settling into the floor.
 */
const CLEARANCE_RAMP = 2.2

/**
 * A point's clearance factor: 0 inside the device's footprint, smoothly
 * reaching 1 by `CLEARANCE_RAMP` times that radius. Multiplies anything that
 * would lift a tile off the floor.
 *
 * A field's own radial falloff is *not* a substitute, and believing it was is
 * what shipped the bug. That falloff is a fraction of the field's extent, so
 * it says nothing about how big the device is: at the default extent of 8 a
 * tile one unit out has already reached 0.125 of full relief, and the
 * pulsating block field ignored it altogether and drove up to three units
 * straight through whatever was standing there.
 */
export function clearanceAt(radius: number, clear: number): number {
  if (clear <= 0) return 1
  const t = (radius - clear) / (clear * (CLEARANCE_RAMP - 1))
  if (t <= 0) return 0
  if (t >= 1) return 1
  return t * t * (3 - 2 * t)
}
