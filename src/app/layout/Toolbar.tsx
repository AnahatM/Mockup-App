import { Button, Icon, IconButton } from '@/ui'
import { useAppStore } from '@/state/store'
import { HistoryControls } from './HistoryControls'
import { PlaybackControls } from './PlaybackControls'
import { useCompactStudio } from './useCompactStudio'
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
  const scale = useAppStore((state) => state.exportConfig.scale)
  const transparent = useAppStore((state) => state.exportConfig.transparent)
  const compact = useCompactStudio()

  // On a compact viewport the rail and inspector are full-height overlays, so
  // showing both at once just stacks one over the other. Opening either one
  // there closes the other first; on a wide viewport both stay independent,
  // exactly as before.
  const openSidebar = () => {
    if (compact && !sidebarOpen && inspectorOpen) toggleInspector()
    toggleSidebar()
  }
  const openInspector = () => {
    if (compact && !inspectorOpen && sidebarOpen) toggleSidebar()
    toggleInspector()
  }

  return (
    <div className={styles.toolbar}>
      <div className={styles.cluster}>
        <IconButton
          icon="layers"
          label={sidebarOpen ? 'Hide device rail' : 'Show device rail'}
          size="sm"
          active={sidebarOpen}
          onClick={openSidebar}
        />
        <IconButton
          icon="sliders"
          label={inspectorOpen ? 'Hide inspector' : 'Show inspector'}
          size="sm"
          active={inspectorOpen}
          onClick={openInspector}
        />
      </div>

      <ViewportControls />
      <PlaybackControls />
      <HistoryControls />

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
          <span className={styles.exportMeta}>
            {scale}× · PNG{transparent ? ' · alpha' : ''}
          </span>
        </Button>
      </div>
    </div>
  )
}
