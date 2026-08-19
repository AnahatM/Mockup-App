import { ExtrudeGeometry } from 'three'
import { squircleShape } from './shape'
import type { BodySpec, ButtonSpec } from '../spec/types'

export interface ButtonPlacement {
  geometry: ExtrudeGeometry
  position: [number, number, number]
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
 * The geometry is rotated into place here rather than on the mesh. Euler order
 * makes it far too easy to get a composed mesh rotation subtly wrong — the first
 * version put the button's *length* along the phone's thickness, so volume keys
 * ran horizontally across the rail instead of up it. Applying one explicit axis
 * rotation to the geometry is unambiguous and verifiable.
 */
export function buildButton(body: BodySpec, button: ButtonSpec): ButtonPlacement {
  const protrusion = button.protrusion ?? DEFAULT_PROTRUSION
  // Width across the rail. Just over half the body depth matches real hardware.
  const across = button.width ?? body.depth * 0.52
  // Sunk into the rail so the base is never visible against a curved surface.
  const depth = protrusion * 2.4
  const chamfer = Math.min(protrusion * 0.5, across * 0.2, 0.25)

  const onSideRail = button.side === 'left' || button.side === 'right'

  // Extrusion always runs along local +Z, which becomes the outward direction.
  // Shape axes are chosen so a single rotation lands length along the rail.
  const shape = squircleShape({
    width: (onSideRail ? across : button.length) - chamfer * 2,
    height: (onSideRail ? button.length : across) - chamfer * 2,
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

  // Sits a fraction inside the rail so its outer face lands exactly at
  // `protrusion` beyond the body.
  const inset = depth / 2 - protrusion

  switch (button.side) {
    // rotateY(+90): local X -> -Z (across), Y -> Y (length), Z -> +X (outward)
    case 'right':
      geometry.rotateY(Math.PI / 2)
      geometry.computeVertexNormals()
      return { geometry, position: [body.width / 2 - inset, button.offset, 0] }

    case 'left':
      geometry.rotateY(-Math.PI / 2)
      geometry.computeVertexNormals()
      return { geometry, position: [-(body.width / 2 - inset), button.offset, 0] }

    // rotateX(-90): local X -> X (length), Y -> -Z (across), Z -> +Y (outward)
    case 'top':
      geometry.rotateX(-Math.PI / 2)
      geometry.computeVertexNormals()
      return { geometry, position: [button.offset, body.height / 2 - inset, 0] }

    case 'bottom':
      geometry.rotateX(Math.PI / 2)
      geometry.computeVertexNormals()
      return { geometry, position: [button.offset, -(body.height / 2 - inset), 0] }
  }
}
