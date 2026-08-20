import { capturePng, type CaptureHandle } from '@/features/capture'
import type { MediaSource, RecentUpload } from '@/features/media'
import type { SlotRect } from './layoutMath'
import type { ShowcaseConfig } from './schema'
import { setCaptureMediaSource } from './captureState'

/**
 * Frames to wait after mutating the store before trusting a capture.
 *
 * The canvas renders continuously, and a Zustand `setState` reaches the
 * three.js scene only once React re-renders the subscribed components — see
 * the comment on `features/capture/axisGizmoGuard.ts` for why this app treats
 * that as "not synchronous enough" everywhere else it matters. A few real
 * frames is cheap next to a multi-device export and removes the race.
 */
const SETTLE_FRAMES = 3

/** Exported so the orchestrator can wait out the same race after isolating
 * the device (`isolateDeviceForCapture`) before the very first slot. */
export function waitFrames(count: number = SETTLE_FRAMES): Promise<void> {
  return new Promise((resolve) => {
    const step = (remaining: number): void => {
      if (remaining <= 0) {
        resolve()
        return
      }
      requestAnimationFrame(() => step(remaining - 1))
    }
    step(count)
  })
}

function sameSource(a: MediaSource, b: MediaSource): boolean {
  if (a.kind !== b.kind) return false
  return a.kind === 'none' || b.kind === 'none' ? true : a.url === b.url
}

function sourceForSlot(
  index: number,
  showcase: ShowcaseConfig,
  baseline: MediaSource,
  recents: readonly RecentUpload[],
): MediaSource {
  const id = showcase.screenshotIds[index]
  const recent = id ? recents.find((upload) => upload.id === id) : undefined
  if (!recent) return baseline
  return {
    kind: recent.kind,
    url: recent.url,
    name: recent.name,
    width: recent.width,
    height: recent.height,
    palette: [...recent.palette],
  }
}

/** A per-slot capture is sized off the largest slot in the layout, with
 * headroom for crispness after rotation and downscale into the composite. */
export function captureSizeFor(
  slots: readonly SlotRect[],
  deviceAspect: number,
): { width: number; height: number } {
  const maxHeight = slots.reduce((tallest, slot) => Math.max(tallest, slot.height), 1)
  const height = Math.min(2200, Math.max(800, Math.round(maxHeight * 1.4)))
  return { width: Math.round(height * deviceAspect), height }
}

/**
 * Captures each slot's device as a transparent PNG, isolated from every other
 * slot, swapping the live screenshot only when a slot asks for a different
 * one. Returns one `ImageBitmap` per slot, index-aligned — the caller owns
 * closing them once drawn.
 */
export async function captureSlots(
  slots: readonly SlotRect[],
  showcase: ShowcaseConfig,
  deviceAspect: number,
  baselineSource: MediaSource,
  recents: readonly RecentUpload[],
  handle: CaptureHandle,
): Promise<ImageBitmap[]> {
  const size = captureSizeFor(slots, deviceAspect)
  const bitmaps: ImageBitmap[] = []
  let applied: MediaSource | null = null

  for (let index = 0; index < slots.length; index += 1) {
    const target = sourceForSlot(index, showcase, baselineSource, recents)
    if (!applied || !sameSource(applied, target)) {
      setCaptureMediaSource(target)
      await waitFrames(SETTLE_FRAMES)
      applied = target
    }

    const blob = await capturePng({ ...handle, ...size, transparent: true })
    if (!blob) throw new Error('The renderer produced no image for a showcase slot.')
    bitmaps.push(await createImageBitmap(blob))
  }

  return bitmaps
}
