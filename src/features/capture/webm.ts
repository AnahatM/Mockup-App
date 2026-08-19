import { err, ok, type Result } from '@/lib/result'

/**
 * Records the live canvas to a WebM video.
 *
 * Uses `captureStream` plus `MediaRecorder`, which are native and entirely
 * local — no encoder to download and nothing leaves the machine. Recording the
 * live canvas (rather than rendering offline frame by frame) is the honest
 * trade: it is real-time, so a very heavy scene records at whatever rate the
 * machine manages, but it needs no muxer and captures exactly what the user sees.
 */

/** Preference order: VP9 is smaller and sharper, VP8 is the wider fallback. */
const CANDIDATES = [
  'video/webm;codecs=vp9',
  'video/webm;codecs=vp8',
  'video/webm',
] as const

/** How long to keep waiting for the encoder after the capture window closes. */
const FLUSH_TIMEOUT_MS = 8000

export function isRecordingSupported(): boolean {
  return typeof MediaRecorder !== 'undefined' && pickMimeType() !== null
}

export function pickMimeType(): string | null {
  if (typeof MediaRecorder === 'undefined') return null
  return CANDIDATES.find((type) => MediaRecorder.isTypeSupported(type)) ?? null
}

export interface RecordOptions {
  canvas: HTMLCanvasElement
  fps: number
  /** Seconds. */
  duration: number
  bitrateMbps: number
  /** Called with 0-1 progress so the UI can show it. */
  onProgress?: (progress: number) => void
  signal?: AbortSignal
}

export async function recordWebm({
  canvas,
  fps,
  duration,
  bitrateMbps,
  onProgress,
  signal,
}: RecordOptions): Promise<Result<Blob>> {
  const mimeType = pickMimeType()
  if (!mimeType) {
    return err('This browser cannot record WebM video.')
  }

  const stream = canvas.captureStream(fps)
  if (stream.getVideoTracks().length === 0) {
    return err('The canvas produced no video frames to record.')
  }

  const recorder = new MediaRecorder(stream, {
    mimeType,
    videoBitsPerSecond: Math.round(bitrateMbps * 1_000_000),
  })

  const chunks: Blob[] = []
  recorder.ondataavailable = (event) => {
    if (event.data.size > 0) chunks.push(event.data)
  }

  const stopped = new Promise<void>((resolve) => {
    recorder.onstop = () => resolve()
  })

  // A timeslice means chunks arrive during the recording rather than all at the
  // end, so a long capture cannot be lost wholesale if something goes wrong.
  recorder.start(250)
  await waitForDuration(duration, onProgress, signal)

  // Flush anything the encoder is still holding before stopping. Without this,
  // a short capture on a slow encoder can end with nothing written at all.
  if (recorder.state === 'recording') recorder.requestData()
  if (recorder.state !== 'inactive') recorder.stop()
  await Promise.race([stopped, delay(FLUSH_TIMEOUT_MS)])

  for (const track of stream.getTracks()) track.stop()

  if (chunks.length === 0) {
    console.warn(
      `[capture] no data: mime=${mimeType} state=${recorder.state} ` +
        `tracks=${stream.getVideoTracks().length} ` +
        `canvas=${canvas.width}x${canvas.height} duration=${duration} fps=${fps}`,
    )
    return err(
      'The encoder produced no frames. Try a longer duration or a lower resolution.',
    )
  }
  return ok(new Blob(chunks, { type: 'video/webm' }))
}

/** Progress is a label; reporting it more often than this is wasted work. */
const PROGRESS_INTERVAL_MS = 200

/**
 * Waits out the capture window.
 *
 * Timed with `setTimeout` rather than `requestAnimationFrame`, and progress is
 * throttled: driving a React state update from every animation frame puts the
 * recorder in competition with the render loop for the main thread, which on a
 * software renderer is enough to starve the encoder of frames entirely.
 */
function waitForDuration(
  duration: number,
  onProgress: ((progress: number) => void) | undefined,
  signal: AbortSignal | undefined,
): Promise<void> {
  const totalMs = duration * 1000
  const startedAt = performance.now()

  return new Promise((resolve) => {
    const tick = () => {
      const elapsed = performance.now() - startedAt
      if (signal?.aborted || elapsed >= totalMs) {
        onProgress?.(1)
        resolve()
        return
      }
      onProgress?.(elapsed / totalMs)
      setTimeout(tick, PROGRESS_INTERVAL_MS)
    }
    setTimeout(tick, PROGRESS_INTERVAL_MS)
  })
}

const delay = (ms: number): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, ms))
