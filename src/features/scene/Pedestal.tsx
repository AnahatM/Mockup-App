import { useMemo } from 'react'
import { buildSurfaceMaps, mapsKey } from '@/features/textures'
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
        // Rebuilt when the maps appear or vanish — see `mapsKey`.
        key={mapsKey(overlay)}
        color={config.color}
        roughness={config.roughness}
        metalness={config.metalness}
        roughnessMap={overlay?.roughnessMap ?? null}
        normalMap={overlay?.normalMap ?? null}
        // The contact shadow lies flat on this face, a hair above it. That gap
        // is far too small for the depth buffer to resolve at a normal camera
        // distance, so the cap's triangle fan was winning the depth test in
        // wedges and cutting a starburst through the shadow. Nudging the
        // plinth's rasterised depth away from the camera makes the shadow win
        // everywhere instead of almost everywhere.
        polygonOffset
        polygonOffsetFactor={1}
        polygonOffsetUnits={1}
      />
    </mesh>
  )
}
