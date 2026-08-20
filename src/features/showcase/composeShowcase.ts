import { getCaptureHandle, resolveSize, type CaptureHandle } from '@/features/capture'
import { useAppStore } from '@/state/store'
import type { AppState } from '@/state/types'
import { captureSlots, waitFrames } from './captureSlots'
import { isolateDeviceForCapture, restoreCaptureState, snapshotCaptureState } from './captureState'
import { drawSlots } from './drawSlots'
import { drawTextBlock } from './drawText'
import { layoutSlots, type SlotRect } from './layoutMath'
import { contentRectFor, measureTextBlock } from './textBlock'

/**
 * Builds the App Store showcase composite and returns it as a PNG blob.
 *
 * ## Why compositing, not N live devices in the 3D scene
 * The rest of the app has exactly one device in the store (`state.device`)
 * and one screen texture; camera, lighting and backdrop are all built around
 * that. Duplicating the device into the live scene N times would mean
 * threading device-index-aware transforms through Stage, Device, the
 * camera's auto-fit framing and the lighting rig — none of which this
 * feature owns, several of which are being edited concurrently. Instead,
 * each device is captured independently, through the exact single-device
 * pipeline every other export already uses (`capturePng`), and placed in 2D
 * afterwards. Lighting/backdrop/camera stay exactly as coherent as a normal
 * export because they never change, and "never crop a device" becomes a
 * property of `layoutMath.ts`'s pure fit-to-rect maths rather than of a 3D
 * camera that would need to know how many devices are on screen.
 *
 * ## Why the headline is canvas text, not a 3D text mesh
 * No network request can load a webfont, so only fonts already on the
 * machine are usable (`textFont.ts`'s system stack). Canvas 2D gives exact,
 * testable wrapping (`textWrap.ts`) against those real fonts and composites
 * for free onto a surface everything else here is already drawn on. A
 * drei/troika mesh would also need its own camera-facing billboard logic to
 * survive five very different 2D layouts.
 *
 * ## Framing as device count changes
 * Every slot is captured at the SAME aspect ratio as the live viewport —
 * exactly what a normal export already renders at — so the existing camera
 * framing (owned by `features/camera`) is never asked to do anything it does
 * not already do for a single-device export. The layout only decides where
 * that already well-framed image is placed, scaled and rotated in 2D, so a
 * composition can add devices without ever cropping one.
 */
export async function composeShowcase(): Promise<Blob> {
  const state = useAppStore.getState()
  const handle = getCaptureHandle()
  if (!handle) throw new Error('The scene is not ready yet.')

  const { canvasWidth, canvasHeight } = resolveCanvasSize(state, handle)
  const canvas = document.createElement('canvas')
  canvas.width = canvasWidth
  canvas.height = canvasHeight
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('Canvas 2D is not available.')

  if (!state.exportConfig.transparent) {
    ctx.fillStyle = state.showcase.backgroundColor
    ctx.fillRect(0, 0, canvasWidth, canvasHeight)
  }

  const textBlock = measureTextBlock(ctx, state.showcase.text, canvasWidth)
  const contentRect = contentRectFor(
    canvasWidth,
    canvasHeight,
    state.showcase.text.position,
    textBlock,
  )
  const deviceAspect = handle.renderer.domElement.width / handle.renderer.domElement.height
  const slots = layoutSlots(state.showcase.layout, contentRect, deviceAspect)

  const bitmaps = await captureIsolated(state, slots, deviceAspect, handle)
  try {
    drawSlots(ctx, slots, bitmaps)
  } finally {
    for (const bitmap of bitmaps) bitmap.close()
  }

  drawTextBlock(ctx, state.showcase.text, canvasWidth, canvasHeight, textBlock)

  const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/png'))
  if (!blob) throw new Error('The showcase composite produced no image.')
  return blob
}

function resolveCanvasSize(
  state: AppState,
  handle: CaptureHandle,
): { canvasWidth: number; canvasHeight: number } {
  const viewport = {
    width: handle.renderer.domElement.width,
    height: handle.renderer.domElement.height,
  }
  const base = resolveSize(
    state.exportConfig.sizePreset,
    { width: state.exportConfig.customWidth, height: state.exportConfig.customHeight },
    viewport,
  )
  return {
    canvasWidth: Math.round(base.width * state.exportConfig.scale),
    canvasHeight: Math.round(base.height * state.exportConfig.scale),
  }
}

/** Isolates the device, captures every slot, and restores scene/media state
 * no matter how the capture ends — mirrors `capturePng`'s own finally-guard. */
async function captureIsolated(
  state: AppState,
  slots: readonly SlotRect[],
  deviceAspect: number,
  handle: CaptureHandle,
): Promise<ImageBitmap[]> {
  const snapshot = snapshotCaptureState(state)
  isolateDeviceForCapture()
  try {
    await waitFrames()
    return await captureSlots(
      slots,
      state.showcase,
      deviceAspect,
      snapshot.mediaSource,
      state.recentUploads,
      handle,
    )
  } finally {
    restoreCaptureState(snapshot)
  }
}
