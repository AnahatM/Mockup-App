import { Button, Panel } from '@/ui'
import { ControlList } from '@/ui/controls'
import { isRecordingSupported, useCapture } from '@/features/capture'
import { imageControls, videoControls } from './exportControls'
import styles from './ExportPanel.module.css'

/** Still and video export. */
export function ExportPanel() {
  const { busy, progress, error, exportPng, copyPng, recordVideo } = useCapture()
  const canRecord = isRecordingSupported()

  return (
    <>
      <Panel title="Image">
        <ControlList controls={imageControls} />
        <div className={styles.actions}>
          <Button
            icon="download"
            size="md"
            variant="primary"
            fullWidth
            disabled={busy}
            onClick={() => void exportPng()}
          >
            {busy ? 'Working…' : 'Export PNG'}
          </Button>
          <Button
            icon="copy"
            size="md"
            fullWidth
            disabled={busy}
            onClick={() => void copyPng()}
          >
            Copy
          </Button>
        </div>
      </Panel>

      <Panel title="Video">
        <ControlList controls={videoControls} />
        <Button
          icon="film"
          size="md"
          fullWidth
          disabled={busy || !canRecord}
          onClick={() => void recordVideo()}
        >
          {busy && progress > 0
            ? `Recording ${Math.round(progress * 100)}%`
            : 'Record WebM'}
        </Button>
        {!canRecord && (
          <p className={styles.note}>
            This browser cannot record WebM. Still export is unaffected.
          </p>
        )}
      </Panel>

      {error && (
        <p className={styles.error} role="alert">
          {error}
        </p>
      )}
    </>
  )
}
