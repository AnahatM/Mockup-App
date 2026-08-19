import { getCaptureHandle } from './handle'
import { capturePng } from './png'
import { resolveSize } from './sizePresets'
import type { ExportConfig } from './schema'

/**
 * Renders the scene to a PNG blob at the configured size.
 *
 * Extracted so that downloading and copying to the clipboard share one
 * definition of "the export". Two copies of the sizing maths would eventually
 * disagree, and the user would get a different image depending on which button
 * they pressed.
 */
export async function renderStill(config: ExportConfig): Promise<Blob> {
  const handle = getCaptureHandle()
  if (!handle) throw new Error('The scene is not ready yet.')

  const viewport = {
    width: handle.renderer.domElement.width,
    height: handle.renderer.domElement.height,
  }
  const base = resolveSize(
    config.sizePreset,
    { width: config.customWidth, height: config.customHeight },
    viewport,
  )

  const blob = await capturePng({
    ...handle,
    width: Math.round(base.width * config.scale),
    height: Math.round(base.height * config.scale),
    transparent: config.transparent,
  })

  if (!blob) throw new Error('The renderer produced no image.')
  return blob
}
