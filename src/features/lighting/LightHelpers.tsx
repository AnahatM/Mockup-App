import { useAppStore } from '@/state/store'
import type { LightConfig } from './schema'

/**
 * Wireframe markers showing where each light actually is.
 *
 * A parametric rig is invisible by definition — the lights only exist as
 * reflections — so positioning one by dragging three numbers is guesswork
 * without a marker. These are drawn in the scene but excluded from the
 * environment bake and from export, so they never appear in a render.
 */
export function LightHelpers() {
  const lighting = useAppStore((state) => state.lighting)
  if (!lighting.showHelpers) return null

  return (
    <group>
      {lighting.lights.map((light) => (
        <LightMarker key={light.id} light={light} />
      ))}
    </group>
  )
}

function LightMarker({ light }: { light: LightConfig }) {
  const [w, h] = [light.scale[0], light.scale[1]]
  // Unlit and always drawn on top, so a marker inside the product is still
  // findable rather than hidden by the thing it is lighting.
  const material = (
    <meshBasicMaterial
      color={light.color}
      wireframe
      toneMapped={false}
      transparent
      opacity={light.enabled ? 0.9 : 0.25}
      depthTest={false}
    />
  )

  return (
    <group position={light.position} rotation={light.rotation} renderOrder={999}>
      {light.form === 'rect' ? (
        <mesh>
          <planeGeometry args={[w, h]} />
          {material}
        </mesh>
      ) : (
        <mesh>
          <ringGeometry args={[w * 0.35, w * 0.5, 24]} />
          {material}
        </mesh>
      )}

      {/* A short stalk toward the origin shows which way the light faces. */}
      <mesh position={[0, 0, -Math.min(w, h) * 0.35]}>
        <boxGeometry args={[0.02, 0.02, Math.min(w, h) * 0.7]} />
        {material}
      </mesh>
    </group>
  )
}
