import { defaultAnimation, type AnimationConfig } from '@/features/animation'
import type { SliceCreator } from '../types'

export interface AnimationSlice {
  animation: AnimationConfig
  /**
   * Bumped to restart the clip from the top.
   *
   * Deliberately outside `AnimationConfig`: that schema is what a saved preset
   * contains, and a restart counter is a transient UI signal, not part of a
   * look. Keeping it here means presets never carry a meaningless number.
   *
   * A counter rather than a time value because the clock lives in the render
   * loop — pushing a frame time through the store 60 times a second would put
   * React in the middle of the animation loop.
   */
  animationEpoch: number
  resetAnimation: () => void
  setAnimationPlaying: (playing: boolean) => void
  restartAnimation: () => void
}

export const createAnimationSlice: SliceCreator<AnimationSlice> = (set) => ({
  animation: defaultAnimation(),
  animationEpoch: 0,

  resetAnimation: () =>
    set((draft) => {
      draft.animation = defaultAnimation()
    }),

  setAnimationPlaying: (playing) =>
    set((draft) => {
      draft.animation.playing = playing
    }),

  restartAnimation: () =>
    set((draft) => {
      draft.animationEpoch += 1
      draft.animation.progress = 0
      draft.animation.playing = true
    }),
})
