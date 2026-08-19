import { Button, Panel } from '@/ui'
import { ControlList } from '@/ui/controls'
import { useAppStore } from '@/state/store'
import { framingControls } from './cameraFramingControls'
import { navigationControls } from './cameraNavigationControls'
import styles from './CameraPanel.module.css'

/** Framing and viewport navigation. */
export function CameraPanel() {
  const frameDevice = useAppStore((state) => state.frameCurrentDevice)

  return (
    <>
      <Panel title="Framing">
        <ControlList controls={framingControls} />
        <Button icon="camera" size="sm" fullWidth onClick={frameDevice}>
          Frame device
        </Button>
      </Panel>
      <Panel title="Navigation" defaultOpen={false}>
        <p className={styles.help}>
          Orbit: drag to turn · right or middle drag to pan · scroll to zoom. Fly: WASD
          to move · R and F for height · drag to look.
        </p>
        <ControlList controls={navigationControls} />
      </Panel>
    </>
  )
}
