import { useEffect } from 'react'
import { SHORTCUTS, type ShortcutEntry } from './shortcuts/registry'

/**
 * Editor-style keyboard shortcuts.
 *
 * Dispatches from `SHORTCUTS` (see `shortcuts/registry.ts`) rather than a
 * hand-written `switch`, so the list `ShortcutsOverlay` shows can never say
 * something this handler does not actually do.
 *
 * Plain-key shortcuts are ignored while a text field has focus, so typing a
 * preset name or a window title never triggers an action, and modifier
 * combinations are left alone so the browser's own shortcuts keep working.
 * Chord shortcuts are the one exception — they fire from anywhere, typing
 * included, to be worth having.
 */
export function useShortcuts(): void {
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const chord = SHORTCUTS.find((s) => s.chord && matchesChord(event, s))
      if (chord) {
        event.preventDefault()
        chord.run()
        return
      }

      if (event.metaKey || event.ctrlKey || event.altKey) return
      if (isTyping(event.target)) return

      const plain = SHORTCUTS.find((s) => !s.chord && s.key === event.key.toLowerCase())
      if (plain) {
        event.preventDefault()
        plain.run()
      }
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [])
}

const matchesChord = (event: KeyboardEvent, entry: ShortcutEntry): boolean =>
  (event.metaKey || event.ctrlKey) &&
  event.key.toLowerCase() === entry.key &&
  // Exact, not "at least": undo and redo share a key and differ only by Shift.
  event.shiftKey === (entry.shift ?? false)

function isTyping(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false
  return (
    target.isContentEditable ||
    target instanceof HTMLInputElement ||
    target instanceof HTMLTextAreaElement ||
    target instanceof HTMLSelectElement
  )
}
