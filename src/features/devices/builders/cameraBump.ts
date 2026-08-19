import { ExtrudeGeometry } from 'three'
import { squircleShape } from './shape'
import type { CameraBumpSpec } from '../spec/types'

/**
 * The raised camera plateau. Built separately from the lenses so the plateau can
 * take the body's finish while the lenses take glass.
 */
export function buildBumpPlateau(bump: CameraBumpSpec): ExtrudeGeometry {
  const edge = Math.min(bump.depth * 0.35, bump.cornerRadius * 0.5)

  const shape = squircleShape({
    width: bump.width - edge * 2,
    height: bump.height - edge * 2,
    radius: Math.max(bump.cornerRadius - edge, 0.01),
    exponent: 4.4,
    segments: 16,
  })

  const geometry = new ExtrudeGeometry(shape, {
    depth: Math.max(bump.depth - edge * 2, 0.01),
    bevelEnabled: edge > 0,
    bevelThickness: edge,
    bevelSize: edge,
    bevelSegments: 4,
    curveSegments: 1,
  })

  geometry.center()
  geometry.computeVertexNormals()
  return geometry
}
