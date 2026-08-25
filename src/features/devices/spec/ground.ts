import { MM_TO_UNITS, type DeviceSpec } from './types'
import { extentMm } from './framing'

/**
 * Where a device meets the ground, and how much of it the ground has to give
 * up: the plinth under it, the shadow it casts, and the patch of floor that
 * backdrop structures have to leave alone.
 *
 * Split from `framing.ts` — which answers "where does the camera go" — because
 * these answer "what does the floor have to do about it". They share
 * `extentMm` and nothing else.
 */

/**
 * A pedestal radius that suits the device's footprint, in scene units.
 *
 * A disc sized for a phone leaves a monitor hanging off both edges, so this
 * scales with the device for the same reason the camera does.
 */
export function pedestalRadiusFor(spec: DeviceSpec): number {
  const extent = extentMm(spec)
  const footprintDepth = spec.hinge ? spec.hinge.base.height : extent.z
  const footprint = Math.max(extent.x, footprintDepth)
  return Number((footprint * 0.85 * MM_TO_UNITS).toFixed(3))
}

/**
 * Depth range of the contact shadow's camera, in scene units.
 *
 * The bake is an orthographic depth render looking up from the floor, so
 * anything further away than this contributes nothing at all. A value sized
 * for a phone therefore truncates a monitor part-way up, and the shadow loses
 * the contribution of everything above the cut — which reads as a shadow that
 * is not the shape of the thing casting it. `shadowScaleFor` has always
 * adapted the plane's width to the device; this is the same idea for depth,
 * and the two being out of step was the bug.
 *
 * Headroom above the device's own height covers the levitate lift, which the
 * caller adds on top at render time.
 */
export function shadowFarFor(spec: DeviceSpec): number {
  const height = extentMm(spec).y * MM_TO_UNITS
  return Number(Math.min(10, Math.max(1.6, height * 1.6)).toFixed(2))
}

/**
 * Contact-shadow extent for the device, in scene units.
 *
 * The shadow is drawn on a finite plane, so one sized for a phone shows its own
 * straight edge behind a monitor. Scaling it with the device keeps the fade
 * off-frame.
 */
export function shadowScaleFor(spec: DeviceSpec): number {
  const extent = extentMm(spec)
  const footprint = Math.max(extent.x, spec.hinge ? spec.hinge.base.height : extent.z)
  return Number(Math.max(3, footprint * 2.4 * MM_TO_UNITS).toFixed(2))
}

/**
 * How much extra ground the exclusion claims beyond the device's own outline,
 * so a tile does not graze a corner it technically clears.
 */
const CLEARANCE_MARGIN = 1.2

/**
 * Radius of the ground the product occupies, in scene units.
 *
 * Backdrop structures are laid across the whole floor, and until this existed
 * nothing in that code knew a device was standing in the middle of it — the
 * pulsating block field rises up to three units and drove straight through a
 * phone. Fields keep this circle flat: see `environments/lattice.ts`.
 *
 * The half-*diagonal* of the footprint rather than half its width, because the
 * device is free to rotate about Y and the exclusion has to hold it at any
 * yaw. A circle is the only shape that does that without recomputing.
 */
export function clearanceRadiusFor(spec: DeviceSpec): number {
  const extent = extentMm(spec)
  const depth = spec.hinge ? spec.hinge.base.height : extent.z
  const radius = Math.hypot(extent.x, depth) / 2
  return Number((radius * CLEARANCE_MARGIN * MM_TO_UNITS).toFixed(3))
}

/**
 * How tall the product stands, in scene units.
 *
 * Backdrop structures use it as a ceiling. Their sliders were authored with no
 * reference to scale — a tile depth of 3 and a pulse of 3 are reasonable
 * behind a 6-unit monitor and absurd behind a 1.5-unit phone, where they build
 * a forest tall enough to close over the camera and turn the viewport flat
 * grey. A backdrop is behind the product by definition; letting it tower over
 * it is never the shot anyone wanted.
 */
export function productHeightFor(spec: DeviceSpec): number {
  return Number((extentMm(spec).y * MM_TO_UNITS).toFixed(3))
}
