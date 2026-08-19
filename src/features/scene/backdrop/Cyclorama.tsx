import { useMemo } from 'react'
import { Shape, ExtrudeGeometry } from 'three'
import type { BackdropConfig } from '../schema'

/**
 * An infinite-corner studio sweep: floor curving up into a back wall with no
 * visible seam. Real geometry rather than a painted gradient, so it catches the
 * rig's light and the product's contact shadow.
 */
export function Cyclorama({ config }: { config: BackdropConfig }) {
  const geometry = useMemo(() => buildSweep(), [])

  return (
    <mesh geometry={geometry} position={[0, 0, 0]} receiveShadow>
      <meshStandardMaterial color={config.color} roughness={0.92} metalness={0} />
    </mesh>
  )
}

const DEPTH = 26
const FLOOR = 9
const WALL = 11
const CURVE = 3.2

function buildSweep(): ExtrudeGeometry {
  // Drawn in profile (z across, y up) then extruded sideways, which is the
  // simplest way to get a continuous fillet between floor and wall.
  const profile = new Shape()
  profile.moveTo(FLOOR, 0)
  profile.lineTo(-CURVE, 0)
  profile.quadraticCurveTo(-FLOOR * 0.55, 0, -FLOOR * 0.55, CURVE)
  profile.lineTo(-FLOOR * 0.55, WALL)

  const geometry = new ExtrudeGeometry(profile, {
    depth: DEPTH,
    bevelEnabled: false,
    curveSegments: 48,
  })
  // Extrusion runs along +z from the profile plane; rotate and centre it so the
  // sweep sits behind and beneath the origin.
  geometry.rotateY(Math.PI / 2)
  geometry.translate(DEPTH / 2, 0, 0)
  return geometry
}
