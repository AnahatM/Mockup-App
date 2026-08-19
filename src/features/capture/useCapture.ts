import { useCallback, useState } from 'react'
import { downloadBlob, safeFilename, withExtension } from '@/lib/download'
import { useAppStore } from '@/state/store'
import { getCaptureHandle } from './handle'
import { capturePng } from './png'
import { resolveSize } from './sizePresets'
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
  const [state, setState] = useState<CaptureState>({
    busy: false,
    progress: 0,
    error: null,
  })

  const exportPng = useCallback(async () => {
    const handle = getCaptureHandle()
    if (!handle) {
      setState({ busy: false, progress: 0, error: 'The scene is not ready yet.' })
      return
    }

    setState({ busy: true, progress: 0, error: null })
    try {
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
      downloadBlob(blob, withExtension(safeFilename(config.filename), 'png'))
      setState({ busy: false, progress: 1, error: null })
    } catch (error) {
      setState({
        busy: false,
        progress: 0,
        error: error instanceof Error ? error.message : 'Export failed.',
      })
    }
  }, [config])

  const recordVideo = useCallback(async () => {
    const handle = getCaptureHandle()
    if (!handle) {
      setState({ busy: false, progress: 0, error: 'The scene is not ready yet.' })
      return
    }

    setState({ busy: true, progress: 0, error: null })
    try {
      const result = await recordWebm({
        canvas: handle.renderer.domElement,
        fps: config.fps,
        duration: config.videoDuration,
        bitrateMbps: config.bitrateMbps,
        onProgress: (progress) => setState((previous) => ({ ...previous, progress })),
      })

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
  }, [config])

  return { ...state, exportPng, recordVideo }
}
