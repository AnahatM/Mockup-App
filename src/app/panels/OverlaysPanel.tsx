import { Panel } from '@/ui'
import { ControlList } from '@/ui/controls'
import { navigationControls } from './navigationControls'
import { statusBarControls } from './statusBarControls'

/** Per-device screen furniture: status bar, navigation, desktop chrome. */
export function OverlaysPanel() {
  return (
    <>
      <Panel title="Status bar">
        <ControlList controls={statusBarControls} />
      </Panel>
      <Panel title="Navigation">
        <ControlList controls={navigationControls} />
      </Panel>
    </>
  )
}
