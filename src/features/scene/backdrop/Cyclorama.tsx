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
      {/* Slightly glossy rather than pure matte: a real cove sweep picks up a
          soft sheen from the key light, and that gradient across the floor is
          most of what makes the space read as three-dimensional. */}
      <meshStandardMaterial
        color={config.color}
        roughness={0.78}
        metalness={0}
        envMapIntensity={0.85}
      />
    </mesh>
  )
}

// Generous enough that the sweep's edges stay out of frame at any sensible
// camera distance — a visible edge is what turns a cove back into a backdrop.
const DEPTH = 44
const FLOOR = 16
const WALL = 18
const CURVE = 4.5

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
