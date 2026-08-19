import { ExtrudeGeometry } from 'three'
import { squircleShape } from './shape'
import type { StandSpec } from '../spec/types'

export interface StandParts {
  neck: ExtrudeGeometry
  base: ExtrudeGeometry
  /** Height of the display's bottom edge above the desk. */
  displayY: number
}

/**
 * Neck and foot for a desktop display.
 *
 * Both are squircle extrusions rather than boxes for the same reason the device
 * bodies are: a sharp-edged slab catches no rim light and reads as flat.
 */
export function buildStand(stand: StandSpec): StandParts {
  const neck = extrude(stand.neckWidth, stand.neckHeight, stand.neckDepth, 1.2)
  const base = extrude(stand.baseWidth, stand.baseDepth, stand.baseHeight, 2.4)
  // The foot lies flat, so its extrusion runs vertically.
  base.rotateX(-Math.PI / 2)

  return { neck, base, displayY: stand.baseHeight + stand.neckHeight }
}

function extrude(
  width: number,
  height: number,
  depth: number,
  radius: number,
): ExtrudeGeometry {
  const edge = Math.min(depth * 0.3, radius * 0.6)
  const shape = squircleShape({
    width: width - edge * 2,
    height: height - edge * 2,
    radius: Math.max(radius - edge, 0.4),
    exponent: 3.4,
    segments: 10,
  })

  const geometry = new ExtrudeGeometry(shape, {
    depth: Math.max(depth - edge * 2, 0.1),
    bevelEnabled: edge > 0,
    bevelThickness: edge,
    bevelSize: edge,
    bevelSegments: 3,
    curveSegments: 1,
  })
  geometry.center()
  geometry.computeVertexNormals()
  return geometry
}
