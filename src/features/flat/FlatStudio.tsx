import { Dropzone, RecentUploads } from '@/features/media'
import { windowContainerControls } from '@/app/panels/windowContainerControls'
import { windowContentControls } from '@/app/panels/windowControls'
import { windowStyleControls } from '@/app/panels/windowStyleControls'
import { Button, Panel } from '@/ui'
import { ControlBindingProvider, ControlList } from '@/ui/controls'
import { appControlBinding } from '@/state/binding'
import { useAppStore } from '@/state/store'
import { FlatPreview } from './FlatPreview'
import { useFlatExport } from './useFlatExport'
import styles from './FlatStudio.module.css'

/**
 * The 2D window-mockup tool, on its own: no 3D scene, no WebGL, just the
 * canvas compositor and its controls.
 *
 * This is a page body, not a page — the caller supplies the route, the
 * navbar and any page chrome, the same way `StudioPage` wraps `AppShell`.
 * It reuses the studio's own window control schemas (`@/app/panels/window*`)
 * rather than redeclaring them, and mounts the exact same `FlatPreview`
 * component `WindowPanel` uses — one implementation, two places to see it.
 *
 * Because it reuses those schemas it must also supply what they read through:
 * every control resolves its value via the injected `ControlBinding`, and in the
 * studio that provider is `AppShell`. This page has no AppShell, so it provides
 * the binding itself — otherwise the first control throws on mount.
 */
export function FlatStudio() {
  const config = useAppStore((state) => state.flat)
  const source = useAppStore((state) => state.media.source)
  const filename = useAppStore((state) => state.exportConfig.filename)
  const { busy, error, exportWindow } = useFlatExport(config, source, filename)

  return (
    <ControlBindingProvider binding={appControlBinding}>
      <div className={styles.studio}>
        <div className={styles.previewColumn}>
          <FlatPreview config={config} source={source} className={styles.preview} />
        </div>
        <div className={styles.controlsColumn}>
          <Panel title="Screenshot">
            <Dropzone />
            <RecentUploads />
          </Panel>
          <Panel title="Window mockup">
            <ControlList controls={windowContentControls} />
            <ControlList controls={windowStyleControls} />
            <ControlList controls={windowContainerControls} />
          </Panel>
          <Button
            icon="download"
            size="md"
            variant="primary"
            fullWidth
            disabled={busy}
            onClick={() => void exportWindow()}
          >
            {busy ? 'Exporting…' : 'Export window PNG'}
          </Button>
          {error && (
            <p className={styles.error} role="alert">
              {error}
            </p>
          )}
        </div>
      </div>
    </ControlBindingProvider>
  )
}
