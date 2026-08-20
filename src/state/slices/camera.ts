import {
  applyCameraPreset,
  defaultCamera,
  dolly,
  findCameraPreset,
  type CameraConfig,
  type CameraMode,
} from '@/features/camera/state'
import { frameDevice, resolveDevice } from '@/features/devices/state'
import type { Vec3Tuple } from '@/lib/schema/primitives'
import type { SliceCreator } from '../types'

export interface CameraSlice {
  camera: CameraConfig
  /** Re-compose the shot around the current device — the editor "Home" key. */
  frameCurrentDevice: () => void
  selectCameraPreset: (presetId: string) => void
  resetCamera: () => void
  /** Below 1 zooms in, above 1 zooms out. Mirrors the scroll wheel. */
  dollyCamera: (factor: number) => void
  /**
   * Commits wherever OrbitControls has left the live camera into the
   * authored one. Orbiting and panning are otherwise transient (see
   * `CameraRig`) — but that leaves the authored position stale, so a
   * `dollyCamera` right after an orbit dollies from before the orbit and
   * the view snaps back to it. Called once per drag, on `end`, not per
   * frame: that would defeat the point of orbiting being transient at all.
   */
  syncCameraView: (position: Vec3Tuple, target: Vec3Tuple) => void
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

  syncCameraView: (position, target) =>
    set((draft) => {
      draft.camera.position = position
      draft.camera.target = target
      draft.camera.preset = 'custom'
    }),

  setCameraMode: (mode) =>
    set((draft) => {
      draft.camera.mode = mode
    }),
})
