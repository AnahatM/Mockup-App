import { ThemeSwitch } from '@/features/theme'
import { Button, Icon, IconButton } from '@/ui'
import { useAppStore } from '@/state/store'
import styles from './Toolbar.module.css'

/** Top bar: identity on the left, panel toggles and global actions on the right. */
export function Toolbar() {
  const sidebarOpen = useAppStore((state) => state.ui.sidebarOpen)
  const inspectorOpen = useAppStore((state) => state.ui.inspectorOpen)
  const toggleSidebar = useAppStore((state) => state.toggleSidebar)
  const toggleInspector = useAppStore((state) => state.toggleInspector)

  return (
    <header className={styles.toolbar}>
      <div className={styles.group}>
        <IconButton
          icon="layers"
          label={sidebarOpen ? 'Hide device rail' : 'Show device rail'}
          size="sm"
          active={sidebarOpen}
          onClick={toggleSidebar}
        />
        <span className={styles.brand}>
          <Icon name="phone" size={14} className={styles.brandIcon} />
          Mockup Studio
        </span>
      </div>

      <div className={styles.group}>
        <ThemeSwitch className={styles.theme} />
        <Button icon="download" size="sm" variant="primary" disabled>
          Export
        </Button>
        <IconButton
          icon="sliders"
          label={inspectorOpen ? 'Hide inspector' : 'Show inspector'}
          size="sm"
          active={inspectorOpen}
          onClick={toggleInspector}
        />
      </div>
    </header>
  )
}
