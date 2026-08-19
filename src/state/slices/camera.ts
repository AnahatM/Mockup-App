import {
  applyCameraPreset,
  defaultCamera,
  dolly,
  findCameraPreset,
  type CameraConfig,
  type CameraMode,
} from '@/features/camera'
import { frameDevice, resolveDevice } from '@/features/devices'
import type { SliceCreator } from '../types'

export interface CameraSlice {
  camera: CameraConfig
  /** Re-compose the shot around the current device — the editor "Home" key. */
  frameCurrentDevice: () => void
  selectCameraPreset: (presetId: string) => void
  resetCamera: () => void
  /** Below 1 zooms in, above 1 zooms out. Mirrors the scroll wheel. */
  dollyCamera: (factor: number) => void
  setCameraMode: (mode: CameraMode) => void
}

export const createCameraSlice: SliceCreator<CameraSlice> = (set) => ({
  camera: defaultCamera(),

  frameCurrentDevice: () =>
    set((draft) => {
      const spec = resolveDevice(draft.device.specId)
      const framing = frameDevice(spec, draft.camera.fov)
      draft.camera.target = framing.target
      draft.camera.position = framing.position
      draft.camera.preset = 'custom'
    }),

  /** Presets are spherical offsets, resolved against the current device's size. */
  selectCameraPreset: (presetId) =>
    set((draft) => {
      const preset = findCameraPreset(presetId)
      if (!preset) return
      const spec = resolveDevice(draft.device.specId)
      Object.assign(draft.camera, applyCameraPreset(preset, spec))
    }),

  resetCamera: () =>
    set((draft) => {
      draft.camera = defaultCamera()
    }),

  /*
   * Zoom is a store change, not a call into the controls instance, so the
   * toolbar buttons and the scroll wheel end up in the same place — and a zoom
   * level is captured by a preset like every other camera value.
   */
  dollyCamera: (factor) =>
    set((draft) => {
      draft.camera.position = dolly(
        draft.camera.position,
        draft.camera.target,
        factor,
        draft.camera.minDistance,
        draft.camera.maxDistance,
      )
      draft.camera.preset = 'custom'
    }),

  setCameraMode: (mode) =>
    set((draft) => {
      draft.camera.mode = mode
    }),
})
