import { ControlBindingProvider } from '@/ui/controls'
import { appControlBinding } from '@/state/binding'
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

  return (
    <ControlBindingProvider binding={appControlBinding}>
      <div className={styles.shell}>
        <Toolbar />
        <div className={styles.body}>
          <Sidebar />
          <Viewport />
          <Inspector />
        </div>
      </div>
    </ControlBindingProvider>
  )
}
