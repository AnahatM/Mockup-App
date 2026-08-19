import { Button, Icon, IconButton } from '@/ui'
import { useAppStore } from '@/state/store'
import { PlaybackControls } from './PlaybackControls'
import { ViewportControls } from './ViewportControls'
import styles from './Toolbar.module.css'

/**
 * The studio control bar.
 *
 * It sits *under* the site navbar rather than replacing it, so the app's
 * identity and navigation stay put when you move between the site and the tool.
 * This bar therefore carries only studio actions — theme and site links belong
 * to the navbar above it.
 */
export function Toolbar() {
  const sidebarOpen = useAppStore((state) => state.ui.sidebarOpen)
  const inspectorOpen = useAppStore((state) => state.ui.inspectorOpen)
  const toggleSidebar = useAppStore((state) => state.toggleSidebar)
  const toggleInspector = useAppStore((state) => state.toggleInspector)
  const openPalette = useAppStore((state) => state.setPaletteOpen)
  const setTab = useAppStore((state) => state.setInspectorTab)

  return (
    <div className={styles.toolbar}>
      <div className={styles.cluster}>
        <IconButton
          icon="layers"
          label={sidebarOpen ? 'Hide device rail' : 'Show device rail'}
          size="sm"
          active={sidebarOpen}
          onClick={toggleSidebar}
        />
        <IconButton
          icon="sliders"
          label={inspectorOpen ? 'Hide inspector' : 'Show inspector'}
          size="sm"
          active={inspectorOpen}
          onClick={toggleInspector}
        />
      </div>

      <ViewportControls />
      <PlaybackControls />

      <div className={styles.spacer} />

      <button type="button" className={styles.search} onClick={() => openPalette(true)}>
        <Icon name="target" size={13} />
        <span className={styles.searchLabel}>Search settings…</span>
        <kbd className={styles.kbd}>/</kbd>
      </button>

      <div className={styles.cluster}>
        <IconButton
          icon="save"
          label="Presets"
          size="sm"
          onClick={() => setTab('presets')}
        />
        <Button
          icon="download"
          size="sm"
          variant="primary"
          onClick={() => setTab('export')}
        >
          Export
        </Button>
      </div>
    </div>
  )
}
