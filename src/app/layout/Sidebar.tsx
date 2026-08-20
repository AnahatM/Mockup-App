import { DeviceRail } from '@/features/devices'
import { ResizeHandle } from '@/ui'
import { useAppStore } from '@/state/store'
import { useCompactStudio } from './useCompactStudio'
import styles from './Sidebar.module.css'

/**
 * Left rail — the device picker, with a draggable right edge.
 *
 * Below the `compact` breakpoint there is no room for a fixed column, so this
 * becomes a full-height overlay with a scrim behind it instead: the resize
 * handle (dragging a width on a phone is not a gesture anyone reaches for)
 * gives way to a tap-outside-to-close scrim.
 */
export function Sidebar() {
  const open = useAppStore((state) => state.ui.sidebarOpen)
  const width = useAppStore((state) => state.ui.sidebarWidth)
  const setWidth = useAppStore((state) => state.setSidebarWidth)
  const close = useAppStore((state) => state.toggleSidebar)
  const compact = useCompactStudio()

  if (!open) return null

  return (
    <>
      {compact && (
        <button
          type="button"
          className={styles.scrim}
          aria-label="Close device rail"
          onClick={close}
        />
      )}
      <aside
        className={styles.sidebar}
        style={{ width: `${width}px` }}
        aria-label="Devices"
      >
        <DeviceRail />
      </aside>
      {!compact && (
        <ResizeHandle
          side="right"
          width={width}
          onResize={setWidth}
          label="Resize device rail"
        />
      )}
    </>
  )
}
