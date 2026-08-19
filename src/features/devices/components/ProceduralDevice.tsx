import type { Texture } from 'three'
import { CameraBump } from './CameraBump'
import { DeviceBody } from './DeviceBody'
import { DeviceScreen } from './DeviceScreen'
import { DeviceStand } from './DeviceStand'
import { WatchBand } from './WatchBand'
import { LaptopDevice } from './LaptopDevice'
import { ScreenCutout } from './ScreenCutout'
import { SideButtons } from './SideButtons'
import type { DeviceConfig } from '../schema'
import type { DeviceSpec } from '../spec/types'

export interface ProceduralDeviceProps {
  spec: DeviceSpec
  config: DeviceConfig
  screenTexture: Texture | null
  mediaAspect: number
}

/**
 * Assembles a procedural device from its spec.
 *
 * Every part is independently toggleable, which is what makes "show the camera
 * bump but hide the buttons" a config change rather than a different model.
 */
export function ProceduralDevice({
  spec,
  config,
  screenTexture,
  mediaAspect,
}: ProceduralDeviceProps) {
  // Front face, with a hair of clearance so nothing z-fights with the shell.
  const frontZ = spec.body.depth / 2 + 0.02

  // Clamshells have a second body and a pivot, so they compose differently.
  if (spec.hinge) {
    return (
      <LaptopDevice
        spec={spec}
        hinge={spec.hinge}
        config={config}
        screenTexture={screenTexture}
        mediaAspect={mediaAspect}
      />
    )
  }

  return (
    <group>
      <DeviceBody
        spec={spec}
        bodyColor={config.bodyColor}
        frameColor={config.frameColor}
        showRails={config.showRails}
      />

      <DeviceScreen
        spec={spec}
        z={frontZ}
        texture={screenTexture}
        mediaAspect={mediaAspect}
        brightness={config.screenBrightness}
      />

      {config.showCutout && (
        <ScreenCutout spec={spec} cutout={spec.cutout} z={frontZ + 0.04} />
      )}

      {config.showButtons && <SideButtons spec={spec} frameColor={config.frameColor} />}

      {spec.stand && (
        <DeviceStand spec={spec} stand={spec.stand} frameColor={config.frameColor} />
      )}

      {spec.band && <WatchBand spec={spec} band={spec.band} />}

      {config.showCameraBump && spec.cameraBump && (
        <CameraBump
          spec={spec}
          bump={spec.cameraBump}
          bodyColor={config.bodyColor}
          frameColor={config.frameColor}
        />
      )}
    </group>
  )
}
