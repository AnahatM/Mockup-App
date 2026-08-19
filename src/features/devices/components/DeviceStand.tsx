import { useMemo } from 'react'
import { buildStand } from '../builders/stand'
import { FinishMaterial } from '../materials/FinishMaterial'
import type { DeviceSpec, StandSpec } from '../spec/types'

export interface DeviceStandProps {
  spec: DeviceSpec
  stand: StandSpec
  frameColor: string
}

/**
 * Neck and foot for a desktop display.
 *
 * Positioned in the device's own local frame, below the display, so the whole
 * assembly rotates together when the user turns the product.
 */
export function DeviceStand({ spec, stand, frameColor }: DeviceStandProps) {
  const parts = useMemo(() => buildStand(stand), [stand])

  // The display is centred on the origin, so the stand hangs below it.
  const displayBottom = -spec.body.height / 2

  return (
    <group>
      <mesh
        geometry={parts.neck}
        position={[0, displayBottom - stand.neckHeight / 2, -stand.neckDepth * 0.2]}
        castShadow
      >
        <FinishMaterial finish={spec.materials.frame} color={frameColor} />
      </mesh>

      <mesh
        geometry={parts.base}
        position={[
          0,
          displayBottom - stand.neckHeight - stand.baseHeight / 2,
          stand.baseDepth * 0.1,
        ]}
        castShadow
        receiveShadow
      >
        <FinishMaterial finish={spec.materials.frame} color={frameColor} />
      </mesh>
    </group>
  )
}
