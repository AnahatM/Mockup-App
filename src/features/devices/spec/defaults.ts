import { deviceConfigSchema, type DeviceConfig } from './config'
import { DEVICES } from './registry'
import type { DeviceSpec } from './types'

/** Config for a device, seeded from its first colourway. */
export function configForDevice(spec: DeviceSpec): Partial<DeviceConfig> {
  const colorway = spec.colorways[0]
  if (!colorway) return { specId: spec.id }
  return {
    specId: spec.id,
    colorway: colorway.id,
    bodyColor: colorway.body,
    frameColor: colorway.frame ?? colorway.body,
  }
}

export function defaultDeviceConfig(): DeviceConfig {
  const first = DEVICES[0]
  if (!first) throw new Error('DEVICES must not be empty')
  return deviceConfigSchema.parse(configForDevice(first))
}
