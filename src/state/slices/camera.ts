import { defaultCamera, type CameraConfig } from '@/features/camera'
import type { SliceCreator } from '../types'

export interface CameraSlice {
  camera: CameraConfig
  resetCamera: () => void
}

export const createCameraSlice: SliceCreator<CameraSlice> = (set) => ({
  camera: defaultCamera(),
  resetCamera: () =>
    set((draft) => {
      draft.camera = defaultCamera()
    }),
})
