import { androidFlagship } from '../catalog/android-flagship'
import { iphonePro } from '../catalog/iphone-pro'
import { macbookPro } from '../catalog/macbook-pro'
import type { Colorway, DeviceSpec } from './types'

/**
 * The device catalogue.
 *
 * Adding a device is: write a spec file, add it here. Nothing else in the app
 * needs to change — the rail, the picker and the renderer all read from this.
 */
export const DEVICES: readonly DeviceSpec[] = [iphonePro, androidFlagship, macbookPro]

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

/** Groups the catalogue for the device rail. */
export function devicesByCategory(): ReadonlyMap<string, readonly DeviceSpec[]> {
  const groups = new Map<string, DeviceSpec[]>()
  for (const device of DEVICES) {
    const bucket = groups.get(device.category)
    if (bucket) bucket.push(device)
    else groups.set(device.category, [device])
  }
  return groups
}
