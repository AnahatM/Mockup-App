import { ExtrudeGeometry } from 'three'
import { clamp } from '@/lib/math/number'
import { squircleShape } from './shape'
import type { BodySpec } from '../spec/types'

/**
 * The device body: a squircle extruded with a bevelled edge.
 *
 * The bevel is the point. A flat-sided slab has no curvature at its edges, so it
 * catches no rim light and reads as a cardboard cutout. The chamfer gives the
 * grazing highlight that runs down a real phone's rail.
 */
export function buildBody(body: BodySpec): ExtrudeGeometry {
  // The bevel grows the profile outward, so the base shape is inset by it in
  // order to finish at the requested outer dimensions.
  const edge = clamp(
    body.edgeRadius,
    0,
    Math.min(body.depth / 2, body.cornerRadius) - 0.01,
  )

  const shape = squircleShape({
    width: body.width - edge * 2,
    height: body.height - edge * 2,
    radius: Math.max(body.cornerRadius - edge, 0.01),
    exponent: body.cornerSmoothing ?? 4.4,
    segments: 20,
  })

  const geometry = new ExtrudeGeometry(shape, {
    depth: body.depth - edge * 2,
    bevelEnabled: edge > 0,
    bevelThickness: edge,
    bevelSize: edge,
    bevelSegments: 6,
    curveSegments: 1,
  })

  geometry.center()
  geometry.computeVertexNormals()
  return geometry
}
