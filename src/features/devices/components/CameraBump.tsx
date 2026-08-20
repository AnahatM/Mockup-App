import { useMemo } from 'react'
import type { SurfaceTextureConfig } from '@/features/textures'
import { buildBumpPlateau } from '../builders/cameraBump'
import { FinishMaterial } from '../materials/FinishMaterial'
import type { CameraBumpSpec, DeviceSpec } from '../spec/types'

export interface CameraBumpProps {
  spec: DeviceSpec
  bump: CameraBumpSpec
  bodyColor: string
  frameColor: string
  bodyTexture: SurfaceTextureConfig
}

/**
 * Raised camera plateau with real lenses.
 *
 * Each lens is a ring, a recessed barrel and a glass cap. That stack is what
 * produces the small bright catchlight that makes a camera read as a camera
 * rather than as a printed circle.
 */
export function CameraBump({ spec, bump, bodyColor, frameColor, bodyTexture }: CameraBumpProps) {
  const plateau = useMemo(() => buildBumpPlateau(bump), [bump])
  const backZ = -(spec.body.depth / 2)

  return (
    <group position={[bump.x, bump.y, backZ - bump.depth / 2]}>
      <mesh geometry={plateau} castShadow>
        <FinishMaterial finish={spec.materials.back} color={bodyColor} texture={bodyTexture} />
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
          {/* Glass element, sunk so the ring casts a shadow across it.
              Iridescence stands in for the anti-reflective coating: without it
              a smooth dark lens reflects almost nothing and reads as a printed
              black disc rather than glass. */}
          <mesh position={[0, 0, -bump.depth * 0.2]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry
              args={[lens.radius * 0.74, lens.radius * 0.74, bump.depth * 0.26, 40]}
            />
            <meshPhysicalMaterial
              color="#05070d"
              roughness={0.03}
              metalness={0}
              clearcoat={1}
              clearcoatRoughness={0.02}
              reflectivity={1}
              ior={1.75}
              iridescence={0.65}
              iridescenceIOR={1.9}
              iridescenceThicknessRange={[120, 520]}
              envMapIntensity={2.2}
            />
          </mesh>

          {/* Inner barrel wall, so the lens has visible depth. */}
          <mesh position={[0, 0, -bump.depth * 0.05]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry
              args={[
                lens.radius * 0.74,
                lens.radius * 0.74,
                bump.depth * 0.34,
                40,
                1,
                true,
              ]}
            />
            <meshStandardMaterial color="#0d0f14" roughness={0.55} side={2} />
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
