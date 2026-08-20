import { Panel } from '@/ui'
import { ControlList } from '@/ui/controls'
import { useAppStore } from '@/state/store'
import { finishControls, materialControls } from './deviceFinishControls'
import { detailControls, placementControls } from './devicePlacementControls'
import { importControls, importedScreenControls } from './deviceImportControls'

/** Model, finish, materials, orientation, and which details are shown. */
export function DevicePanel() {
  const imported = useAppStore((state) => state.device.glb !== null)

  return (
    <>
      <Panel title="Model">
        <ControlList controls={importControls} />
      </Panel>
      {imported ? (
        <Panel title="Screen">
          <ControlList controls={importedScreenControls} />
        </Panel>
      ) : (
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
        </>
      )}
      <Panel title="Placement">
        <ControlList controls={placementControls} />
      </Panel>
    </>
  )
}
