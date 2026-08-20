import { MM_TO_UNITS, type DeviceSpec } from './types'

export interface DeviceFraming {
  /** Where the camera should look — the visual centre of the device. */
  target: [number, number, number]
  /** A pleasing three-quarter camera position for this device's size. */
  position: [number, number, number]
  /** Distance that fits the device at the given field of view. Camera presets
   *  scale this rather than hardcoding distances, so they work for any device. */
  distance: number
}

/**
 * How far the assembly extends below the body's centre, in millimetres.
 *
 * A device is modelled centred on its body, but a stand hangs below it and a
 * watch strap sweeps past it. Without accounting for that, a monitor floats and
 * a watch band sinks through the pedestal.
 */
export function groundOffsetMm(spec: DeviceSpec): number {
  if (spec.hinge) return 0

  const stand = spec.stand ? spec.stand.neckHeight + spec.stand.baseHeight : 0
  // The strap curves backward as it goes, so its vertical reach is less than
  // its length along the curve.
  const band = spec.band ? spec.band.length * 0.82 : 0

  return spec.body.height / 2 + stand + band
}

/** Total extent of the assembly in each axis, in millimetres. */
function extentMm(spec: DeviceSpec): { x: number; y: number; z: number } {
  const { width, height, depth } = spec.body

  if (spec.hinge) {
    // Open clamshell: the lid stands up and the base runs back along the desk.
    return { x: width, y: height * 0.82, z: spec.hinge.base.height }
  }

  const stand = spec.stand ? spec.stand.neckHeight + spec.stand.baseHeight : 0
  const bandY = spec.band ? spec.band.length * 0.82 * 2 : 0
  const bandZ = spec.band ? spec.band.curve : 0
  const standZ = spec.stand ? spec.stand.baseDepth : 0

  return {
    x: Math.max(width, spec.stand?.baseWidth ?? 0),
    y: height + stand + bandY,
    z: Math.max(depth, bandZ, standZ),
  }
}

/**
 * Suggests camera framing for a device.
 *
 * A phone is ~150mm tall and a monitor ~600mm wide, so a single fixed camera
 * either crops the monitor or leaves the phone as a speck. Distance is derived
 * from the device's own bounding size and the field of view, which means a new
 * device in the catalogue is framed correctly without anyone tuning numbers.
 */
export function frameDevice(spec: DeviceSpec, fovDegrees: number): DeviceFraming {
  const extent = extentMm(spec)
  const extentX = extent.x * MM_TO_UNITS
  const extentY = extent.y * MM_TO_UNITS
  const extentZ = extent.z * MM_TO_UNITS

  // The assembly rests on the pedestal, so its centre is half its height up.
  const centreY = spec.hinge ? extentY * 0.52 : extentY / 2

  const fov = (fovDegrees * Math.PI) / 180
  const radius = Math.max(extentX, extentY, extentZ) / 2
  const distance = (radius * 1.5) / Math.tan(fov / 2) + extentZ * 0.5

  return {
    target: [0, centreY, 0],
    position: [distance * 0.4, centreY + distance * 0.3, distance * 0.86],
    distance,
  }
}

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
 * Contact-shadow extent for the device, in scene units.
 *
 * The shadow is drawn on a finite plane, so one sized for a phone shows its own
 * straight edge behind a monitor. Scaling it with the device keeps the fade
 * off-frame.
 */
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

export function shadowScaleFor(spec: DeviceSpec): number {
  const extent = extentMm(spec)
  const footprint = Math.max(extent.x, spec.hinge ? spec.hinge.base.height : extent.z)
  return Number(Math.max(3, footprint * 2.4 * MM_TO_UNITS).toFixed(2))
}
