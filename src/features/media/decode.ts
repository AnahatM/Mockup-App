import { err, ok, type Result } from '@/lib/result'
import { paletteFromSource } from './palette'
import type { MediaSource } from './schema'

/**
 * Turns a dropped File into a MediaSource, reading its real dimensions.
 *
 * Everything happens locally: the file becomes an object URL, is decoded by the
 * browser to discover its natural size, and never leaves the machine. Failures
 * are returned rather than thrown, because "that isn't an image" is a message to
 * show the user, not a crash.
 */

const IMAGE_TYPES = /^image\/(png|jpeg|webp|avif|gif|svg\+xml)$/
const VIDEO_TYPES = /^video\/(mp4|webm|ogg|quicktime)$/

/** Generous, but a guard against someone dropping a 4GB capture by accident. */
const MAX_BYTES = 250 * 1024 * 1024

export async function loadMediaFile(file: File): Promise<Result<MediaSource>> {
  if (file.size > MAX_BYTES) {
    return err(`${file.name} is larger than ${Math.round(MAX_BYTES / 1024 / 1024)}MB.`)
  }

  const isImage = IMAGE_TYPES.test(file.type)
  const isVideo = VIDEO_TYPES.test(file.type)
  if (!isImage && !isVideo) {
    return err(
      file.type
        ? `${file.type} is not a supported image or video format.`
        : `Could not identify the type of ${file.name}.`,
    )
  }

  const url = URL.createObjectURL(file)
  try {
    const decoded = isImage ? await decodeImage(url) : await decodeVideo(url)
    if (!decoded) {
      URL.revokeObjectURL(url)
      return err(`${file.name} could not be decoded — it may be corrupt.`)
    }
    return ok({
      kind: isImage ? 'image' : 'video',
      url,
      name: file.name,
      width: decoded.width,
      height: decoded.height,
      // Extracted here because the frame is already decoded; doing it later
      // would mean loading the file a second time.
      palette: paletteFromSource(decoded.source, decoded.width, decoded.height),
    })
  } catch {
    URL.revokeObjectURL(url)
    return err(`Something went wrong reading ${file.name}.`)
  }
}

interface Decoded {
  width: number
  height: number
  source: CanvasImageSource
}

function decodeImage(url: string): Promise<Decoded | null> {
  return new Promise((resolve) => {
    const image = new Image()
    image.onload = () =>
      resolve({
        width: image.naturalWidth,
        height: image.naturalHeight,
        source: image,
      })
    image.onerror = () => resolve(null)
    image.src = url
  })
}

/**
 * Video needs a frame, not just metadata — a palette cannot be read from
 * dimensions. Seeking a little way in avoids sampling a black opening frame.
 */
function decodeVideo(url: string): Promise<Decoded | null> {
  return new Promise((resolve) => {
    const video = document.createElement('video')
    video.preload = 'auto'
    video.muted = true
    video.playsInline = true

    const done = (value: Decoded | null) => resolve(value)

    video.onloadeddata = () => {
      video.onseeked = () =>
        done({ width: video.videoWidth, height: video.videoHeight, source: video })
      // If seeking is not supported, settle for whatever frame is decoded.
      video.onerror = () =>
        done({ width: video.videoWidth, height: video.videoHeight, source: video })
      video.currentTime = Math.min(0.4, (video.duration || 1) * 0.1)
    }
    video.onerror = () => done(null)
    video.src = url
  })
}
