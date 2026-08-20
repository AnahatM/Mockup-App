import { useFramedTexture } from '@/features/flat'
import { mediaAspect, useScreenTexture } from '@/features/media'
import { useAppStore } from '@/state/store'
import { MM_TO_UNITS } from '../spec/types'
import { groundOffsetMm } from '../spec/framing'
import { resolveDevice } from '../spec/registry'
import { buildImportedDeviceSpec } from '../glb/spec'
import { GlbDevice } from './GlbDevice'
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
  // An import bypasses the catalogue entirely: its "spec" is synthesised from
  // the model's own bounding box rather than looked up. See glb/spec.ts.
  const spec = config.glb ? buildImportedDeviceSpec(config.glb) : resolveDevice(config.specId)
  const media = useScreenTexture()

  // When a window frame is active the screen shows the composed window rather
  // than the bare screenshot — which is how a laptop ends up displaying a
  // browser window containing the user's site.
  const framed = useFramedTexture(media, mediaAspect(source))
  const texture = framed.texture ?? media
  const screenAspect = framed.texture ? framed.aspect : mediaAspect(source)

  // A clamshell places its own base on the pedestal. Everything else is modelled
  // centred on its body, so it is lifted by however far the assembly reaches
  // below that centre — half the body, plus any stand or watch strap.
  const restingHeight = groundOffsetMm(spec) * MM_TO_UNITS

  // The mesh source on the resolved spec is the single switch between the two
  // render paths — see `DeviceMeshSource` in spec/types.ts. `config.glb` is
  // re-derived here (rather than trusted alone) only so TypeScript can narrow
  // it to non-null without a cast; the two are always in lockstep because
  // `spec` above is built from `config.glb` in the first place.
  const glbSource = spec.mesh.kind === 'glb' ? config.glb : null

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
      {glbSource ? (
        <GlbDevice
          source={glbSource}
          screenTexture={texture}
          brightness={config.screenBrightness}
        />
      ) : (
        <ProceduralDevice
          spec={spec}
          config={config}
          screenTexture={texture}
          mediaAspect={screenAspect}
        />
      )}
    </group>
  )
}
