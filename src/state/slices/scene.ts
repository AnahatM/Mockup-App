import { defaultScene, type SceneConfig } from '@/features/scene/schema'
import { deriveBackdrops } from '@/features/scene/state'
import { mediaPalette } from '@/features/media/schema'
import type { SliceCreator } from '../types'

export interface SceneSlice {
  scene: SceneConfig
  resetScene: () => void
  /**
   * Applies one of the backdrops derived from the uploaded media's palette.
   *
   * Takes an id and re-derives, rather than taking a config: the recipes are a
   * pure function of the palette, so passing the id keeps the UI from being
   * able to apply a backdrop that no longer follows from the current upload.
   */
  applyAdaptiveBackdrop: (id: string) => void
}

export const createSceneSlice: SliceCreator<SceneSlice> = (set) => ({
  scene: defaultScene(),

  applyAdaptiveBackdrop: (id) =>
    set((draft) => {
      const chosen = deriveBackdrops(mediaPalette(draft.media.source)).find(
        (option) => option.id === id,
      )
      // Only the fields the recipe owns; the user's glow size and grid
      // settings are theirs, and resetting them would be a surprise.
      if (chosen) Object.assign(draft.scene.backdrop, chosen.config)
    }),
  resetScene: () =>
    set((draft) => {
      draft.scene = defaultScene()
    }),
})
