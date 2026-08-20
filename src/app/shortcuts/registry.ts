import { useAppStore } from '@/state/store'
import { openShortcutsHelp } from './help'

export interface ShortcutEntry {
  id: string
  /** What pressing it does, shown in the help overlay. */
  description: string
  /** How the combo reads on screen, e.g. "F" or "Ctrl / Cmd + K". */
  display: string
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
}

const togglePlaying = () =>
  useAppStore.setState((draft) => {
    draft.animation.playing = !draft.animation.playing
  })

const togglePanel = (key: 'sidebarOpen' | 'inspectorOpen') => () =>
  useAppStore.setState((draft) => {
    draft.ui[key] = !draft.ui[key]
  })

/**
 * The single source of truth for every studio keyboard shortcut: what key
 * fires it, how it reads in the help overlay, and what it does. `useShortcuts`
 * dispatches from this list instead of a hand-written `switch`, and
 * `ShortcutsOverlay` renders it directly — so the reference the user sees can
 * never drift from what actually happens on a keypress.
 */
export const SHORTCUTS: ReadonlyArray<ShortcutEntry & { run: () => void }> = [
  {
    id: 'palette-chord',
    description: 'Open the command palette',
    display: 'Ctrl / Cmd + K',
    key: 'k',
    chord: true,
    run: () => useAppStore.getState().setPaletteOpen(true),
  },
  {
    id: 'palette',
    description: 'Open the command palette',
    display: '/',
    key: '/',
    run: () => useAppStore.getState().setPaletteOpen(true),
  },
  {
    id: 'frame',
    description: 'Frame the current device',
    display: 'F',
    key: 'f',
    run: () => useAppStore.getState().frameCurrentDevice(),
  },
  {
    id: 'play',
    description: 'Play or pause the animation',
    display: 'Space',
    key: ' ',
    run: togglePlaying,
  },
  {
    id: 'sidebar',
    description: 'Show or hide the device sidebar',
    display: '[',
    key: '[',
    run: togglePanel('sidebarOpen'),
  },
  {
    id: 'inspector',
    description: 'Show or hide the inspector panel',
    display: ']',
    key: ']',
    run: togglePanel('inspectorOpen'),
  },
  {
    id: 'undo',
    description: 'Undo the last scene change',
    display: 'Ctrl / Cmd + Z',
    key: 'z',
    chord: true,
    run: () => useAppStore.getState().undoScene(),
  },
  {
    id: 'redo-shift',
    description: 'Redo',
    display: 'Ctrl / Cmd + Shift + Z',
    key: 'z',
    chord: true,
    shift: true,
    run: () => useAppStore.getState().redoScene(),
  },
  {
    id: 'redo',
    description: 'Redo',
    display: 'Ctrl / Cmd + Y',
    key: 'y',
    chord: true,
    run: () => useAppStore.getState().redoScene(),
  },
  {
    id: 'help',
    description: 'Show this shortcut reference',
    display: '?',
    key: '?',
    run: openShortcutsHelp,
  },
]
