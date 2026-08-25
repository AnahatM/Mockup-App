import { mix } from '@/lib/color/hex'
import type { BodySpec, FeetSpec } from '../spec/types'

export interface LaptopFeetProps {
  base: BodySpec
  feet: FeetSpec
  bodyColor: string
}

/**
 * The four rubber pads under a laptop's base.
 *
 * Without them the base sits flush on the desk, which is the one thing no
 * laptop does — and it shows: a flush base has no shadow gap under it, so it
 * reads as printed onto the floor rather than resting on it. They are only a
 * millimetre and a half tall and that is enough.
 *
 * Rendered in the base's own colour pushed towards black, so a silver laptop
 * gets grey pads and a space-black one gets darker ones, rather than every
 * machine getting the same charcoal.
 */
export function LaptopFeet({ base, feet, bodyColor }: LaptopFeetProps) {
  const x = base.width / 2 - feet.inset - feet.width / 2
  const y = base.height / 2 - feet.inset - feet.depth / 2

  // The base is drawn lying down and then rotated upright by its parent, so
  // "under the base" is -Z here, not -Y.
  const z = -(base.depth / 2 + feet.height / 2)
  const corners: [number, number][] = [
    [-x, -y],
    [x, -y],
    [-x, y],
    [x, y],
  ]

  return (
    <group>
      {corners.map(([cx, cy]) => (
        <mesh key={`${cx},${cy}`} position={[cx, cy, z]} castShadow>
          <boxGeometry args={[feet.width, feet.depth, feet.height]} />
          <meshStandardMaterial
            color={mix(bodyColor, '#000000', 0.62)}
            roughness={0.92}
            metalness={0}
          />
        </mesh>
      ))}
    </group>
  )
}
