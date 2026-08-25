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
 *
 * The radii are proportions of the part rather than millimetres, which is the
 * whole difference between a stand and two boxes. They were fixed at 1.2mm and
 * 2.4mm — on a 240mm foot that is a rounding you cannot see at any distance, so
 * the monitor stood on a rectangular slab and read as a placeholder. A device
 * *body* is right to use millimetres, because a phone's corner radius is a
 * published figure; a stand's is not, and the shape it wants is "generously
 * rounded for its size" at every size in the catalogue.
 */

/** Corner radius of the foot, as a share of its shorter side. */
const BASE_ROUNDING = 0.22

/** Corner radius of the neck, as a share of its narrower dimension. */
const NECK_ROUNDING = 0.35

export function buildStand(stand: StandSpec): StandParts {
  const neckRadius = Math.min(stand.neckWidth, stand.neckDepth) * NECK_ROUNDING
  const baseRadius = Math.min(stand.baseWidth, stand.baseDepth) * BASE_ROUNDING

  const neck = extrude(stand.neckWidth, stand.neckHeight, stand.neckDepth, neckRadius)
  const base = extrude(stand.baseWidth, stand.baseDepth, stand.baseHeight, baseRadius)
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
