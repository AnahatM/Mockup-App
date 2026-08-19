import {
  defaultScreen,
  findBrandTarget,
  moveToFront,
  upsertRecent,
  RECENTS_CAP,
  type MediaSource,
  type RecentUpload,
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
  /**
   * Last few uploads, most-recent first. Every non-empty `media.source` is
   * also, by construction, an entry here — see `addRecentUpload`. That
   * invariant is what lets object-URL ownership live entirely in this list:
   * nothing else ever revokes one (see the comment on `addRecentUpload`).
   */
  recentUploads: RecentUpload[]
  setMediaSource: (source: MediaSource) => void
  setMediaError: (error: string | null) => void
  setMediaLoading: (loading: boolean) => void
  clearMedia: () => void
  /** Applies an extracted brand colour to a named part of the scene. */
  applyBrandColor: (hex: string, targetId: string) => void
  resetScreen: () => void
  /** Records a freshly-decoded upload as the newest recent entry. */
  addRecentUpload: (entry: RecentUpload) => void
  /** Switches the current screen back to a remembered upload. */
  selectRecentUpload: (id: string) => void
}

export const createMediaSlice: SliceCreator<MediaSlice> = (set, get) => ({
  media: { source: { kind: 'none' }, error: null, loading: false },
  screen: defaultScreen(),
  recentUploads: [],

  setMediaSource: (source) =>
    set((draft) => {
      draft.media.source = source
      draft.media.error = null
      draft.media.loading = false
    }),

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

  clearMedia: () =>
    // Deliberately does not revoke the object URL: it is still owned by
    // `recentUploads` (see addRecentUpload), so "Remove" stays reversible by
    // clicking the thumbnail back in the recent-uploads row.
    set((draft) => {
      draft.media.source = { kind: 'none' }
      draft.media.error = null
    }),

  applyBrandColor: (hex, targetId) =>
    set((draft) => {
      findBrandTarget(targetId)?.apply(draft, hex)
    }),

  resetScreen: () =>
    set((draft) => {
      draft.screen = defaultScreen()
    }),

  /**
   * The recent-uploads list is the sole owner of every object URL that ever
   * becomes `media.source`: this is the only place a URL is revoked. An entry
   * is only ever dropped here — by dedupe (re-uploading the same file) or by
   * cap eviction (oldest beyond RECENTS_CAP) — so a URL is revoked exactly
   * once, and never while it could still be the active `media.source`.
   */
  addRecentUpload: (entry) => {
    const { next, evicted } = upsertRecent(get().recentUploads, entry, RECENTS_CAP)
    for (const dropped of evicted) URL.revokeObjectURL(dropped.url)
    set((draft) => {
      draft.recentUploads = next
    })
  },

  selectRecentUpload: (id) => {
    const found = get().recentUploads.find((entry) => entry.id === id)
    if (!found) return
    set((draft) => {
      draft.media.source = {
        kind: found.kind,
        url: found.url,
        name: found.name,
        width: found.width,
        height: found.height,
        palette: [...found.palette],
      }
      draft.media.error = null
      draft.media.loading = false
      draft.recentUploads = moveToFront(draft.recentUploads, id)
    })
  },
})
