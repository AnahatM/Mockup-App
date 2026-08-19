import { useMemo } from 'react'
import type { Texture } from 'three'
import { degToRad } from '@/lib/math/number'
import { buildBody } from '../builders/body'
import { FinishMaterial } from '../materials/FinishMaterial'
import { DeviceScreen } from './DeviceScreen'
import { LaptopBase } from './LaptopBase'
import { ScreenCutout } from './ScreenCutout'
import type { DeviceConfig } from '../schema'
import type { DeviceSpec, HingeSpec } from '../spec/types'

export interface LaptopDeviceProps {
  spec: DeviceSpec
  hinge: HingeSpec
  config: DeviceConfig
  screenTexture: Texture | null
  mediaAspect: number
}

/**
 * A hinged clamshell.
 *
 * Lid rotation is `90 - openAngle` degrees, so 0 is closed, 90 is upright and
 * anything beyond leans back — which matches how people describe a laptop angle.
 */
export function LaptopDevice({
  spec,
  hinge,
  config,
  screenTexture,
  mediaAspect,
}: LaptopDeviceProps) {
  const lid = spec.body
  const lidGeometry = useMemo(() => buildBody(lid), [lid])
  const frontZ = lid.depth / 2 + 0.02

  return (
    <group>
      <LaptopBase spec={spec} hinge={hinge} config={config} />

      {/* Lid: pivots about the hinge line at the base's back edge. */}
      <group
        position={[0, hinge.base.depth, -hinge.base.height / 2]}
        rotation={[degToRad(90 - hinge.defaultAngle), 0, 0]}
      >
        <group position={[0, lid.height / 2, -lid.depth / 2]}>
          <mesh geometry={lidGeometry} castShadow receiveShadow>
            <FinishMaterial
              attach="material-0"
              finish={spec.materials.back}
              color={config.bodyColor}
            />
            <FinishMaterial
              attach="material-1"
              finish={config.showRails ? spec.materials.frame : spec.materials.back}
              color={config.showRails ? config.frameColor : config.bodyColor}
            />
          </mesh>

          <DeviceScreen
            spec={spec}
            z={frontZ}
            texture={screenTexture}
            mediaAspect={mediaAspect}
            brightness={config.screenBrightness}
            screenFinish={config.screenFinish}
          />

          {config.showCutout && (
            <ScreenCutout spec={spec} cutout={spec.cutout} z={frontZ + 0.04} />
          )}
        </group>
      </group>
    </group>
  )
}
