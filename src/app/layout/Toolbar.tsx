import { Link } from 'react-router-dom'
import { ThemeSwitch } from '@/features/theme'
import { Button, Icon, IconButton } from '@/ui'
import { useAppStore } from '@/state/store'
import { ROUTES } from '../routes'
import styles from './Toolbar.module.css'

/** Top bar: identity on the left, panel toggles and global actions on the right. */
export function Toolbar() {
  const sidebarOpen = useAppStore((state) => state.ui.sidebarOpen)
  const inspectorOpen = useAppStore((state) => state.ui.inspectorOpen)
  const toggleSidebar = useAppStore((state) => state.toggleSidebar)
  const toggleInspector = useAppStore((state) => state.toggleInspector)
  const openPalette = useAppStore((state) => state.setPaletteOpen)
  const setTab = useAppStore((state) => state.setInspectorTab)

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
        <Link to={ROUTES.home} className={styles.brand}>
          <Icon name="phone" size={14} className={styles.brandIcon} />
          Mockup Studio
        </Link>
      </div>

      <button type="button" className={styles.search} onClick={() => openPalette(true)}>
        <Icon name="sliders" size={13} />
        <span className={styles.searchLabel}>Search settings…</span>
        <kbd className={styles.kbd}>/</kbd>
      </button>

      <div className={styles.group}>
        <ThemeSwitch className={styles.theme} />
        <Button
          icon="download"
          size="sm"
          variant="primary"
          onClick={() => setTab('export')}
        >
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
