import { wasSpacePanDrag } from '@/features/camera'
import { useAppStore } from '@/state/store'
import { openShortcutsHelp } from './help'
import type { KeyShortcut } from './types'

export type { GestureEntry, KeyShortcut, RegistryEntry, ShortcutGroup } from './types'
export { GESTURES } from './gestures'

const togglePlaying = () =>
  useAppStore.setState((draft) => {
    draft.animation.playing = !draft.animation.playing
  })

const togglePanel = (key: 'sidebarOpen' | 'inspectorOpen') => () =>
  useAppStore.setState((draft) => {
    draft.ui[key] = !draft.ui[key]
  })

/**
 * The single source of truth for every studio KEYBOARD shortcut: what key
 * fires it, how it reads in the help overlay, and what it does. `useShortcuts`
 * dispatches from this list instead of a hand-written `switch`, and
 * `ShortcutsOverlay` renders it directly — so the reference the user sees can
 * never drift from what actually happens on a keypress.
 *
 * Mouse/trackpad gestures and held-key navigation live in `gestures.ts`
 * instead — they are documented, not dispatched, since none of them fit
 * "one keydown, one action". See `GestureEntry`.
 */
export const SHORTCUTS: readonly KeyShortcut[] = [
  {
    id: 'palette-chord',
    kind: 'key',
    group: 'Studio',
    description: 'Open the command palette',
    display: 'Ctrl / Cmd + K',
    key: 'k',
    chord: true,
    run: () => useAppStore.getState().setPaletteOpen(true),
  },
  {
    id: 'palette',
    kind: 'key',
    group: 'Studio',
    description: 'Open the command palette',
    display: '/',
    key: '/',
    run: () => useAppStore.getState().setPaletteOpen(true),
  },
  {
    id: 'frame',
    kind: 'key',
    group: 'Studio',
    description: 'Frame the current device',
    display: 'F',
    key: 'f',
    run: () => useAppStore.getState().frameCurrentDevice(),
  },
  {
    id: 'play',
    kind: 'key',
    group: 'Studio',
    description: 'Play or pause the animation',
    display: 'Space',
    key: ' ',
    // Deferred to release: see `useSpacePan` for the full reasoning. A tap
    // (no drag in between) toggles playback; a hold-and-drag pans instead
    // and does not also toggle it.
    fireOn: 'keyup',
    run: () => {
      if (wasSpacePanDrag()) return
      togglePlaying()
    },
  },
  {
    id: 'sidebar',
    kind: 'key',
    group: 'Studio',
    description: 'Show or hide the device sidebar',
    display: '[',
    key: '[',
    run: togglePanel('sidebarOpen'),
  },
  {
    id: 'inspector',
    kind: 'key',
    group: 'Studio',
    description: 'Show or hide the inspector panel',
    display: ']',
    key: ']',
    run: togglePanel('inspectorOpen'),
  },
  {
    id: 'help',
    kind: 'key',
    group: 'Studio',
    description: 'Show this shortcut reference',
    display: '?',
    key: '?',
    run: openShortcutsHelp,
  },
  {
    id: 'undo',
    kind: 'key',
    group: 'Editing',
    description: 'Undo the last scene change',
    display: 'Ctrl / Cmd + Z',
    key: 'z',
    chord: true,
    run: () => useAppStore.getState().undoScene(),
  },
  {
    id: 'redo-shift',
    kind: 'key',
    group: 'Editing',
    description: 'Redo',
    display: 'Ctrl / Cmd + Shift + Z',
    key: 'z',
    chord: true,
    shift: true,
    run: () => useAppStore.getState().redoScene(),
  },
  {
    id: 'redo',
    kind: 'key',
    group: 'Editing',
    description: 'Redo',
    display: 'Ctrl / Cmd + Y',
    key: 'y',
    chord: true,
    run: () => useAppStore.getState().redoScene(),
  },
]
