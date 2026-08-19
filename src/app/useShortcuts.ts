import { useEffect } from 'react'
import { useAppStore } from '@/state/store'

/**
 * Editor-style keyboard shortcuts.
 *
 * Ignored while a text field has focus, so typing a preset name or a window
 * title never triggers an action. Modifier combinations are left alone so the
 * browser's own shortcuts keep working.
 */
export function useShortcuts(): void {
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.metaKey || event.ctrlKey || event.altKey) return
      if (isTyping(event.target)) return

      const store = useAppStore.getState()

      switch (event.key.toLowerCase()) {
        case 'f':
          store.frameCurrentDevice()
          break
        case ' ':
          event.preventDefault()
          useAppStore.setState((draft) => {
            draft.animation.playing = !draft.animation.playing
          })
          break
        case '[':
          useAppStore.setState((draft) => {
            draft.ui.sidebarOpen = !draft.ui.sidebarOpen
          })
          break
        case ']':
          useAppStore.setState((draft) => {
            draft.ui.inspectorOpen = !draft.ui.inspectorOpen
          })
          break
        default:
          break
      }
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [])
}

function isTyping(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false
  return (
    target.isContentEditable ||
    target instanceof HTMLInputElement ||
    target instanceof HTMLTextAreaElement ||
    target instanceof HTMLSelectElement
  )
}
