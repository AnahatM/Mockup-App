import { useRef } from 'react'
import { cx } from '@/lib/cx'
import { mediaAspect, type MediaSource } from '@/features/media/schema'
import { WINDOW_ASPECT } from './compose'
import { fitPreviewLayout } from './previewSize'
import { resolveChrome } from './resolveChrome'
import { useElementSize } from './useElementSize'
import { useFlatContent } from './useFlatContent'
import { useFlatPreviewCanvas } from './useFlatPreviewCanvas'
import type { FlatConfig } from './schema'
import styles from './FlatPreview.module.css'

export interface FlatPreviewProps {
  config: FlatConfig
  source: MediaSource
  className?: string | undefined
}

/**
 * Live 2D preview of the window mockup.
 *
 * Draws with the exact same `composeWindow` call the flat export uses, at a
 * capped preview resolution — see `previewSize.ts`. Pure canvas 2D: no
 * WebGL, no three.js, no assumption that a 3D scene exists anywhere, and no
 * assumption that it is inside a dialog. It fills whatever box its
 * container ends up with, which is what lets the exact same component mount
 * compactly inside the studio's Window tab and large on the standalone 2D
 * tool page.
 */
export function FlatPreview({ config, source, className }: FlatPreviewProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [containerRef, containerSize] = useElementSize<HTMLDivElement>()
  const { content } = useFlatContent(source)
  const contentAspect = mediaAspect(source)
  const { chrome, dominant } = resolveChrome(config, source)

  const dpr = typeof window === 'undefined' ? 1 : window.devicePixelRatio || 1
  const layout = fitPreviewLayout(containerSize, WINDOW_ASPECT, dpr)

  useFlatPreviewCanvas(
    canvasRef,
    { width: layout.canvasWidth, height: layout.canvasHeight },
    config,
    content,
    contentAspect,
    chrome,
    dominant,
  )

  return (
    <div ref={containerRef} className={cx(styles.container, className)}>
      <canvas
        ref={canvasRef}
        className={styles.canvas}
        style={{ width: layout.displayWidth, height: layout.displayHeight }}
        role="img"
        aria-label="Live preview of the window mockup"
      />
    </div>
  )
}
