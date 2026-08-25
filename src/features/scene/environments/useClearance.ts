import { useMemo } from 'react'
import {
  activeDeviceSpec,
  clearanceRadiusFor,
  frameDevice,
  productHeightFor,
} from '@/features/devices/state'
import { useAppStore } from '@/state/store'

export interface ProductBounds {
  /** Radius of the floor a structure has to keep flat, in scene units. */
  clear: number
  /** How high a structure may build before it is towering over the product. */
  ceiling: number
  /**
   * Half-width the built room must reach before it stops being a room.
   *
   * Every tile in it is a single-sided plane facing inward, so a camera
   * outside is meant to see straight through — that is what stops the walls
   * occluding the product when someone zooms out (see `room.ts`). But a room
   * whose walls are closer than the camera is *always* being viewed from
   * outside, and it does not read as a small room. It reads as debris: the
   * near walls vanish, the far ones show their insides at a raking angle, and
   * the floor is a postage stamp under the device.
   *
   * So the room reaches at least far enough to contain the camera that frames
   * this device. Below that the Size slider saturates, the same bargain
   * `fitPitch` and `cappedPitch` already make at the other end of their
   * ranges.
   */
  roomExtent: number
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
/** Headroom past the framing distance, so the walls are behind the camera
 *  rather than exactly on it. */
const ROOM_MARGIN = 1.25

export function useProductBounds(): ProductBounds {
  const specId = useAppStore((state) => state.device.specId)
  const glb = useAppStore((state) => state.device.glb)
  const fov = useAppStore((state) => state.camera.fov)
  const pedestal = useAppStore((state) => state.scene.pedestal)

  const spec = useMemo(() => activeDeviceSpec({ specId, glb }), [specId, glb])
  const plinth = pedestal.enabled && pedestal.shape !== 'none' ? pedestal.radius : 0

  return useMemo(
    () => ({
      clear: Math.max(clearanceRadiusFor(spec), plinth),
      ceiling: productHeightFor(spec),
      roomExtent: frameDevice(spec, fov).distance * ROOM_MARGIN,
    }),
    [spec, plinth, fov],
  )
}
