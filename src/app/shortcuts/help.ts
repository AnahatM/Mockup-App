import { create } from 'zustand'

interface HelpState {
  open: boolean
}

/**
 * Visibility for the shortcuts help overlay. A store of its own rather than a
 * field on `state/store.ts`, because it is pure UI state scoped to one
 * dev-facing overlay — it does not belong to the mockup being built, and does
 * not need Immer, persistence, or anything else the main store carries.
 */
const useHelpStore = create<HelpState>(() => ({ open: false }))

export const useShortcutsHelpOpen = (): boolean => useHelpStore((state) => state.open)
export const openShortcutsHelp = (): void => useHelpStore.setState({ open: true })
export const closeShortcutsHelp = (): void => useHelpStore.setState({ open: false })
