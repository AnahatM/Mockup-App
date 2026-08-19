import { defaultScene, type SceneConfig } from '@/features/scene'
import type { SliceCreator } from '../types'

export interface SceneSlice {
  scene: SceneConfig
  resetScene: () => void
}

export const createSceneSlice: SliceCreator<SceneSlice> = (set) => ({
  scene: defaultScene(),
  resetScene: () =>
    set((draft) => {
      draft.scene = defaultScene()
    }),
})
