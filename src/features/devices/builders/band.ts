import { CatmullRomCurve3, ExtrudeGeometry, Vector3 } from 'three'
import { squircleShape } from './shape'
import type { BandSpec, BodySpec } from '../spec/types'

/**
 * A watch strap, swept along a curve.
 *
 * Uses `extrudePath` rather than a stack of rotated boxes: a real strap bends
 * continuously, and segmented boxes show their joins exactly where the light
 * catches the edge. `up` is pinned so consecutive frames along the curve do not
 * twist the cross-section.
 */
export function buildBand(
  body: BodySpec,
  band: BandSpec,
  direction: 1 | -1,
): ExtrudeGeometry {
  const shape = squircleShape({
    width: band.width,
    height: band.thickness,
    radius: band.thickness * 0.45,
    exponent: 3,
    segments: 6,
  })

  const start = (body.height / 2) * direction
  const curve = new CatmullRomCurve3([
    new Vector3(0, start, 0),
    new Vector3(0, start + band.length * 0.34 * direction, -band.curve * 0.25),
    new Vector3(0, start + band.length * 0.68 * direction, -band.curve * 0.72),
    new Vector3(0, start + band.length * direction, -band.curve),
  ])

  const geometry = new ExtrudeGeometry(shape, {
    extrudePath: curve,
    steps: 24,
    bevelEnabled: false,
    curveSegments: 6,
  })
  geometry.computeVertexNormals()
  return geometry
}
