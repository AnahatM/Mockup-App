import { MM_TO_UNITS, type DeviceSpec } from './types'

export interface DeviceFraming {
  /** Where the camera should look — the visual centre of the device. */
  target: [number, number, number]
  /** A pleasing three-quarter camera position for this device's size. */
  position: [number, number, number]
}

/**
 * Suggests camera framing for a device.
 *
 * A phone is ~150mm tall and a laptop ~310mm wide, so a single fixed camera
 * either crops the laptop or leaves the phone as a speck. Distance is derived
 * from the device's own bounding size and the field of view, which means a new
 * device in the catalogue is framed correctly without anyone tuning numbers.
 */
export function frameDevice(spec: DeviceSpec, fovDegrees: number): DeviceFraming {
  const { width, height, depth } = spec.body

  // Overall extent, and the height of the visual centre above the pedestal.
  const isClamshell = spec.hinge !== undefined
  const extentX = width * MM_TO_UNITS
  const extentY = (isClamshell ? height * 0.82 : height) * MM_TO_UNITS
  const extentZ = (isClamshell ? height : depth) * MM_TO_UNITS
  const centreY = isClamshell ? extentY * 0.52 : extentY / 2

  // Fit the larger of width and height, with headroom, at the given fov.
  const fov = (fovDegrees * Math.PI) / 180
  const radius = Math.max(extentX, extentY, extentZ) / 2
  const distance = (radius * 1.5) / Math.tan(fov / 2) + extentZ * 0.5

  return {
    target: [0, centreY, 0],
    position: [distance * 0.4, centreY + distance * 0.3, distance * 0.86],
  }
}

/**
 * A pedestal radius that suits the device's footprint, in scene units.
 *
 * A disc sized for a phone leaves a laptop hanging off both edges, so this
 * scales with the device for the same reason the camera does.
 */
export function pedestalRadiusFor(spec: DeviceSpec): number {
  const footprintDepth = spec.hinge ? spec.hinge.base.height : spec.body.depth
  const footprint = Math.max(spec.body.width, footprintDepth)
  return Number((footprint * 0.85 * MM_TO_UNITS).toFixed(3))
}
