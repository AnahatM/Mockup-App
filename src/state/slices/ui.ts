import type { SliceCreator } from '../types'

/** Which inspector tab is showing. Ephemeral — never saved into a preset. */
export const INSPECTOR_TABS = [
  'device',
  'screen',
  'scene',
  'camera',
  'lighting',
  'animation',
  'export',
  'presets',
] as const

export type InspectorTab = (typeof INSPECTOR_TABS)[number]

export interface UiState {
  inspectorTab: InspectorTab
  sidebarOpen: boolean
  inspectorOpen: boolean
}

export interface UiSlice {
  ui: UiState
  setInspectorTab: (tab: InspectorTab) => void
  toggleSidebar: () => void
  toggleInspector: () => void
}

export const createUiSlice: SliceCreator<UiSlice> = (set) => ({
  ui: {
    inspectorTab: 'device',
    sidebarOpen: true,
    inspectorOpen: true,
  },
  setInspectorTab: (tab) =>
    set((draft) => {
      draft.ui.inspectorTab = tab
    }),
  toggleSidebar: () =>
    set((draft) => {
      draft.ui.sidebarOpen = !draft.ui.sidebarOpen
    }),
  toggleInspector: () =>
    set((draft) => {
      draft.ui.inspectorOpen = !draft.ui.inspectorOpen
    }),
})
