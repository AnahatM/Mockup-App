import { defaultOverlays, type OverlaysConfig } from '@/features/screen'
import type { SliceCreator } from '../types'

export interface OverlaysSlice {
  overlays: OverlaysConfig
  resetOverlays: () => void
}

export const createOverlaysSlice: SliceCreator<OverlaysSlice> = (set) => ({
  overlays: defaultOverlays(),
  resetOverlays: () =>
    set((draft) => {
      draft.overlays = defaultOverlays()
    }),
})
