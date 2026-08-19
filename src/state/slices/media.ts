import {
  defaultScreen,
  findBrandTarget,
  type MediaSource,
  type ScreenConfig,
} from '@/features/media'
import type { SliceCreator } from '../types'

export interface MediaState {
  source: MediaSource
  /** Set when the last load failed, for the dropzone to show. */
  error: string | null
  loading: boolean
}

export interface MediaSlice {
  media: MediaState
  screen: ScreenConfig
  setMediaSource: (source: MediaSource) => void
  setMediaError: (error: string | null) => void
  setMediaLoading: (loading: boolean) => void
  clearMedia: () => void
  /** Applies an extracted brand colour to a named part of the scene. */
  applyBrandColor: (hex: string, targetId: string) => void
  resetScreen: () => void
}

/**
 * Revoking the previous object URL is what stops the browser holding on to every
 * file the user has tried this session.
 */
function revoke(source: MediaSource): void {
  if (source.kind !== 'none') URL.revokeObjectURL(source.url)
}

export const createMediaSlice: SliceCreator<MediaSlice> = (set, get) => ({
  media: { source: { kind: 'none' }, error: null, loading: false },
  screen: defaultScreen(),

  setMediaSource: (source) => {
    revoke(get().media.source)
    set((draft) => {
      draft.media.source = source
      draft.media.error = null
      draft.media.loading = false
    })
  },

  setMediaError: (error) =>
    set((draft) => {
      draft.media.error = error
      draft.media.loading = false
    }),

  setMediaLoading: (loading) =>
    set((draft) => {
      draft.media.loading = loading
      if (loading) draft.media.error = null
    }),

  clearMedia: () => {
    revoke(get().media.source)
    set((draft) => {
      draft.media.source = { kind: 'none' }
      draft.media.error = null
    })
  },

  applyBrandColor: (hex, targetId) =>
    set((draft) => {
      findBrandTarget(targetId)?.apply(draft, hex)
    }),

  resetScreen: () =>
    set((draft) => {
      draft.screen = defaultScreen()
    }),
})
