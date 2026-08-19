import { Panel } from '@/ui'
import { ControlList } from '@/ui/controls'
import { finishControls, materialControls } from './deviceFinishControls'
import { detailControls, placementControls } from './devicePlacementControls'

/** Model, finish, materials, orientation, and which details are shown. */
export function DevicePanel() {
  return (
    <>
      <Panel title="Finish">
        <ControlList controls={finishControls} />
      </Panel>
      <Panel title="Materials">
        <ControlList controls={materialControls} />
      </Panel>
      <Panel title="Details">
        <ControlList controls={detailControls} />
      </Panel>
      <Panel title="Placement">
        <ControlList controls={placementControls} />
      </Panel>
    </>
  )
}
