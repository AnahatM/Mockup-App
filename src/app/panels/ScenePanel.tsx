import { Panel } from '@/ui'
import { ControlList } from '@/ui/controls'
import { backdropControls, pedestalControls } from './sceneBackdropControls'
import { pedestalTextureControls } from './pedestalTextureControls'

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
      <Panel title="Pedestal">
        <ControlList controls={pedestalControls} />
      </Panel>
      <Panel title="Pedestal texture">
        <ControlList controls={pedestalTextureControls} />
      </Panel>
    </>
  )
}
