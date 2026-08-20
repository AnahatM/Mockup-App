/*
 * Lives here, on the 3D side of the seam, rather than in `features/flat`.
 *
 * It is the bridge that puts the 2D window composite onto a device's screen in
 * the 3D scene, so it imports three.js and react-three-fiber. While it sat in
 * the flat feature, the flat barrel carried three.js — which meant the 2D
 * window tool downloaded a 3D engine it never runs, defeating the separation
 * ADR 0006 exists to create. The 2D tool does not use this hook; only
 * `Device.tsx` does.
 */
import { useEffect, useMemo } from 'react'
import { CanvasTexture, SRGBColorSpace, VideoTexture, type Texture } from 'three'
import { useFrame } from '@react-three/fiber'
import { mediaAspect, mediaPalette } from '@/features/media'
import { useAppStore } from '@/state/store'
import { WINDOW_ASPECT, composeWindow } from '@/features/flat'
import type { FlatConfig } from '@/features/flat/schema'

/** Enough for crisp title text at export scale. */
const RESOLUTION = 2200

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
  const dominant = palette[0] ?? null
  const chrome = config.colorMatch && dominant ? dominant : config.chrome
  const contentAspect = mediaAspect(source) || aspectOverride

  // The canvas is part of the memoised value rather than held in a ref, so
  // nothing is written during render. A surface is still needed when the
  // mockup is hidden, since the compositor draws the bare content instead.
  const surface = useMemo<Surface | null>(
    () => (config.style === 'none' && !config.hideMockup ? null : createSurface()),
    [config.style, config.hideMockup],
  )

  useEffect(() => {
    if (!surface) return
    paint(surface, config, media, contentAspect, chrome, dominant)
  }, [surface, config, media, contentAspect, chrome, dominant])

  // Video needs recomposing every frame; a still does not.
  useFrame(() => {
    if (!surface || !(media instanceof VideoTexture)) return
    paint(surface, config, media, contentAspect, chrome, dominant)
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
  dominant: string | null,
): void {
  composeWindow({
    ctx: surface.ctx,
    width: surface.canvas.width,
    height: surface.canvas.height,
    config,
    content: imageSource(media),
    contentAspect,
    chrome,
    dominant,
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
