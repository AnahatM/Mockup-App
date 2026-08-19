import { useState } from 'react'
import { Button, Panel } from '@/ui'
import { ControlList } from '@/ui/controls'
import { exportFlatWindow } from '@/features/flat'
import { mediaPalette } from '@/features/media'
import { useAppStore } from '@/state/store'
import { useBusy } from '@/state/useBusy'
import { windowContentControls } from './windowControls'
import { windowStyleControls } from './windowStyleControls'
import styles from './ExportPanel.module.css'

/**
 * 2D window mockups.
 *
 * The same chrome appears on the device screen in the 3D scene and in the flat
 * export, because both come from one canvas composer.
 */
export function WindowPanel() {
  const config = useAppStore((state) => state.flat)
  const source = useAppStore((state) => state.media.source)
  const filename = useAppStore((state) => state.exportConfig.filename)
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const whileBusy = useBusy()

  const palette = mediaPalette(source)
  const chrome = config.colorMatch && palette[0] ? palette[0] : config.chrome

  const exportFlat = async () => {
    setBusy(true)
    setError(null)
    const result = await whileBusy(async () => {
      const image = await loadImage(source.kind === 'none' ? null : source.url)
      return exportFlatWindow({
        config,
        content: image,
        contentAspect: source.kind === 'none' ? 1 : source.width / source.height,
        chrome,
        width: 2400,
        filename: `${filename}-window`,
      })
    })
    if (!result.ok) setError(result.error)
    setBusy(false)
  }

  return (
    <Panel title="Window mockup">
      <ControlList controls={windowContentControls} />
      <ControlList controls={windowStyleControls} />
      <Button
        icon="window"
        size="sm"
        fullWidth
        disabled={busy || config.style === 'none'}
        onClick={() => void exportFlat()}
      >
        {busy ? 'Exporting…' : 'Export window PNG'}
      </Button>
      {error && (
        <p className={styles.error} role="alert">
          {error}
        </p>
      )}
    </Panel>
  )
}

function loadImage(url: string | null): Promise<HTMLImageElement | null> {
  if (!url) return Promise.resolve(null)
  return new Promise((resolve) => {
    const image = new Image()
    image.onload = () => resolve(image)
    image.onerror = () => resolve(null)
    image.src = url
  })
}
