import { Button, Panel } from '@/ui'
import { ControlList } from '@/ui/controls'
import { LayoutGallery, ScreenshotAssign, useShowcaseExport } from '@/features/showcase'
import { useAppStore } from '@/state/store'
import { modeControls, textControls } from './showcaseControls'
import styles from './ExportPanel.module.css'

/** App Store screenshot mode: a multi-device composition with a headline. */
export function ShowcasePanel() {
  const enabled = useAppStore((state) => state.showcase.enabled)
  const { busy, error, exportShowcase } = useShowcaseExport()

  return (
    <>
      <Panel title="Mode">
        <ControlList controls={modeControls} />
      </Panel>

      {enabled && (
        <>
          <Panel title="Layout">
            <LayoutGallery />
          </Panel>

          <Panel title="Screenshots" collapsible defaultOpen={false}>
            <ScreenshotAssign />
          </Panel>

          <Panel title="Headline">
            <ControlList controls={textControls} />
          </Panel>

          <Panel title="Export">
            <p className={styles.note}>
              Uses the size, scale and filename from the Export tab.
            </p>
            <Button
              icon="download"
              size="md"
              variant="primary"
              fullWidth
              disabled={busy}
              onClick={() => void exportShowcase()}
            >
              {busy ? 'Composing…' : 'Export showcase PNG'}
            </Button>
            {error && (
              <p className={styles.error} role="alert">
                {error}
              </p>
            )}
          </Panel>
        </>
      )}
    </>
  )
}
