import { useEffect, useRef, type RefObject } from 'react'
import { composeWindow } from './compose'
import type { FlatConfig } from './schema'

interface CanvasSize {
  width: number
  height: number
}

/**
 * Draws `composeWindow` onto `canvasRef` at `size`, coalesced to at most one
 * redraw per animation frame.
 *
 * Dragging a slider fires many state updates a second. Drawing synchronously
 * on every one of them would queue several redraws inside a single frame's
 * budget for no visible benefit — only the last one before the browser
 * paints is ever seen. Scheduling through `requestAnimationFrame` collapses
 * a burst of changes into the single redraw the browser was about to do
 * anyway, which is what keeps a drag from stuttering.
 */
export function useFlatPreviewCanvas(
  canvasRef: RefObject<HTMLCanvasElement | null>,
  size: CanvasSize,
  config: FlatConfig,
  content: CanvasImageSource | null,
  contentAspect: number,
  chrome: string,
  dominant: string | null,
): void {
  const frameRef = useRef<number | null>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || size.width <= 0 || size.height <= 0) return undefined

    if (frameRef.current !== null) cancelAnimationFrame(frameRef.current)
    frameRef.current = requestAnimationFrame(() => {
      frameRef.current = null
      canvas.width = size.width
      canvas.height = size.height
      const ctx = canvas.getContext('2d')
      if (!ctx) return
      composeWindow({
        ctx,
        width: size.width,
        height: size.height,
        config,
        content,
        contentAspect,
        chrome,
        dominant,
      })
    })

    return () => {
      if (frameRef.current !== null) cancelAnimationFrame(frameRef.current)
    }
  }, [canvasRef, size.width, size.height, config, content, contentAspect, chrome, dominant])
}
