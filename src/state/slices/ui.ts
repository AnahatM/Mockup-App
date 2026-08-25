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
  'showcase',
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
  /** The command palette. Ephemeral, never saved into a preset. */
  paletteOpen: boolean
  /**
   * Label of a setting to flash after a search result took the user to it.
   *
   * Jumping to the right panel is not enough — a panel can hold thirty controls,
   * and finding the one you searched for by eye defeats the point of searching.
   */
  highlight: string | null
  /**
   * Show the light gizmos — the icons marking where each light sits and which
   * way it faces.
   *
   * View state, not scene config: it is an editing aid, so it must never be
   * captured into a preset or appear in an export.
   */
  showLightGizmos: boolean
  /**
   * Orientation gizmo in the corner of the viewport.
   *
   * View state for the same reason the light markers are: an editing aid that
   * must never reach a preset. Exports already strip it (`axisGizmoGuard`), but
   * until this existed there was no way to get a clean viewport on *screen* —
   * which is what you want while judging a composition, and what a screenshot
   * of the app needs.
   */
  showAxisGizmo: boolean
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
  setPaletteOpen: (open: boolean) => void
  focusSetting: (tab: InspectorTab, label: string) => void
  clearHighlight: () => void
  toggleLightGizmos: () => void
  toggleAxisGizmo: () => void
}

export const createUiSlice: SliceCreator<UiSlice> = (set) => ({
  ui: {
    inspectorTab: 'device',
    sidebarOpen: true,
    inspectorOpen: true,
    sidebarWidth: 208,
    inspectorWidth: 304,
    busyCount: 0,
    paletteOpen: false,
    highlight: null,
    showLightGizmos: false,
    showAxisGizmo: true,
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

  setPaletteOpen: (open) =>
    set((draft) => {
      draft.ui.paletteOpen = open
    }),

  /** Opens the panel a setting lives in, reveals it, and marks it for a flash. */
  focusSetting: (tab, label) =>
    set((draft) => {
      draft.ui.inspectorTab = tab
      draft.ui.inspectorOpen = true
      draft.ui.paletteOpen = false
      draft.ui.highlight = label
    }),

  clearHighlight: () =>
    set((draft) => {
      draft.ui.highlight = null
    }),

  toggleLightGizmos: () =>
    set((draft) => {
      draft.ui.showLightGizmos = !draft.ui.showLightGizmos
    }),

  toggleAxisGizmo: () =>
    set((draft) => {
      draft.ui.showAxisGizmo = !draft.ui.showAxisGizmo
    }),
})

const clampWidth = (value: number, min: number, max: number): number =>
  Math.round(Math.min(Math.max(value, min), max))
