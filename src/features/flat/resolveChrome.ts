import { mediaPalette, type MediaSource } from '@/features/media/schema'
import type { FlatConfig } from './schema'

export interface ResolvedChrome {
  /** Chrome colour to draw with: the screenshot's dominant colour when
   * "Match screenshot" is on and one is available, else the configured colour. */
  chrome: string
  /** Screenshot's dominant colour, independent of whether it is in use — the
   * "adaptive" shadow preset wants it even when colour-match is off. */
  dominant: string | null
}

/**
 * Resolves chrome colour once, the same way for every caller.
 *
 * This used to be three lines duplicated in `WindowPanel` and
 * `useFramedTexture`; now the preview, the export, and the on-device texture
 * all agree on which colour "Match screenshot" actually picks.
 */
export function resolveChrome(config: FlatConfig, source: MediaSource): ResolvedChrome {
  const dominant = mediaPalette(source)[0] ?? null
  const chrome = config.colorMatch && dominant ? dominant : config.chrome
  return { chrome, dominant }
}
