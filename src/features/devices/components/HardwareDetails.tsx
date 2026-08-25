import { EdgeDetails } from './EdgeDetails'
import { FoldCrease } from './FoldCrease'
import { MagSafeRing } from './MagSafeRing'
import type { DeviceConfig } from '../schema'
import type { DeviceSpec } from '../spec/types'

export interface HardwareDetailsProps {
  spec: DeviceSpec
  config: DeviceConfig
  /** Front face of the screen, so overlays sit just above it. */
  frontZ: number
}

/**
 * The small hardware a device is not a rounded box without: rail cutouts, the
 * fold line on a foldable, the magnet ring under the back glass.
 *
 * Grouped into one component because each is three lines of JSX guarded by a
 * spec field, and inlining all three pushed `ProceduralDevice` past the
 * function-length limit — which is the limit doing its job: that component's
 * work is composition, and this is a different piece of composition.
 *
 * Each follows the same rule as the rest of the catalogue: present only when
 * the spec says so, and never invented for a device that does not have one.
 */
export function HardwareDetails({ spec, config, frontZ }: HardwareDetailsProps) {
  return (
    <>
      {/* Ports and grilles are part of the rails, so they follow the same
          toggle the side buttons do. */}
      {config.showButtons && <EdgeDetails spec={spec} frameColor={config.frameColor} />}

      {spec.crease && <FoldCrease spec={spec} crease={spec.crease} z={frontZ + 0.06} />}

      {config.showCameraBump && spec.magsafe && (
        <MagSafeRing
          spec={spec}
          magsafe={spec.magsafe}
          z={-(spec.body.depth / 2) - 0.05}
          bodyColor={config.bodyColor}
        />
      )}
    </>
  )
}
