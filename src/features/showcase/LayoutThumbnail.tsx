import { useEffect, useRef } from 'react'
import type { ShowcaseLayoutId } from './schema'
import { drawLayoutThumbnail } from './thumbnail'

export interface LayoutThumbnailProps {
  layout: ShowcaseLayoutId
  size?: number
}

const DEFAULT_SIZE = 96
/** Caps the backing-store resolution on very high-DPI screens. */
const DPR_CAP = 2

/** A live, procedurally-drawn diagram of one layout — see `thumbnail.ts`. */
export function LayoutThumbnail({ layout, size = DEFAULT_SIZE }: LayoutThumbnailProps) {
  const ref = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = ref.current
    if (!canvas) return
    const ratio = Math.min(window.devicePixelRatio || 1, DPR_CAP)
    canvas.width = size * ratio
    canvas.height = size * ratio
    drawLayoutThumbnail(canvas, layout)
  }, [layout, size])

  return (
    <canvas
      ref={ref}
      width={size}
      height={size}
      style={{ width: size, height: size }}
      aria-hidden="true"
    />
  )
}
