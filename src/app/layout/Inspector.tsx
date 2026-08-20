import { ResizeHandle, Tabs } from '@/ui'
import { useAppStore } from '@/state/store'
import { INSPECTOR_TABS, type InspectorTab } from '@/state/slices/ui'
import { PANELS } from '../panels/registry'
import { useCompactStudio } from './useCompactStudio'
import styles from './Inspector.module.css'

const TABS = INSPECTOR_TABS.map((value) => ({
  value,
  label: PANELS[value].label,
  icon: PANELS[value].icon,
}))

/**
 * Right column. Its contents come entirely from the panel registry.
 *
 * Below the `compact` breakpoint this becomes a full-height overlay with a
 * scrim behind it — see Sidebar.tsx, which does the same thing for the
 * symmetric reason.
 */
export function Inspector() {
  const open = useAppStore((state) => state.ui.inspectorOpen)
  const tab = useAppStore((state) => state.ui.inspectorTab)
  const setTab = useAppStore((state) => state.setInspectorTab)
  const width = useAppStore((state) => state.ui.inspectorWidth)
  const setWidth = useAppStore((state) => state.setInspectorWidth)
  const close = useAppStore((state) => state.toggleInspector)
  const compact = useCompactStudio()

  if (!open) return null

  return (
    <>
      {compact && (
        <button
          type="button"
          className={styles.scrim}
          aria-label="Close inspector"
          onClick={close}
        />
      )}
      {!compact && (
        <ResizeHandle
          side="left"
          width={width}
          onResize={setWidth}
          label="Resize inspector"
        />
      )}
      <aside
        className={styles.inspector}
        style={{ width: `${width}px` }}
        aria-label="Inspector"
      >
        <Tabs<InspectorTab>
          value={tab}
          onChange={setTab}
          tabs={TABS}
          label="Inspector sections"
          wrap
        />
        <div className={styles.body}>{PANELS[tab].render()}</div>
      </aside>
    </>
  )
}
