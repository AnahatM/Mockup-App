import { ExtrudeGeometry } from 'three'
import { squircleShape } from './shape'
import type { BodySpec, ButtonSpec } from '../spec/types'

export interface ButtonPlacement {
  geometry: ExtrudeGeometry
  position: [number, number, number]
  rotation: [number, number, number]
}

const DEFAULT_PROTRUSION = 0.5

/**
 * Side buttons, built as chamfered pills rather than plain boxes.
 *
 * A sharp-edged box reads as a slot cut into the rail: its faces are flat, so it
 * either matches the rail's reflection exactly and disappears, or mismatches and
 * looks like a hole. The chamfer gives it its own highlight along the edge,
 * which is how a real button reads — same material as the rail, distinguished by
 * the light catching its border.
 *
 * Extrusion runs along local +Z, then the whole button is rotated onto its rail.
 */
export function buildButton(body: BodySpec, button: ButtonSpec): ButtonPlacement {
  const protrusion = button.protrusion ?? DEFAULT_PROTRUSION
  // Width across the rail. Just over half the body depth matches real hardware.
  const across = button.width ?? body.depth * 0.52
  // Sunk into the rail so the base is never visible against a curved surface.
  const sink = protrusion * 1.4
  const depth = protrusion + sink
  const chamfer = Math.min(protrusion * 0.5, across * 0.2, 0.25)

  const shape = squircleShape({
    width: button.length - chamfer * 2,
    height: across - chamfer * 2,
    radius: Math.max(across / 2 - chamfer, 0.05),
    exponent: 3.2,
    segments: 8,
  })

  const geometry = new ExtrudeGeometry(shape, {
    depth: Math.max(depth - chamfer * 2, 0.01),
    bevelEnabled: chamfer > 0,
    bevelThickness: chamfer,
    bevelSize: chamfer,
    bevelSegments: 3,
    curveSegments: 1,
  })
  geometry.center()
  geometry.computeVertexNormals()

  const outward = body.width / 2 + protrusion - depth / 2
  const upward = body.height / 2 + protrusion - depth / 2

  switch (button.side) {
    case 'right':
      return {
        geometry,
        position: [outward, button.offset, 0],
        rotation: [0, Math.PI / 2, 0],
      }
    case 'left':
      return {
        geometry,
        position: [-outward, button.offset, 0],
        rotation: [0, -Math.PI / 2, 0],
      }
    case 'top':
      return {
        geometry,
        position: [button.offset, upward, 0],
        rotation: [-Math.PI / 2, 0, Math.PI / 2],
      }
    case 'bottom':
      return {
        geometry,
        position: [button.offset, -upward, 0],
        rotation: [Math.PI / 2, 0, Math.PI / 2],
      }
  }
}
