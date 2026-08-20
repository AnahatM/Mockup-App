import { useCallback, useRef } from 'react'
import { useAppStore } from '@/state/store'
import { bakeCrop } from './bake'
import { clampCropRect, isIdentityCrop } from './geometry'
import type { CropRect } from './schema'

/**
 * Commits a crop rect: clamps it, records it in config straight away (so the
 * UI and any saved preset reflect it immediately), and — unless it is the
 * identity crop — re-bakes the display texture asynchronously.
 *
 * A request token guards against an in-flight bake from an earlier commit
 * landing after a later one and overwriting it: only the bake started by the
 * most recent call is ever applied. This matters because `bakeCrop` reloads
 * and redraws the image, which is fast but not instant, and a user can
 * commit again (another drag, another preset) before the first finishes.
 */
export function useCropCommit(): (rect: CropRect) => void {
  const setCropRect = useAppStore((state) => state.setCropRect)
  const token = useRef(0)

  return useCallback(
    (rect: CropRect) => {
      const clamped = clampCropRect(rect)
      const requestId = ++token.current
      const original = useAppStore.getState().media.original

      if (original.kind !== 'image' || isIdentityCrop(clamped)) {
        setCropRect(clamped)
        return
      }

      // Record the rect immediately even though the bake is still pending,
      // so the aspect-preset buttons and any drag feedback stay in sync with
      // what the user just did — only `media.source` waits on the bake.
      setCropRect(clamped, undefined)
      void bakeCrop(original.url, original.width, original.height, clamped).then(
        (baked) => {
          if (token.current !== requestId) return
          setCropRect(clamped, {
            kind: 'image',
            url: baked.url,
            name: original.name,
            width: baked.width,
            height: baked.height,
            palette: original.palette,
          })
        },
      )
    },
    [setCropRect],
  )
}
