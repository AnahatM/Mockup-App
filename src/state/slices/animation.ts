import { defaultAnimation, type AnimationConfig } from '@/features/animation'
import type { SliceCreator } from '../types'

export interface AnimationSlice {
  animation: AnimationConfig
  resetAnimation: () => void
}

export const createAnimationSlice: SliceCreator<AnimationSlice> = (set) => ({
  animation: defaultAnimation(),
  resetAnimation: () =>
    set((draft) => {
      draft.animation = defaultAnimation()
    }),
})
