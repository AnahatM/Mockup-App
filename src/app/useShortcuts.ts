import { useEffect } from 'react'
import { useAppStore } from '@/state/store'

/**
 * Editor-style keyboard shortcuts.
 *
 * Ignored while a text field has focus, so typing a preset name or a window
 * title never triggers an action. Modifier combinations are left alone so the
 * browser's own shortcuts keep working — the one exception is the search
 * shortcut, which has to work from anywhere to be worth having.
 */
export function useShortcuts(): void {
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (isSearchChord(event)) {
        event.preventDefault()
        useAppStore.getState().setPaletteOpen(true)
        return
      }
      if (event.metaKey || event.ctrlKey || event.altKey) return
      if (isTyping(event.target)) return
      if (handleKey(event.key.toLowerCase())) event.preventDefault()
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [])
}

const isSearchChord = (event: KeyboardEvent): boolean =>
  (event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k'

/** Returns whether the key was handled, so the caller owns preventDefault. */
function handleKey(key: string): boolean {
  const store = useAppStore.getState()

  switch (key) {
    case '/':
      store.setPaletteOpen(true)
      return true
    case 'f':
      store.frameCurrentDevice()
      return true
    case ' ':
      toggle('playing')
      return true
    case '[':
      togglePanel('sidebarOpen')
      return true
    case ']':
      togglePanel('inspectorOpen')
      return true
    default:
      return false
  }
}

const toggle = (key: 'playing') =>
  useAppStore.setState((draft) => {
    draft.animation[key] = !draft.animation[key]
  })

const togglePanel = (key: 'sidebarOpen' | 'inspectorOpen') =>
  useAppStore.setState((draft) => {
    draft.ui[key] = !draft.ui[key]
  })

function isTyping(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false
  return (
    target.isContentEditable ||
    target instanceof HTMLInputElement ||
    target instanceof HTMLTextAreaElement ||
    target instanceof HTMLSelectElement
  )
}
