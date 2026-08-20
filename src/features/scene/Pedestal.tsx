import { useMemo } from 'react'
import { buildSurfaceMaps } from '@/features/textures'
import { useAppStore } from '@/state/store'

/**
 * The plinth the product stands on. Sits just below the origin so a device
 * placed at y=0 rests on its surface rather than intersecting it.
 */
export function Pedestal() {
  const config = useAppStore((state) => state.scene.pedestal)

  // Hooks run before the early return below regardless of whether the
  // pedestal is shown, per the rules of hooks.
  const overlay = useMemo(
    () =>
      config.texture.kind === 'none'
        ? null
        : buildSurfaceMaps(config.texture, config.roughness),
    [config.texture, config.roughness],
  )

  if (!config.enabled || config.shape === 'none') return null

  const y = -config.height / 2

  return (
    <mesh position={[0, y, 0]} receiveShadow castShadow>
      {config.shape === 'disc' ? (
        <cylinderGeometry args={[config.radius, config.radius, config.height, 64]} />
      ) : (
        <boxGeometry args={[config.radius * 2, config.height, config.radius * 2]} />
      )}
      <meshStandardMaterial
        color={config.color}
        roughness={config.roughness}
        metalness={config.metalness}
        roughnessMap={overlay?.roughnessMap ?? null}
        normalMap={overlay?.normalMap ?? null}
      />
    </mesh>
  )
}
