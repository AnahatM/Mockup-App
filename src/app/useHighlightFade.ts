import { useEffect } from 'react'
import { useAppStore } from '@/state/store'

/** How long a searched-for control stays flagged. */
const FADE_MS = 2400

/**
 * The highlight, cleared automatically after a moment.
 *
 * Self-expiring rather than cleared on the next interaction: the flag exists to
 * catch the eye once, and a marker that lingers until you happen to click
 * something reads as a selection rather than as a hint.
 */
export function useHighlightFade(): string | null {
  const highlight = useAppStore((state) => state.ui.highlight)
  const clear = useAppStore((state) => state.clearHighlight)

  useEffect(() => {
    if (!highlight) return
    const timer = setTimeout(clear, FADE_MS)
    return () => clearTimeout(timer)
  }, [clear, highlight])

  return highlight
}
