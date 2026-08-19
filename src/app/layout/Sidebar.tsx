import { DeviceRail } from '@/features/devices'
import { useAppStore } from '@/state/store'
import styles from './Sidebar.module.css'

/** Left rail — the device picker. */
export function Sidebar() {
  const open = useAppStore((state) => state.ui.sidebarOpen)
  if (!open) return null

  return (
    <aside className={styles.sidebar} aria-label="Devices">
      <DeviceRail />
    </aside>
  )
}
