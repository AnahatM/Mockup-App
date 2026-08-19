import { degToRad } from '@/lib/math/number'
import { frameDevice, type DeviceSpec } from '@/features/devices'
import type { CameraConfig } from './schema'

/**
 * Camera angles, defined as spherical offsets rather than absolute positions.
 *
 * `distance` multiplies whatever distance fits the current device, so the same
 * preset frames a watch and a laptop correctly instead of needing per-device
 * numbers. Presets are plain data, so they serialise into a saved mockup.
 */
export interface CameraPreset {
  id: string
  label: string
  /** Degrees around the device. 0 is dead-on front, positive turns right. */
  azimuth: number
  /** Degrees above the horizon. */
  elevation: number
  /** Multiplier on the auto-fitted distance. */
  distance: number
  fov: number
  /** Raises or lowers the look-at point, as a fraction of device height. */
  targetLift?: number
}

export const CAMERA_PRESETS: readonly CameraPreset[] = [
  { id: 'front', label: 'Front', azimuth: 0, elevation: 0, distance: 1, fov: 28 },
  { id: 'hero', label: 'Hero', azimuth: 22, elevation: 12, distance: 1, fov: 30 },
  {
    id: 'three-quarter',
    label: 'Three-quarter',
    azimuth: 38,
    elevation: 18,
    distance: 1.05,
    fov: 32,
  },
  {
    id: 'low-hero',
    label: 'Low hero',
    azimuth: 18,
    elevation: -12,
    distance: 0.95,
    fov: 34,
    targetLift: 0.1,
  },
  {
    id: 'top-down',
    label: 'Top down',
    azimuth: 0,
    elevation: 72,
    distance: 1.1,
    fov: 30,
  },
  {
    id: 'floating',
    label: 'Floating',
    azimuth: -28,
    elevation: 26,
    distance: 1.15,
    fov: 26,
  },
  { id: 'dutch', label: 'Dutch', azimuth: 46, elevation: 8, distance: 1, fov: 36 },
  {
    id: 'macro',
    label: 'Macro detail',
    azimuth: 62,
    elevation: 6,
    distance: 0.42,
    fov: 22,
    targetLift: 0.18,
  },
  {
    id: 'profile',
    label: 'Profile',
    azimuth: 88,
    elevation: 4,
    distance: 0.9,
    fov: 26,
  },
]

export function findCameraPreset(id: string): CameraPreset | undefined {
  return CAMERA_PRESETS.find((preset) => preset.id === id)
}

/** Resolves a preset against a device into concrete camera values. */
export function applyCameraPreset(
  preset: CameraPreset,
  spec: DeviceSpec,
): Pick<CameraConfig, 'position' | 'target' | 'fov' | 'preset'> {
  const framing = frameDevice(spec, preset.fov)
  const distance = framing.distance * preset.distance

  const azimuth = degToRad(preset.azimuth)
  const elevation = degToRad(preset.elevation)
  const centreY = framing.target[1]
  const targetY = centreY + (preset.targetLift ?? 0) * centreY * 2

  return {
    preset: preset.id,
    target: [0, targetY, 0],
    position: [
      distance * Math.cos(elevation) * Math.sin(azimuth),
      targetY + distance * Math.sin(elevation),
      distance * Math.cos(elevation) * Math.cos(azimuth),
    ],
    fov: preset.fov,
  }
}
