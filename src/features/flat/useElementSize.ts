import { useEffect, useRef, useState, type RefObject } from 'react'

export interface ElementSize {
  width: number
  height: number
}

/**
 * Tracks an element's content-box size via `ResizeObserver`.
 *
 * `FlatPreview` needs this to size its canvas to whatever box it is given —
 * a compact column in the studio sidebar, or a large one on the standalone
 * page — without either side having to pass pixel dimensions down as props.
 */
export function useElementSize<T extends Element>(): [RefObject<T | null>, ElementSize] {
  const ref = useRef<T | null>(null)
  const [size, setSize] = useState<ElementSize>({ width: 0, height: 0 })

  useEffect(() => {
    const node = ref.current
    if (!node) return undefined

    const observer = new ResizeObserver(([entry]) => {
      if (!entry) return
      const { width, height } = entry.contentRect
      setSize({ width, height })
    })
    observer.observe(node)
    return () => observer.disconnect()
  }, [])

  return [ref, size]
}
