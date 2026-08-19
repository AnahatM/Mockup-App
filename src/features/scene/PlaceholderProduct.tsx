import { useMemo } from 'react'
import { BoxGeometry } from 'three'

/**
 * Stands in for the real device until the spec system lands in P3. Present so the
 * studio has something to light, shadow and orbit around from the start.
 */
export function PlaceholderProduct() {
  const geometry = useMemo(() => new BoxGeometry(0.71, 1.47, 0.09), [])

  return (
    <mesh geometry={geometry} position={[0, 0.735, 0]} castShadow>
      <meshPhysicalMaterial
        color="#2a2c31"
        roughness={0.25}
        metalness={0.9}
        clearcoat={0.6}
        clearcoatRoughness={0.2}
      />
    </mesh>
  )
}
