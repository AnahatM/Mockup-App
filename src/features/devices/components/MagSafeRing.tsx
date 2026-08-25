import { mix } from '@/lib/color/hex'
import type { DeviceSpec, MagSafeSpec } from '../spec/types'

export interface MagSafeRingProps {
  spec: DeviceSpec
  magsafe: MagSafeSpec
  /** Back face of the body, so the ring sits just behind it. */
  z: number
  bodyColor: string
}

/**
 * The magnet ring under a phone's back glass.
 *
 * Barely there, which is the point — on real hardware it is a change in how the
 * glass scatters light over the magnets, not a part you can see the edge of. A
 * ring drawn with any real contrast looks like a sticker.
 *
 * Only visible from behind or at a raking angle, which is where a mockup shows
 * the back of a phone: the Profile camera preset, and any three-quarter shot of
 * a device turned around.
 */
export function MagSafeRing({ magsafe, z, bodyColor }: MagSafeRingProps) {
  return (
    <mesh position={[0, magsafe.y, z]} renderOrder={1}>
      <ringGeometry args={[magsafe.radius - magsafe.band, magsafe.radius, 48]} />
      <meshBasicMaterial
        color={mix(bodyColor, '#ffffff', 0.12)}
        transparent
        opacity={0.35}
        toneMapped={false}
      />
    </mesh>
  )
}
