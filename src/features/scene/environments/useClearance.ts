import { useMemo } from 'react'
import {
  activeDeviceSpec,
  clearanceRadiusFor,
  productHeightFor,
} from '@/features/devices/state'
import { useAppStore } from '@/state/store'

export interface ProductBounds {
  /** Radius of the floor a structure has to keep flat, in scene units. */
  clear: number
  /** How high a structure may build before it is towering over the product. */
  ceiling: number
}

/**
 * What the product standing in the middle of the scene costs the floor around
 * it, in scene units.
 *
 * Derived rather than configured, deliberately: it is not something a user
 * should have to think about, and a preset saved with a phone in the middle
 * has to stay correct when it is loaded with a monitor in the middle.
 *
 * The plinth counts as well as the device. It is a solid column, so tiles
 * inside its footprint are hidden anyway — but a *rising* block is not, and
 * one pushing up through the top of the pedestal is the same bug wearing a
 * different hat.
 */
export function useProductBounds(): ProductBounds {
  const specId = useAppStore((state) => state.device.specId)
  const glb = useAppStore((state) => state.device.glb)
  const pedestal = useAppStore((state) => state.scene.pedestal)

  const spec = useMemo(() => activeDeviceSpec({ specId, glb }), [specId, glb])
  const plinth = pedestal.enabled && pedestal.shape !== 'none' ? pedestal.radius : 0

  return useMemo(
    () => ({
      clear: Math.max(clearanceRadiusFor(spec), plinth),
      ceiling: productHeightFor(spec),
    }),
    [spec, plinth],
  )
}
