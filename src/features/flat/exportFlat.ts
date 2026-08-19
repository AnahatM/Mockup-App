import { downloadBlob, safeFilename, withExtension } from '@/lib/download'
import { err, ok, type Result } from '@/lib/result'
import { composeWindow } from './compose'
import type { FlatConfig } from './schema'

export interface ExportFlatOptions {
  config: FlatConfig
  content: CanvasImageSource | null
  contentAspect: number
  chrome: string
  width: number
  filename: string
}

/**
 * Exports the window mockup on its own, with no 3D scene involved.
 *
 * Because the chrome is drawn on a canvas, a flat export is just the same
 * compose call at a higher resolution — no rasteriser, and pixel-identical to
 * what the device screen shows.
 */
export async function exportFlatWindow({
  config,
  content,
  contentAspect,
  chrome,
  width,
  filename,
}: ExportFlatOptions): Promise<Result<null>> {
  const canvas = document.createElement('canvas')
  canvas.width = Math.max(64, Math.round(width))
  canvas.height = Math.round(canvas.width / (16 / 10))

  const ctx = canvas.getContext('2d')
  if (!ctx) return err('Could not create a drawing surface.')

  composeWindow({
    ctx,
    width: canvas.width,
    height: canvas.height,
    config,
    content,
    contentAspect,
    chrome,
  })

  const blob = await new Promise<Blob | null>((resolve) =>
    canvas.toBlob(resolve, 'image/png'),
  )
  if (!blob) return err('The window could not be encoded as a PNG.')

  downloadBlob(blob, withExtension(safeFilename(filename), 'png'))
  return ok(null)
}
