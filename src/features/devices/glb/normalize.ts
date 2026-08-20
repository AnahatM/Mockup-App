import { Vector3 } from 'three'
import type { Box3 } from 'three'

/**
 * How to place a loaded model so it behaves like every procedural device:
 * centred on its own body, sized to a sensible envelope regardless of whether
 * the artist modelled in millimetres or metres — see importing-models.md's
 * "the app fits the camera to whatever it finds".
 */
export interface GlbNormalization {
  /** Uniform scale to bring the model into the same "1 unit = 100mm" space the
   *  rest of the device system already renders in. */
  scale: number
  /** Local offset so the bounding-box centre sits at the origin, matching how
   *  every procedural DeviceSpec is authored around its own centre. */
  offset: readonly [number, number, number]
  /** The model's footprint, converted into DeviceSpec's millimetre convention,
   *  so camera framing and pedestal sizing reuse the existing device maths. */
  sizeMm: readonly [number, number, number]
}

/** A comfortably-framed default: about as tall as a large phone or small tablet. */
const TARGET_LARGEST_MM = 220

export function normalizeBounds(box: Box3): GlbNormalization | null {
  const size = new Vector3()
  box.getSize(size)
  const largest = Math.max(size.x, size.y, size.z)
  if (!Number.isFinite(largest) || largest <= 0) return null

  const scale = TARGET_LARGEST_MM / largest
  const center = new Vector3()
  box.getCenter(center)

  return {
    scale,
    offset: [-center.x, -center.y, -center.z],
    sizeMm: [size.x * scale, size.y * scale, size.z * scale],
  }
}
