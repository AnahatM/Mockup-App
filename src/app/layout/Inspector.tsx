import { Tabs } from '@/ui'
import { useAppStore } from '@/state/store'
import { INSPECTOR_TABS, type InspectorTab } from '@/state/slices/ui'
import { PANELS } from '../panels/registry'
import styles from './Inspector.module.css'

const TABS = INSPECTOR_TABS.map((value) => ({
  value,
  label: PANELS[value].label,
  icon: PANELS[value].icon,
}))

/** Right column. Its contents come entirely from the panel registry. */
export function Inspector() {
  const open = useAppStore((state) => state.ui.inspectorOpen)
  const tab = useAppStore((state) => state.ui.inspectorTab)
  const setTab = useAppStore((state) => state.setInspectorTab)

  if (!open) return null

  return (
    <aside className={styles.inspector} aria-label="Inspector">
      <Tabs<InspectorTab>
        value={tab}
        onChange={setTab}
        tabs={TABS}
        label="Inspector sections"
      />
      <div className={styles.body}>{PANELS[tab].render()}</div>
    </aside>
  )
}
