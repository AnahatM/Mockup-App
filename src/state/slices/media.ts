import {
  defaultScreen,
  findBrandTarget,
  moveToFront,
  upsertRecent,
  RECENTS_CAP,
  type MediaSource,
  type RecentUpload,
  type ScreenConfig,
} from '@/features/media/state'
// Deep import, not the `@/features/crop` barrel: the barrel re-exports the
// crop UI, which reaches into `@/features/devices` and `@/state/store` and
// would cycle straight back to this file. `<feature>/schema` is the one deep
// path ESLint allows for exactly this reason (see eslint.config.js).
import { defaultCrop, type CropAspectPreset, type CropRect } from '@/features/crop/schema'
import type { Draft } from 'immer'
import type { SliceCreator } from '../types'

export interface MediaState {
  source: MediaSource
  /**
   * The pristine, un-cropped decode of the current upload. `setCropRect`
   * always bakes from this — never from an already-cropped `source` — so
   * repeated crop adjustments never compound quality loss, and resetting the
   * crop is exact rather than "close to the original". See
   * `features/crop/bake.ts` for why cropping produces a new source at all.
   */
  original: MediaSource
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
  /**
   * Records an already-clamped crop rect in config and, unless the caller
   * passes an already-baked replacement, restores the pristine source —
   * `features/crop/useCropCommit.ts` is the only intended caller, and does
   * both the clamping (via `features/crop/geometry.ts`) and the baking (via
   * `features/crop/bake.ts`) before reaching this action. This action trusts
   * that work rather than repeating it, so this file never has to import the
   * crop feature's geometry — see the import comment above.
   */
  setCropRect: (rect: CropRect, source?: MediaSource) => void
  /** Which aspect preset is active, for the crop tool's own UI state. */
  setCropAspectPreset: (preset: CropAspectPreset) => void
  /** Discards any crop and restores the pristine upload. */
  resetCrop: () => void
}

type MediaDraft = Draft<Pick<MediaSlice, 'media' | 'screen'>>

/**
 * Shared by `setMediaSource` and `selectRecentUpload`: both mean "the user
 * is now looking at a different, uncropped image", so both reset `original`
 * and the crop config the same way.
 */
function loadFreshSource(draft: MediaDraft, source: MediaSource): void {
  draft.media.source = source
  draft.media.original = source
  draft.screen.crop = defaultCrop()
  draft.media.error = null
  draft.media.loading = false
}

function sourceFromRecent(entry: RecentUpload): MediaSource {
  return {
    kind: entry.kind,
    url: entry.url,
    name: entry.name,
    width: entry.width,
    height: entry.height,
    palette: [...entry.palette],
  }
}

export const createMediaSlice: SliceCreator<MediaSlice> = (set, get) => ({
  media: {
    source: { kind: 'none' },
    original: { kind: 'none' },
    error: null,
    loading: false,
  },
  screen: defaultScreen(),
  recentUploads: [],

  // A brand-new upload starts uncropped: the last upload's crop rect would
  // apply to the wrong image if it survived the swap.
  setMediaSource: (source) => set((draft) => loadFreshSource(draft, source)),

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
      draft.media.original = { kind: 'none' }
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

  // Recent uploads are always the pristine decode (see `addRecentUpload` and
  // `bake.ts`'s comment on why a crop never lands in this list), so switching
  // back to one resets any crop the same way a new upload would.
  selectRecentUpload: (id) => {
    const found = get().recentUploads.find((entry) => entry.id === id)
    if (!found) return
    set((draft) => {
      loadFreshSource(draft, sourceFromRecent(found))
      draft.recentUploads = moveToFront(draft.recentUploads, id)
    })
  },

  setCropRect: (rect, source) =>
    set((draft) => {
      draft.screen.crop.rect = rect
      draft.media.source = source ?? draft.media.original
    }),

  setCropAspectPreset: (preset) =>
    set((draft) => {
      draft.screen.crop.aspectPreset = preset
    }),

  resetCrop: () =>
    set((draft) => {
      draft.screen.crop = defaultCrop()
      draft.media.source = draft.media.original
    }),
})
