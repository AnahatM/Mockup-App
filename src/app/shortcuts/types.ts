/** Which section of the `?` overlay an entry appears under. */
export type ShortcutGroup = 'Studio' | 'Editing' | 'Viewport'

interface EntryBase {
  id: string
  /** What it does, shown in the help overlay. */
  description: string
  /** How it reads on screen, e.g. "F" or "Ctrl / Cmd + K" or "Drag". */
  display: string
  group: ShortcutGroup
}

export interface KeyShortcut extends EntryBase {
  kind: 'key'
  /** The bare `event.key`, lower-cased, this fires on. */
  key: string
  /** Requires Ctrl/Cmd, fires even while typing, and ignores other modifiers. */
  chord?: true
  /**
   * Requires Shift as well.
   *
   * Needed because undo and redo share a key: without matching Shift exactly,
   * Ctrl+Shift+Z would also satisfy Ctrl+Z and undo instead of redoing.
   */
  shift?: true
  /**
   * Which event actually dispatches `run`. Defaults to keydown.
   *
   * Space is the one shortcut that uses `'keyup'`: it doubles as "tap to
   * play/pause" and "hold + drag to pan" (`useSpacePan`), and those can only
   * be told apart once the key comes back up — see the `play` entry in
   * `registry.ts`.
   */
  fireOn?: 'keydown' | 'keyup'
  run: () => void
}

/**
 * Documented but not dispatched: a mouse/trackpad gesture (drag, scroll) or
 * a continuously-held navigation key that does not fit "one keydown, one
 * action" — WASD is held for as long as it is held, not pressed once.
 *
 * These exist purely so the `?` overlay can show the full navigation
 * picture. `useShortcuts` never touches this kind — there is no `run` to
 * dispatch, and faking one that did nothing would be worse than not having
 * it, since it would look wired up when it is not.
 */
export interface GestureEntry extends EntryBase {
  kind: 'gesture'
}

export type RegistryEntry = KeyShortcut | GestureEntry
