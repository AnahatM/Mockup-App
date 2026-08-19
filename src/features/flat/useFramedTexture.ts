import { useEffect, useMemo } from 'react'
import { CanvasTexture, SRGBColorSpace, VideoTexture, type Texture } from 'three'
import { useFrame } from '@react-three/fiber'
import { mediaAspect, mediaPalette } from '@/features/media'
import { useAppStore } from '@/state/store'
import { composeWindow } from './compose'
import type { FlatConfig } from './schema'

/** Enough for crisp title text at export scale. */
const RESOLUTION = 2200

/** Window proportion. 16:10 reads as a desktop window; the chrome sits on top. */
const WINDOW_ASPECT = 16 / 10

export interface FramedResult {
  texture: Texture | null
  aspect: number
}

interface Surface {
  canvas: HTMLCanvasElement
  ctx: CanvasRenderingContext2D
  texture: CanvasTexture
}

/**
 * Composes the media inside window chrome and returns it as a texture.
 *
 * Redrawn only when the config or the media changes — except for video, which is
 * recomposed each frame so the window shows a playing recording rather than a
 * frozen first frame.
 */
export function useFramedTexture(
  media: Texture | null,
  aspectOverride: number,
): FramedResult {
  const config = useAppStore((state) => state.flat)
  const source = useAppStore((state) => state.media.source)
  const palette = mediaPalette(source)
  const chrome = config.colorMatch && palette[0] ? palette[0] : config.chrome
  const contentAspect = mediaAspect(source) || aspectOverride

  // The canvas is part of the memoised value rather than held in a ref, so
  // nothing is written during render.
  const surface = useMemo<Surface | null>(
    () => (config.style === 'none' ? null : createSurface()),
    [config.style],
  )

  useEffect(() => {
    if (!surface) return
    paint(surface, config, media, contentAspect, chrome)
  }, [surface, config, media, contentAspect, chrome])

  // Video needs recomposing every frame; a still does not.
  useFrame(() => {
    if (!surface || !(media instanceof VideoTexture)) return
    paint(surface, config, media, contentAspect, chrome)
  })

  useEffect(() => () => surface?.texture.dispose(), [surface])

  return { texture: surface?.texture ?? null, aspect: WINDOW_ASPECT }
}

function createSurface(): Surface | null {
  const canvas = document.createElement('canvas')
  canvas.width = RESOLUTION
  canvas.height = Math.round(RESOLUTION / WINDOW_ASPECT)

  const ctx = canvas.getContext('2d')
  if (!ctx) return null

  const texture = new CanvasTexture(canvas)
  texture.colorSpace = SRGBColorSpace
  texture.anisotropy = 16
  return { canvas, ctx, texture }
}

function paint(
  surface: Surface,
  config: FlatConfig,
  media: Texture | null,
  contentAspect: number,
  chrome: string,
): void {
  composeWindow({
    ctx: surface.ctx,
    width: surface.canvas.width,
    height: surface.canvas.height,
    config,
    content: imageSource(media),
    contentAspect,
    chrome,
  })
  surface.texture.needsUpdate = true
}

/** Unwraps the DOM element a three.js texture was built from. */
function imageSource(texture: Texture | null): CanvasImageSource | null {
  const image: unknown = texture?.image
  if (
    image instanceof HTMLImageElement ||
    image instanceof HTMLVideoElement ||
    image instanceof HTMLCanvasElement ||
    image instanceof ImageBitmap
  ) {
    return image
  }
  return null
}
