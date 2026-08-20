import { defaultFlat, type FlatConfig } from '@/features/flat/schema'
import type { SliceCreator } from '../types'

export interface FlatSlice {
  flat: FlatConfig
  resetFlat: () => void
}

export const createFlatSlice: SliceCreator<FlatSlice> = (set) => ({
  flat: defaultFlat(),
  resetFlat: () =>
    set((draft) => {
      draft.flat = defaultFlat()
    }),
})
