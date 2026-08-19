import { err, ok, type Result } from '@/lib/result'
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
    const size = isImage ? await imageSize(url) : await videoSize(url)
    if (!size) {
      URL.revokeObjectURL(url)
      return err(`${file.name} could not be decoded — it may be corrupt.`)
    }
    return ok({
      kind: isImage ? 'image' : 'video',
      url,
      name: file.name,
      width: size.width,
      height: size.height,
    })
  } catch {
    URL.revokeObjectURL(url)
    return err(`Something went wrong reading ${file.name}.`)
  }
}

interface Size {
  width: number
  height: number
}

function imageSize(url: string): Promise<Size | null> {
  return new Promise((resolve) => {
    const image = new Image()
    image.onload = () =>
      resolve({ width: image.naturalWidth, height: image.naturalHeight })
    image.onerror = () => resolve(null)
    image.src = url
  })
}

function videoSize(url: string): Promise<Size | null> {
  return new Promise((resolve) => {
    const video = document.createElement('video')
    video.preload = 'metadata'
    video.muted = true
    video.onloadedmetadata = () =>
      resolve({ width: video.videoWidth, height: video.videoHeight })
    video.onerror = () => resolve(null)
    video.src = url
  })
}
