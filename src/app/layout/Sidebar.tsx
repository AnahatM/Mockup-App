import { EmptyState } from '@/ui'
import { useAppStore } from '@/state/store'
import styles from './Sidebar.module.css'

/**
 * Left rail — the device picker. Populated in P3 once the device catalogue and
 * its spec system exist; until then it states what it will hold.
 */
export function Sidebar() {
  const open = useAppStore((state) => state.ui.sidebarOpen)
  if (!open) return null

  return (
    <aside className={styles.sidebar} aria-label="Devices">
      <EmptyState
        icon="phone"
        title="Device library"
        description="Phones, tablets, laptops and watches appear here once the device catalogue lands."
      />
    </aside>
  )
}
