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
  /** Panel widths in px, so the layout can be dragged to taste. */
  sidebarWidth: number
  inspectorWidth: number
  /**
   * How many async operations are in flight.
   *
   * A counter rather than a boolean: several things load at once — a texture, an
   * environment map, a lazily-loaded page — and a boolean would let whichever
   * finished first switch the indicator off while the others were still running.
   */
  busyCount: number
}

export interface UiSlice {
  ui: UiState
  setInspectorTab: (tab: InspectorTab) => void
  toggleSidebar: () => void
  toggleInspector: () => void
  setSidebarWidth: (width: number) => void
  setInspectorWidth: (width: number) => void
  beginBusy: () => void
  endBusy: () => void
}

export const createUiSlice: SliceCreator<UiSlice> = (set) => ({
  ui: {
    inspectorTab: 'device',
    sidebarOpen: true,
    inspectorOpen: true,
    sidebarWidth: 208,
    inspectorWidth: 304,
    busyCount: 0,
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

  setSidebarWidth: (width) =>
    set((draft) => {
      draft.ui.sidebarWidth = clampWidth(width, 150, 420)
    }),

  setInspectorWidth: (width) =>
    set((draft) => {
      draft.ui.inspectorWidth = clampWidth(width, 240, 560)
    }),

  beginBusy: () =>
    set((draft) => {
      draft.ui.busyCount += 1
    }),

  /** Never goes below zero, so a stray extra end cannot wedge the bar off. */
  endBusy: () =>
    set((draft) => {
      draft.ui.busyCount = Math.max(0, draft.ui.busyCount - 1)
    }),
})

const clampWidth = (value: number, min: number, max: number): number =>
  Math.round(Math.min(Math.max(value, min), max))
