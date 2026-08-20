import { useEffect, useRef } from 'react'
import { useAppStore } from '@/state/store'
import { useCompactStudio } from './useCompactStudio'

/**
 * Both the device rail and the inspector default to open (see
 * state/slices/ui.ts) — correct for the desktop three-column layout, where
 * that is just how the app looks. On a compact viewport they are full-height
 * overlays instead, so that same default would open both stacked on top of
 * each other, hiding the viewport completely on first load — exactly what the
 * overlay treatment exists to avoid.
 *
 * This closes both, once, the first time the studio is found to be compact —
 * a `ref` guard rather than reacting to every `compact` change, so resizing a
 * desktop window through the breakpoint does not repeatedly slam shut a panel
 * the user just opened.
 */
export function useCollapseOverlaysOnMount(): void {
  const compact = useCompactStudio()
  const sidebarOpen = useAppStore((state) => state.ui.sidebarOpen)
  const inspectorOpen = useAppStore((state) => state.ui.inspectorOpen)
  const toggleSidebar = useAppStore((state) => state.toggleSidebar)
  const toggleInspector = useAppStore((state) => state.toggleInspector)
  const handled = useRef(false)

  useEffect(() => {
    if (!compact || handled.current) return
    handled.current = true
    if (sidebarOpen) toggleSidebar()
    if (inspectorOpen) toggleInspector()
    // Deliberately only depends on `compact`: the intent is "the first time
    // this mounts compact", not "whenever open state changes while compact".
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [compact])
}
