import { useMemo } from 'react'
import { buildBumpPlateau } from '../builders/cameraBump'
import { FinishMaterial } from '../materials/FinishMaterial'
import type { CameraBumpSpec, DeviceSpec } from '../spec/types'

export interface CameraBumpProps {
  spec: DeviceSpec
  bump: CameraBumpSpec
  bodyColor: string
  frameColor: string
}

/**
 * Raised camera plateau with real lenses.
 *
 * Each lens is a ring, a recessed barrel and a glass cap. That stack is what
 * produces the small bright catchlight that makes a camera read as a camera
 * rather than as a printed circle.
 */
export function CameraBump({ spec, bump, bodyColor, frameColor }: CameraBumpProps) {
  const plateau = useMemo(() => buildBumpPlateau(bump), [bump])
  const backZ = -(spec.body.depth / 2)

  return (
    <group position={[bump.x, bump.y, backZ - bump.depth / 2]}>
      <mesh geometry={plateau} castShadow>
        <FinishMaterial finish={spec.materials.back} color={bodyColor} />
      </mesh>

      {bump.lenses.map((lens, index) => (
        <group key={index} position={[lens.x, lens.y, -bump.depth / 2]}>
          {/* Metal ring around the lens */}
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry
              args={[lens.radius, lens.radius, bump.depth * 0.55, 32]}
            />
            <FinishMaterial finish="steel" color={frameColor} />
          </mesh>
          {/* Glass element, sunk slightly so it catches a highlight */}
          <mesh position={[0, 0, -bump.depth * 0.16]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry
              args={[lens.radius * 0.78, lens.radius * 0.78, bump.depth * 0.3, 32]}
            />
            <meshPhysicalMaterial
              color="#0a0c12"
              roughness={0.04}
              metalness={0.1}
              clearcoat={1}
              clearcoatRoughness={0.02}
              reflectivity={0.9}
            />
          </mesh>
        </group>
      ))}

      {bump.flash && (
        <mesh
          position={[bump.flash.x, bump.flash.y, -bump.depth * 0.5]}
          rotation={[Math.PI / 2, 0, 0]}
        >
          <cylinderGeometry
            args={[bump.flash.radius, bump.flash.radius, bump.depth * 0.2, 24]}
          />
          <meshStandardMaterial
            color="#f6e6c8"
            emissive="#f6e6c8"
            emissiveIntensity={0.15}
            roughness={0.3}
          />
        </mesh>
      )}
    </group>
  )
}
