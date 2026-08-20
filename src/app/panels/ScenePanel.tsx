import { Panel } from '@/ui'
import { ControlList } from '@/ui/controls'
import { backdropControls, pedestalControls } from './sceneBackdropControls'
import { pedestalTextureControls } from './pedestalTextureControls'
import { structureControls } from './structureControls'
import {
  cycloramaTextureControls,
  structureFinishControls,
  structureTextureControls,
} from './structureSurfaceControls'

/**
 * Backdrop and plinth.
 *
 * Note what a panel is: a list of declarations rendered by one component. No JSX
 * per control, no manual wiring — adding a knob is one entry in the array.
 */
export function ScenePanel() {
  return (
    <>
      <Panel title="Backdrop">
        <ControlList controls={backdropControls} />
      </Panel>
      <Panel title="Backdrop texture">
        <ControlList controls={cycloramaTextureControls} />
      </Panel>
      <Panel title="Environment">
        <ControlList controls={structureControls} />
      </Panel>
      <Panel title="Environment finish">
        <ControlList controls={structureFinishControls} />
      </Panel>
      <Panel title="Environment texture">
        <ControlList controls={structureTextureControls} />
      </Panel>
      <Panel title="Pedestal">
        <ControlList controls={pedestalControls} />
      </Panel>
      <Panel title="Pedestal texture">
        <ControlList controls={pedestalTextureControls} />
      </Panel>
    </>
  )
}
