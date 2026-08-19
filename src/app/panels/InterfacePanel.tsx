import { Panel } from '@/ui'
import { ControlList, toggle, type Control } from '@/ui/controls'
import type { AppState } from '@/state/types'

/**
 * Interface preferences.
 *
 * Also the first real consumer of the schema-driven control system: these are
 * plain declarations with typed accessors, and the ControlList renders them.
 */
const interfaceControls: readonly Control<AppState>[] = [
  toggle({
    label: 'Device rail',
    hint: 'Show the device library on the left.',
    select: (state) => state.ui.sidebarOpen,
    update: (draft, value) => {
      draft.ui.sidebarOpen = value
    },
  }),
]

export function InterfacePanel() {
  return (
    <Panel title="Interface">
      <ControlList controls={interfaceControls} />
    </Panel>
  )
}
