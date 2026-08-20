import { useEffect } from 'react'
import { FLY_NAV_KEYS } from '@/features/camera'
import { useAppStore } from '@/state/store'
import { SHORTCUTS, type KeyShortcut } from './shortcuts/registry'

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
 * included, to be worth having. Fly mode's own WASD/Q/E/R/F are a second
 * exception in the other direction: while flying, those keys belong to
 * `useFlyKeyboard`, not to whatever single-letter shortcut happens to reuse
 * one of them (`F` also frames the device) — see `FLY_NAV_KEYS`.
 */
export function useShortcuts(): void {
  useEffect(() => {
    // Set by a `fireOn: 'keyup'` entry's keydown, consumed by the matching
    // keyup — see `KeyShortcut.fireOn` for why `play` needs this at all.
    const pending = { id: null as string | null }

    const onKeyDown = (event: KeyboardEvent) => {
      const chord = SHORTCUTS.find((s) => s.chord && matchesChord(event, s))
      if (chord) {
        event.preventDefault()
        chord.run()
        return
      }

      if (event.metaKey || event.ctrlKey || event.altKey) return
      if (isTyping(event.target)) return
      if (isFlyNavKey(event.key)) return

      const plain = SHORTCUTS.find((s) => !s.chord && s.key === event.key.toLowerCase())
      if (!plain) return
      event.preventDefault()
      if (plain.fireOn === 'keyup') {
        pending.id = plain.id
        return
      }
      plain.run()
    }

    const onKeyUp = (event: KeyboardEvent) => {
      if (!pending.id) return
      const plain = SHORTCUTS.find((s) => s.id === pending.id)
      if (!plain || plain.key !== event.key.toLowerCase()) return
      pending.id = null
      plain.run()
    }

    // A key can go up outside the window (alt-tab mid-press); without this a
    // pending keyup-fired shortcut could fire much later, on an unrelated
    // release of the same key.
    const onBlur = () => {
      pending.id = null
    }

    window.addEventListener('keydown', onKeyDown)
    window.addEventListener('keyup', onKeyUp)
    window.addEventListener('blur', onBlur)
    return () => {
      window.removeEventListener('keydown', onKeyDown)
      window.removeEventListener('keyup', onKeyUp)
      window.removeEventListener('blur', onBlur)
    }
  }, [])
}

const isFlyNavKey = (key: string): boolean =>
  useAppStore.getState().camera.mode === 'fly' && FLY_NAV_KEYS.has(key.toLowerCase())

const matchesChord = (event: KeyboardEvent, entry: KeyShortcut): boolean =>
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
