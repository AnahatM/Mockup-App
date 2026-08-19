import { useCallback, useState } from 'react'
import {
  copyImageToClipboard,
  downloadBlob,
  safeFilename,
  withExtension,
} from '@/lib/download'
import { useAppStore } from '@/state/store'
import { useBusy } from '@/state/useBusy'
import { getCaptureHandle } from './handle'
import { renderStill } from './renderStill'
import { recordWebm } from './webm'

export interface CaptureState {
  busy: boolean
  /** 0-1 while recording. */
  progress: number
  error: string | null
}

/** Drives PNG export and video recording from the inspector. */
export function useCapture() {
  const config = useAppStore((state) => state.exportConfig)
  const busy = useBusy()
  const [state, setState] = useState<CaptureState>({
    busy: false,
    progress: 0,
    error: null,
  })

  const exportPng = useCallback(async () => {
    setState({ busy: true, progress: 0, error: null })
    try {
      const blob = await busy(() => renderStill(config))
      downloadBlob(blob, withExtension(safeFilename(config.filename), 'png'))
      setState({ busy: false, progress: 1, error: null })
    } catch (error) {
      setState({ busy: false, progress: 0, error: messageFor(error, 'Export failed.') })
    }
  }, [busy, config])

  /** Copies the same image the download would produce. */
  const copyPng = useCallback(async () => {
    setState({ busy: true, progress: 0, error: null })
    try {
      const blob = await busy(() => renderStill(config))
      const copied = await copyImageToClipboard(blob)
      setState({
        busy: false,
        progress: 1,
        // Not an error the user caused, so it reads as guidance rather than a
        // failure — and the download button beside it still works.
        error: copied ? null : 'Your browser would not allow a clipboard copy.',
      })
    } catch (error) {
      setState({ busy: false, progress: 0, error: messageFor(error, 'Copy failed.') })
    }
  }, [busy, config])

  const recordVideo = useCallback(async () => {
    const handle = getCaptureHandle()
    if (!handle) {
      setState({ busy: false, progress: 0, error: 'The scene is not ready yet.' })
      return
    }

    setState({ busy: true, progress: 0, error: null })
    try {
      const result = await busy(() =>
        recordWebm({
          canvas: handle.renderer.domElement,
          fps: config.fps,
          duration: config.videoDuration,
          bitrateMbps: config.bitrateMbps,
          onProgress: (progress) => setState((previous) => ({ ...previous, progress })),
        }),
      )

      // Distinguishing "cannot record" from "recorded nothing" matters: they
      // have completely different fixes, and reporting the wrong one sends the
      // user hunting for a browser problem that is not there.
      if (!result.ok) {
        setState({ busy: false, progress: 0, error: result.error })
        return
      }

      downloadBlob(result.value, withExtension(safeFilename(config.filename), 'webm'))
      setState({ busy: false, progress: 1, error: null })
    } catch (error) {
      setState({
        busy: false,
        progress: 0,
        error: error instanceof Error ? error.message : 'Recording failed.',
      })
    }
  }, [busy, config])

  return { ...state, exportPng, copyPng, recordVideo }
}

const messageFor = (error: unknown, fallback: string): string =>
  error instanceof Error ? error.message : fallback
