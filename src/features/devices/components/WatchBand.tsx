import { useMemo } from 'react'
import { buildBand } from '../builders/band'
import { FinishMaterial } from '../materials/FinishMaterial'
import type { BandSpec, DeviceSpec } from '../spec/types'

export interface WatchBandProps {
  spec: DeviceSpec
  band: BandSpec
}

/** Two straps sweeping away from the case, above and below. */
export function WatchBand({ spec, band }: WatchBandProps) {
  const upper = useMemo(() => buildBand(spec.body, band, 1), [spec.body, band])
  const lower = useMemo(() => buildBand(spec.body, band, -1), [spec.body, band])
  const finish = band.material ?? 'soft-plastic'
  const color = spec.colorways[0]?.body ?? '#2a2b2f'

  return (
    <>
      <mesh geometry={upper} castShadow>
        <FinishMaterial finish={finish} color={color} />
      </mesh>
      <mesh geometry={lower} castShadow>
        <FinishMaterial finish={finish} color={color} />
      </mesh>
    </>
  )
}
