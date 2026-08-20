import { defaultShowcase, type ShowcaseConfig } from '@/features/showcase'
import type { SliceCreator } from '../types'

export interface ShowcaseSlice {
  showcase: ShowcaseConfig
  resetShowcase: () => void
}

export const createShowcaseSlice: SliceCreator<ShowcaseSlice> = (set) => ({
  showcase: defaultShowcase(),
  resetShowcase: () =>
    set((draft) => {
      draft.showcase = defaultShowcase()
    }),
})
