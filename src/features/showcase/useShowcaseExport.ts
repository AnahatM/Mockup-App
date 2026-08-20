import { useCallback, useState } from 'react'
import { downloadBlob, safeFilename, withExtension } from '@/lib/download'
import { useAppStore } from '@/state/store'
import { useBusy } from '@/state/useBusy'
import { composeShowcase } from './composeShowcase'

export interface ShowcaseExportState {
  busy: boolean
  error: string | null
}

/**
 * Drives the showcase composite export. Deliberately separate from
 * `useCapture` — a composite is fundamentally several captures plus 2D
 * drawing, not one `capturePng` call — but shares its size, scale,
 * transparency and filename handling by reading the very same
 * `exportConfig` and reusing `@/lib/download`, so a showcase export behaves
 * exactly like every other export the app produces.
 */
export function useShowcaseExport() {
  const filename = useAppStore((state) => state.exportConfig.filename)
  const busy = useBusy()
  const notify = useAppStore((state) => state.notify)
  const [state, setState] = useState<ShowcaseExportState>({ busy: false, error: null })

  const exportShowcase = useCallback(async () => {
    setState({ busy: true, error: null })
    try {
      const blob = await busy(() => composeShowcase())
      const name = withExtension(safeFilename(filename), 'png')
      downloadBlob(blob, name)
      setState({ busy: false, error: null })
      notify(`Saved ${name}`)
    } catch (error) {
      setState({
        busy: false,
        error: error instanceof Error ? error.message : 'Export failed.',
      })
    }
  }, [busy, filename, notify])

  return { ...state, exportShowcase }
}
