import { ContactShadows } from '@react-three/drei'
import { useAppStore } from '@/state/store'

/**
 * Grounds the product. Uses a contact shadow rather than a real shadow map: it
 * is far cheaper, reads better for a small object on a plinth, and — importantly
 * for transparent PNG export — composites correctly over an empty background.
 */
export function ContactShadow() {
  const shadow = useAppStore((state) => state.scene.shadow)
  const pedestal = useAppStore((state) => state.scene.pedestal)
  if (!shadow.enabled) return null

  // Rest the shadow on the pedestal top when there is one, otherwise on the floor.
  const y = pedestal.enabled && pedestal.shape !== 'none' ? 0.001 : 0

  return (
    <ContactShadows
      position={[0, y, 0]}
      opacity={shadow.opacity}
      blur={shadow.blur}
      far={shadow.far}
      scale={shadow.scale}
      resolution={1024}
      frames={1}
    />
  )
}
