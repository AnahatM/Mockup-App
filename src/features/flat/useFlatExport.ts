import { useState } from 'react'
import { mediaAspect, type MediaSource } from '@/features/media/schema'
import { useBusy } from '@/state/useBusy'
import { exportFlatWindow } from './exportFlat'
import { resolveChrome } from './resolveChrome'
import { useFlatContent } from './useFlatContent'
import type { FlatConfig } from './schema'

export interface FlatExport {
  busy: boolean
  error: string | null
  exportWindow: () => Promise<void>
}

/** Matches the resolution `WindowPanel`'s own export button has always used. */
const EXPORT_WIDTH = 2400

/**
 * Exports the current window mockup as a flat PNG.
 *
 * Shared by every mount point that offers an "Export window PNG" button —
 * the standalone 2D tool page uses it directly; the studio's `WindowPanel`
 * keeps its own long-standing handler untouched (see its file) so the
 * existing export path is provably unaffected by this feature's addition.
 * Both ultimately call the same `exportFlatWindow` / `composeWindow`.
 */
export function useFlatExport(
  config: FlatConfig,
  source: MediaSource,
  filename: string,
): FlatExport {
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const whileBusy = useBusy()
  const { content } = useFlatContent(source)
  const { chrome, dominant } = resolveChrome(config, source)

  const exportWindow = async () => {
    setBusy(true)
    setError(null)
    const result = await whileBusy(() =>
      exportFlatWindow({
        config,
        content,
        contentAspect: mediaAspect(source),
        chrome,
        dominant,
        width: EXPORT_WIDTH,
        filename: `${filename}-window`,
      }),
    )
    if (!result.ok) setError(result.error)
    setBusy(false)
  }

  return { busy, error, exportWindow }
}
