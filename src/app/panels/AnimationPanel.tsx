import { Panel } from '@/ui'
import { ControlList } from '@/ui/controls'
import { animationControls } from './motionControls'

/** Motion preset, timing and transport. */
export function AnimationPanel() {
  return (
    <Panel title="Motion">
      <ControlList controls={animationControls} />
    </Panel>
  )
}
