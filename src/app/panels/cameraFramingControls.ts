import { choice, slider, toggle, vec3 } from '@/ui/controls'
import type { Control } from '@/ui/controls'
import { CAMERA_PRESETS, applyCameraPreset, findCameraPreset } from '@/features/camera'
import { resolveDevice } from '@/features/devices'
import type { AppState } from '@/state/types'

/** Angle preset, field of view, look-at point and auto-rotation. */
const PRESET_OPTIONS = [
  ...CAMERA_PRESETS.map((preset) => ({ value: preset.id, label: preset.label })),
  { value: 'custom', label: 'Custom' },
]

export const framingControls: readonly Control<AppState>[] = [
  choice({
    label: 'Angle',
    hint: 'Presets are spherical offsets, so they fit any device size.',
    options: PRESET_OPTIONS,
    select: (s) => s.camera.preset,
    update: (d, v) => {
      const preset = findCameraPreset(v)
      if (!preset) return
      Object.assign(d.camera, applyCameraPreset(preset, resolveDevice(d.device.specId)))
    },
  }),
  slider({
    label: 'Field of view',
    hint: 'Lower is more telephoto and flattens perspective.',
    min: 8,
    max: 90,
    step: 1,
    unit: '°',
    select: (s) => s.camera.fov,
    update: (d, v) => {
      d.camera.fov = v
    },
  }),
  vec3({
    label: 'Look at',
    min: -6,
    max: 6,
    step: 0.05,
    select: (s) => s.camera.target,
    update: (d, v) => {
      d.camera.target = [v[0], v[1], v[2]]
    },
  }),
  toggle({
    label: 'Auto rotate',
    select: (s) => s.camera.autoRotate,
    update: (d, v) => {
      d.camera.autoRotate = v
    },
  }),
  slider({
    label: 'Rotate speed',
    min: -8,
    max: 8,
    step: 0.1,
    disabled: (s) => !s.camera.autoRotate,
    select: (s) => s.camera.autoRotateSpeed,
    update: (d, v) => {
      d.camera.autoRotateSpeed = v
    },
  }),
]
