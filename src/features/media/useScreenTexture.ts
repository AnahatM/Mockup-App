import { useEffect, useMemo, useState } from 'react'
import {
  ClampToEdgeWrapping,
  LinearFilter,
  LinearMipmapLinearFilter,
  SRGBColorSpace,
  TextureLoader,
  VideoTexture,
} from 'three'
import type { Texture } from 'three'
import { useAppStore } from '@/state/store'
import type { MediaSource } from './schema'

/**
 * Builds the three.js texture for whatever media is loaded.
 *
 * Images load asynchronously; video creates a hidden `<video>` element driven by
 * the store's playback config, which is what makes an uploaded screen recording
 * play on the device — and, later, get captured into an exported video.
 *
 * Textures are disposed when the source changes and the video element is torn
 * down with them; leaking either would accumulate GPU memory every time the user
 * tries a different screenshot.
 */
export function useScreenTexture(): Texture | null {
  const source = useAppStore((state) => state.media.source)
  const video = useVideoTexture(source)
  const image = useImageTexture(source)
  const texture = video ?? image

  useVideoPlayback(texture)

  return texture
}

/** Video textures are synchronous, so they need no state at all. */
function useVideoTexture(source: MediaSource): VideoTexture | null {
  const url = source.kind === 'video' ? source.url : null

  const texture = useMemo(
    () => (url ? configure(new VideoTexture(createVideoElement(url)), false) : null),
    [url],
  )

  useEffect(
    () => () => {
      if (!texture) return
      const element = texture.image as HTMLVideoElement
      texture.dispose()
      element.pause()
      element.removeAttribute('src')
      element.load()
    },
    [texture],
  )

  return texture
}

/**
 * Image loading is async, so the result is stored *with the url it came from*.
 * Deriving the current texture by comparing urls means switching or clearing the
 * media needs no synchronous setState inside an effect, which would cascade an
 * extra render on every change.
 */
function useImageTexture(source: MediaSource): Texture | null {
  const url = source.kind === 'image' ? source.url : null
  const [loaded, setLoaded] = useState<{ url: string; texture: Texture } | null>(null)

  useEffect(() => {
    if (!url) return
    let cancelled = false

    new TextureLoader().load(url, (result) => {
      if (cancelled) {
        result.dispose()
        return
      }
      setLoaded({ url, texture: configure(result, true) })
    })

    return () => {
      cancelled = true
    }
  }, [url])

  // Dispose the previous texture once a different one has taken its place.
  useEffect(() => () => loaded?.texture.dispose(), [loaded])

  return loaded && loaded.url === url ? loaded.texture : null
}

/**
 * Playback settings are applied separately from texture creation, so changing
 * them never rebuilds the texture — which would restart the video.
 */
function useVideoPlayback(texture: Texture | null): void {
  const screen = useAppStore((state) => state.screen)

  useEffect(() => {
    if (!(texture instanceof VideoTexture)) return
    const video = texture.image as HTMLVideoElement
    video.loop = screen.loop
    video.muted = screen.muted
    video.playbackRate = screen.rate
    if (screen.playing) void video.play().catch(() => undefined)
    else video.pause()
  }, [texture, screen.playing, screen.loop, screen.muted, screen.rate])
}

function createVideoElement(url: string): HTMLVideoElement {
  const video = document.createElement('video')
  video.src = url
  video.crossOrigin = 'anonymous'
  video.loop = true
  // Muted and inline are both required for autoplay to be permitted at all.
  video.muted = true
  video.playsInline = true
  video.preload = 'auto'
  return video
}

/**
 * @param mipmapped Whether the texture may build a mip chain. False for video,
 *   which would have to rebuild the whole chain on every decoded frame.
 */
function configure<T extends Texture>(texture: T, mipmapped: boolean): T {
  texture.colorSpace = SRGBColorSpace
  texture.wrapS = ClampToEdgeWrapping
  texture.wrapT = ClampToEdgeWrapping

  // A screenshot is almost always minified — a 2000px-wide capture rendered
  // onto a phone a few hundred pixels tall — and it is almost always seen at an
  // angle. Without a mip chain that combination samples one texel per pixel out
  // of an image with twenty times the detail, so fine UI text crawls and
  // sparkles as the camera moves. Anisotropy alone does not fix it: it samples
  // *along* the mip chain, so with no chain to walk there is nothing for it to
  // do. Both were being set, and only one of them was working.
  texture.generateMipmaps = mipmapped
  texture.minFilter = mipmapped ? LinearMipmapLinearFilter : LinearFilter
  texture.magFilter = LinearFilter
  texture.anisotropy = 16

  texture.needsUpdate = true
  return texture
}
