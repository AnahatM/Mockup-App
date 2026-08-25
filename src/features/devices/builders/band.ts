import { CatmullRomCurve3, ExtrudeGeometry, Vector3 } from 'three'
import { squircleShape } from './shape'
import { bandLoop, bandPoint } from '../spec/bandLoop'
import type { BandSpec, BodySpec } from '../spec/types'

/**
 * A watch strap, swept along its half of the fastened loop.
 *
 * Uses `extrudePath` rather than a stack of rotated boxes: a real strap bends
 * continuously, and segmented boxes show their joins exactly where the light
 * catches the edge.
 *
 * Where the strap *goes* is `spec/bandLoop.ts` and not here, because the
 * framing maths needs the same ellipse to know how far the loop hangs below
 * the case — and it cannot import a three.js builder to find out.
 */

/** Points sampled along the arc before Catmull-Rom smooths between them.
 *  Enough that the spline tracks the ellipse rather than cutting its corners;
 *  the strap meets the case at a shallow angle where an error shows. */
const SAMPLES = 10
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

  const loop = bandLoop(body, band)
  const curve = new CatmullRomCurve3(
    Array.from({ length: SAMPLES }, (_, i) => {
      const [x, y, z] = bandPoint(loop, direction, i / (SAMPLES - 1))
      return new Vector3(x, y, z)
    }),
  )

  const geometry = new ExtrudeGeometry(shape, {
    extrudePath: curve,
    steps: 24,
    bevelEnabled: false,
    curveSegments: 6,
  })
  geometry.computeVertexNormals()
  return geometry
}
