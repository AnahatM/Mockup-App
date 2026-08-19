import { Panel } from '@/ui'
import { ControlList } from '@/ui/controls'
import { renderControls } from './renderControls'
import { shadowControls } from './shadowControls'

/** Shadow, exposure and post-processing. */
export function RenderPanel() {
  return (
    <>
      <Panel title="Shadow">
        <ControlList controls={shadowControls} />
      </Panel>
      <Panel title="Render">
        <ControlList controls={renderControls} />
      </Panel>
    </>
  )
}
