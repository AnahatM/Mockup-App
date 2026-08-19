import { DeviceRail } from '@/features/devices'
import { ResizeHandle } from '@/ui'
import { useAppStore } from '@/state/store'
import styles from './Sidebar.module.css'

/** Left rail — the device picker, with a draggable right edge. */
export function Sidebar() {
  const open = useAppStore((state) => state.ui.sidebarOpen)
  const width = useAppStore((state) => state.ui.sidebarWidth)
  const setWidth = useAppStore((state) => state.setSidebarWidth)

  if (!open) return null

  return (
    <>
      <aside
        className={styles.sidebar}
        style={{ width: `${width}px` }}
        aria-label="Devices"
      >
        <DeviceRail />
      </aside>
      <ResizeHandle
        side="right"
        width={width}
        onResize={setWidth}
        label="Resize device rail"
      />
    </>
  )
}
