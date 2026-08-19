import { ContactShadows } from '@react-three/drei'
import { useAppStore } from '@/state/store'

/**
 * Grounds the product. Uses a contact shadow rather than a real shadow map: it
 * is far cheaper, reads better for a small object on a plinth, and — importantly
 * for transparent PNG export — composites correctly over an empty background.
 *
 * The shadow is baked to a texture, not recomputed per frame, so it has to be
 * told when to re-bake. Without that it renders once on mount and then never
 * again, leaving a stale shadow under a device the user has since turned,
 * lifted or swapped.
 */
export function ContactShadow() {
  const shadow = useAppStore((state) => state.scene.shadow)
  const pedestal = useAppStore((state) => state.scene.pedestal)
  const device = useAppStore((state) => state.device)
  const animation = useAppStore((state) => state.animation)

  if (!shadow.enabled) return null

  // Rest the shadow on the pedestal top when there is one, otherwise on the floor.
  const y = pedestal.enabled && pedestal.shape !== 'none' ? 0.001 : 0

  // While a clip is playing the product moves every frame, so a single bake
  // would be wrong immediately; render continuously instead. When it is still,
  // re-bake only when something that casts the shadow actually changes.
  const moving = animation.clip !== 'none' && animation.playing
  const bakeKey = [
    device.specId,
    device.rotation.join(','),
    device.levitate,
    device.landscape,
    pedestal.radius,
    shadow.scale,
    shadow.blur,
  ].join('|')

  return (
    <ContactShadows
      key={moving ? 'continuous' : bakeKey}
      position={[0, y, 0]}
      opacity={shadow.opacity}
      blur={shadow.blur}
      far={shadow.far}
      scale={shadow.scale}
      resolution={1024}
      frames={moving ? Infinity : 1}
    />
  )
}
