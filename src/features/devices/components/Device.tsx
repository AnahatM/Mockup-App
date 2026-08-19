import { useFramedTexture } from '@/features/flat'
import { mediaAspect, useScreenTexture } from '@/features/media'
import { useAppStore } from '@/state/store'
import { MM_TO_UNITS } from '../spec/types'
import { resolveDevice } from '../spec/registry'
import { ProceduralDevice } from './ProceduralDevice'

/**
 * Places the selected device in the scene.
 *
 * Specs are written in millimetres, so the whole device is scaled once here
 * rather than every builder converting units.
 */
export function Device() {
  const config = useAppStore((state) => state.device)
  const source = useAppStore((state) => state.media.source)
  const spec = resolveDevice(config.specId)
  const media = useScreenTexture()

  // When a window frame is active the screen shows the composed window rather
  // than the bare screenshot — which is how a laptop ends up displaying a
  // browser window containing the user's site.
  const framed = useFramedTexture(media, mediaAspect(source))
  const texture = framed.texture ?? media
  const screenAspect = framed.texture ? framed.aspect : mediaAspect(source)

  // A clamshell already places its own base on the pedestal; a slab device is
  // modelled centred on its body, so it needs lifting by half its height.
  const restingHeight = spec.hinge ? 0 : (spec.body.height / 2) * MM_TO_UNITS

  return (
    <group
      position={[0, restingHeight + config.levitate, 0]}
      rotation={[
        config.rotation[0],
        config.rotation[1],
        config.rotation[2] + (config.landscape ? Math.PI / 2 : 0),
      ]}
      scale={MM_TO_UNITS}
    >
      <ProceduralDevice
        spec={spec}
        config={config}
        screenTexture={texture}
        mediaAspect={screenAspect}
      />
    </group>
  )
}
