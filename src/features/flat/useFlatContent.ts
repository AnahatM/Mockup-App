import { useEffect, useState } from 'react'
import type { MediaSource } from '@/features/media/schema'

export interface FlatContent {
  content: HTMLImageElement | null
}

interface Loaded {
  url: string
  image: HTMLImageElement
}

/**
 * Decodes a `MediaSource` into an `<img>` element for the 2D compositor.
 *
 * Deliberately independent of the store — it takes whatever `MediaSource` it
 * is given — so `FlatPreview` stays a plain, prop-driven component rather
 * than assuming there is one global upload slot to read from.
 *
 * Only handles the still-image case, matching `exportFlatWindow`'s own
 * loader: the flat window mockup has never rendered video content, so the
 * preview does not pretend to either — that would make it lie about what the
 * export produces.
 */
export function useFlatContent(source: MediaSource): FlatContent {
  const [loaded, setLoaded] = useState<Loaded | null>(null)
  const url = source.kind === 'none' ? null : source.url

  useEffect(() => {
    if (!url) return undefined

    let cancelled = false
    const image = new Image()
    image.onload = () => {
      if (!cancelled) setLoaded({ url, image })
    }
    image.onerror = () => {
      if (!cancelled) setLoaded(null)
    }
    image.src = url

    return () => {
      cancelled = true
    }
  }, [url])

  // Derived rather than reset via a second effect: the moment `url` changes
  // or disappears, stale content stops being returned immediately, without
  // waiting a tick for an effect to clear it.
  const content = loaded && loaded.url === url ? loaded.image : null
  return { content }
}
