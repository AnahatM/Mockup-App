import { ControlBindingProvider, HighlightContext } from '@/ui/controls'
import { CommandPalette } from '@/features/search'
import { appControlBinding } from '@/state/binding'
import { useHighlightFade } from '../useHighlightFade'
import { useHistoryRecorder, useHistoryShortcuts } from '../useHistoryRecorder'
import { useShortcuts } from '../useShortcuts'
import { Toolbar } from './Toolbar'
import { Sidebar } from './Sidebar'
import { Viewport } from './Viewport'
import { Inspector } from './Inspector'
import styles from './AppShell.module.css'

/**
 * The application frame: a quiet toolbar, a device rail, the viewport, and the
 * inspector. Composition only — every piece of logic lives in its own module.
 */
export function AppShell() {
  useShortcuts()
  useHistoryRecorder()
  useHistoryShortcuts()
  const highlight = useHighlightFade()

  return (
    <ControlBindingProvider binding={appControlBinding}>
      <HighlightContext.Provider value={highlight}>
        <div className={styles.shell}>
          <Toolbar />
          <div className={styles.body}>
            <Sidebar />
            <Viewport />
            <Inspector />
          </div>
        </div>
        <CommandPalette />
      </HighlightContext.Provider>
    </ControlBindingProvider>
  )
}
