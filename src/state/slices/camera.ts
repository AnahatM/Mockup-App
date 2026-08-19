import { defaultCamera, type CameraConfig } from '@/features/camera'
import { frameDevice, resolveDevice } from '@/features/devices'
import type { SliceCreator } from '../types'

export interface CameraSlice {
  camera: CameraConfig
  /** Re-compose the shot around the current device — the editor "Home" key. */
  frameCurrentDevice: () => void
  resetCamera: () => void
}

export const createCameraSlice: SliceCreator<CameraSlice> = (set) => ({
  camera: defaultCamera(),

  frameCurrentDevice: () =>
    set((draft) => {
      const spec = resolveDevice(draft.device.specId)
      const framing = frameDevice(spec, draft.camera.fov)
      draft.camera.target = framing.target
      draft.camera.position = framing.position
    }),

  resetCamera: () =>
    set((draft) => {
      draft.camera = defaultCamera()
    }),
})
