import type { MediaSource } from './schema'

/**
 * Small canvas thumbnails for the recent-uploads row.
 *
 * Generated once per upload rather than rendering the full-size image/video in
 * a 40px box: a screen recording's decoded frame or a multi-megapixel
 * screenshot is far more bytes than the row ever needs to paint, and re-using
 * the full source keeps that memory alive for as long as the thumbnail is
 * shown. This draws once into a small canvas and keeps only the resulting
 * (tiny) data URL.
 */

const THUMB_MAX_EDGE = 96

export async function createThumbnail(source: MediaSource): Promise<string> {
  if (source.kind === 'none') return ''
  try {
    const element =
      source.kind === 'image' ? await loadImage(source.url) : await loadVideoFrame(source.url)
    if (!element) return ''
    return draw(element, source.width, source.height)
  } catch {
    // A thumbnail is a nicety, never a reason to fail the upload.
    return ''
  }
}

function loadImage(url: string): Promise<HTMLImageElement | null> {
  return new Promise((resolve) => {
    const image = new Image()
    image.onload = () => resolve(image)
    image.onerror = () => resolve(null)
    image.src = url
  })
}

/** Mirrors the seek-past-the-opening-frame trick in `decode.ts`. */
function loadVideoFrame(url: string): Promise<HTMLVideoElement | null> {
  return new Promise((resolve) => {
    const video = document.createElement('video')
    video.preload = 'auto'
    video.muted = true
    video.playsInline = true
    video.onloadeddata = () => {
      video.onseeked = () => resolve(video)
      video.onerror = () => resolve(video)
      video.currentTime = Math.min(0.4, (video.duration || 1) * 0.1)
    }
    video.onerror = () => resolve(null)
    video.src = url
  })
}

function draw(element: CanvasImageSource, width: number, height: number): string {
  const longest = Math.max(width, height) || 1
  const scale = THUMB_MAX_EDGE / longest
  const w = Math.max(1, Math.round(width * scale))
  const h = Math.max(1, Math.round(height * scale))

  const canvas = document.createElement('canvas')
  canvas.width = w
  canvas.height = h
  const ctx = canvas.getContext('2d')
  if (!ctx) return ''

  ctx.drawImage(element, 0, 0, w, h)
  // JPEG, not PNG: the row only needs a preview, and this keeps every entry a
  // few KB regardless of how large or transparent the source was.
  return canvas.toDataURL('image/jpeg', 0.72)
}
