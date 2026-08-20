import { useState } from 'react'
import { Button, Panel } from '@/ui'
import { ControlList } from '@/ui/controls'
import { exportFlatWindow, FlatPreview } from '@/features/flat'
import { mediaPalette } from '@/features/media'
import { useAppStore } from '@/state/store'
import { useBusy } from '@/state/useBusy'
import { windowContainerControls } from './windowContainerControls'
import { windowContentControls } from './windowControls'
import { windowStyleControls } from './windowStyleControls'
import exportStyles from './ExportPanel.module.css'
import styles from './WindowPanel.module.css'

/**
 * 2D window mockups.
 *
 * The same chrome appears on the device screen in the 3D scene, in the flat
 * export, and here, in the compact live preview above the controls — because
 * all three come from one canvas composer (`composeWindow`), reached through
 * one `FlatPreview` component. This is the same component the standalone 2D
 * tool page (`FlatStudio`) mounts, just given a smaller box: neither the
 * preview nor the export needs the 3D scene at all, which is what keeps this
 * panel fully usable even where WebGL is unavailable.
 */
export function WindowPanel() {
  const config = useAppStore((state) => state.flat)
  const source = useAppStore((state) => state.media.source)
  const filename = useAppStore((state) => state.exportConfig.filename)
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const whileBusy = useBusy()

  const palette = mediaPalette(source)
  const dominant = palette[0] ?? null
  const chrome = config.colorMatch && dominant ? dominant : config.chrome

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
        dominant,
        width: 2400,
        filename: `${filename}-window`,
      })
    })
    if (!result.ok) setError(result.error)
    setBusy(false)
  }

  return (
    <Panel title="Window mockup">
      <FlatPreview config={config} source={source} className={styles.preview} />
      <ControlList controls={windowContentControls} />
      <ControlList controls={windowStyleControls} />
      <ControlList controls={windowContainerControls} />
      <Button
        icon="window"
        size="sm"
        fullWidth
        disabled={busy || (config.style === 'none' && !config.hideMockup)}
        onClick={() => void exportFlat()}
      >
        {busy ? 'Exporting…' : 'Export window PNG'}
      </Button>
      {error && (
        <p className={exportStyles.error} role="alert">
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
