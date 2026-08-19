import { useEffect, useMemo } from 'react'
import { CanvasTexture, SRGBColorSpace } from 'three'
import { paintBackdrop } from './paint'
import type { BackdropConfig } from '../schema'

/** Backdrop gradients are smooth, so a modest canvas upscales without banding. */
const TEXTURE_SIZE = 512

/**
 * Builds (and disposes) the canvas texture used as the scene background.
 * Returns null for transparent mode, which is what makes alpha PNG export work.
 */
export function useBackdropTexture(config: BackdropConfig): CanvasTexture | null {
  const texture = useMemo(() => {
    if (config.mode === 'transparent' || config.mode === 'environment') return null

    const canvas = document.createElement('canvas')
    canvas.width = TEXTURE_SIZE
    canvas.height = TEXTURE_SIZE
    const ctx = canvas.getContext('2d')
    if (!ctx) return null

    paintBackdrop(ctx, TEXTURE_SIZE, config)
    const created = new CanvasTexture(canvas)
    created.colorSpace = SRGBColorSpace
    return created
  }, [config])

  useEffect(() => () => texture?.dispose(), [texture])

  return texture
}
