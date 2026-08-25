import { androidFlagship } from '../catalog/android-flagship'
import { flipClosed } from '../catalog/flip-closed'
import { flipOpen } from '../catalog/flip-open'
import { foldOpen } from '../catalog/fold-open'
import { imacStyle } from '../catalog/imac-style'
import { iphoneNotch } from '../catalog/iphone-notch'
import { iphonePro } from '../catalog/iphone-pro'
import { laptopGeneric } from '../catalog/laptop-generic'
import { macbookAir } from '../catalog/macbook-air'
import { macbookPro } from '../catalog/macbook-pro'
import { monitor27 } from '../catalog/monitor-27'
import { tabletMini } from '../catalog/tablet-mini'
import { tabletPro } from '../catalog/tablet-pro'
import { watchRound } from '../catalog/watch-round'
import { watchSquare } from '../catalog/watch-square'
import type { Colorway, DeviceSpec } from './types'
import { buildImportedDeviceSpec, type ImportedGlbSource } from '../glb/spec'

/**
 * The device catalogue.
 *
 * Adding a device is: write a spec file, add it here. Nothing else in the app
 * needs to change — the rail, the picker, the camera framing and the pedestal
 * all read from this. Order determines the order in the device rail.
 */
export const DEVICES: readonly DeviceSpec[] = [
  iphonePro,
  iphoneNotch,
  androidFlagship,
  flipOpen,
  flipClosed,
  foldOpen,
  tabletPro,
  tabletMini,
  macbookPro,
  macbookAir,
  laptopGeneric,
  imacStyle,
  monitor27,
  watchSquare,
  watchRound,
]

const BY_ID = new Map(DEVICES.map((device) => [device.id, device]))

export function findDevice(id: string): DeviceSpec | undefined {
  return BY_ID.get(id)
}

/** Falls back to the first device so an unknown id from an old preset still renders. */
export function resolveDevice(id: string): DeviceSpec {
  const found = BY_ID.get(id)
  if (found) return found
  const fallback = DEVICES[0]
  if (!fallback) throw new Error('DEVICES must not be empty')
  return fallback
}

export function findColorway(spec: DeviceSpec, id: string): Colorway | undefined {
  return spec.colorways.find((colorway) => colorway.id === id)
}

/** Groups the catalogue for the device rail, preserving catalogue order. */
export function devicesByCategory(): ReadonlyMap<string, readonly DeviceSpec[]> {
  const groups = new Map<string, DeviceSpec[]>()
  for (const device of DEVICES) {
    const bucket = groups.get(device.category)
    if (bucket) bucket.push(device)
    else groups.set(device.category, [device])
  }
  return groups
}

/**
 * The spec for whatever device is currently in the scene.
 *
 * An imported model bypasses the catalogue — its "spec" is synthesised from
 * the model's own bounding box — so every caller that needs the active device
 * has to make the same choice. Doing it here means the scene, the camera and
 * the backdrop cannot drift apart on which device they think is standing
 * there, which is exactly the kind of disagreement that puts a block field
 * through a phone.
 */
export function activeDeviceSpec(config: {
  specId: string
  glb: ImportedGlbSource | null
}): DeviceSpec {
  return config.glb ? buildImportedDeviceSpec(config.glb) : resolveDevice(config.specId)
}
