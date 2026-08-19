import type { Texture } from 'three'
import { useAppStore } from '@/state/store'
import { MM_TO_UNITS } from '../spec/types'
import { resolveDevice } from '../spec/registry'
import { ProceduralDevice } from './ProceduralDevice'

export interface DeviceProps {
  /** The screen content. Supplied by the media pipeline from P4 onward. */
  screenTexture?: Texture | null
}

/**
 * Places the selected device in the scene.
 *
 * Specs are written in millimetres, so the whole device is scaled once here
 * rather than every builder converting units. It is also lifted so the device
 * rests on the pedestal surface at y = 0 instead of being centred on it.
 */
export function Device({ screenTexture = null }: DeviceProps) {
  const config = useAppStore((state) => state.device)
  const spec = resolveDevice(config.specId)

  // A clamshell already places its own base on the pedestal; a slab device is
  // modelled centred on its body, so it needs lifting by half its height.
  const restingHeight = spec.hinge ? 0 : (spec.body.height / 2) * MM_TO_UNITS
  const y = restingHeight + config.levitate

  return (
    <group
      position={[0, y, 0]}
      rotation={[
        config.rotation[0],
        config.rotation[1],
        config.rotation[2] + (config.landscape ? Math.PI / 2 : 0),
      ]}
      scale={MM_TO_UNITS}
    >
      <ProceduralDevice spec={spec} config={config} screenTexture={screenTexture} />
    </group>
  )
}
