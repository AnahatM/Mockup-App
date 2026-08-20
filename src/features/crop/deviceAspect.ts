import type { DeviceSpec } from '@/features/devices'
import type { CropAspectPreset } from './schema'

/**
 * The selected device's real screen aspect ratio, derived from its own data
 * rather than hardcoded per device.
 *
 * `DeviceSpec.screenAspect` (see `features/devices/spec/types.ts`) is authored
 * per catalogue entry as the conventional "long side / short side" number a
 * spec sheet quotes — 19.5/9 for a tall phone, 16/9 for a landscape laptop —
 * which is why a portrait device's value needs inverting to become the plain
 * width/height ratio `fitMedia`/`mediaAspect` use everywhere else in the app.
 * Where a spec omits it, this falls back to computing it from the body and
 * screen bezel, mirroring `features/devices/builders/screen.ts#screenLayout`.
 */
export function deviceScreenAspect(spec: DeviceSpec): number {
  const authored = spec.screenAspect
  if (authored && authored > 0) {
    const portrait = spec.body.height >= spec.body.width
    return portrait ? 1 / authored : authored
  }

  const bottom = spec.screen.insetBottom ?? spec.screen.inset
  const width = spec.body.width - spec.screen.inset * 2
  const height = spec.body.height - spec.screen.inset - bottom
  return width > 0 && height > 0 ? width / height : 1
}

export interface CropAspectOption {
  id: CropAspectPreset
  label: string
  /** Target pixel aspect ratio; `null` means no constraint (free-form). */
  ratio: number | null
}

/**
 * The preset list shown in the crop tool. `device` is resolved from the live
 * spec rather than a stored number, so the option ratio in the label and the
 * option ratio actually applied can never drift apart.
 */
export function cropAspectOptions(spec: DeviceSpec): readonly CropAspectOption[] {
  return [
    { id: 'free', label: 'Free', ratio: null },
    { id: 'device', label: 'Device', ratio: deviceScreenAspect(spec) },
    { id: '16:9', label: '16:9', ratio: 16 / 9 },
    { id: '4:3', label: '4:3', ratio: 4 / 3 },
    { id: '1:1', label: '1:1', ratio: 1 },
    { id: '9:16', label: '9:16', ratio: 9 / 16 },
  ]
}
