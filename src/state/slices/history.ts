import {
  canRedo,
  canUndo,
  current,
  emptyHistory,
  push,
  redo,
  undo,
  type History,
} from '@/lib/history'
import {
  applyScene,
  captureScene,
  defaultSceneState,
  sameScene,
} from '@/features/presets'
import type { SceneState } from '@/features/presets'
import type { SliceCreator } from '../types'

export interface HistorySlice {
  /**
   * Undo history over the *scene* only.
   *
   * Deliberately not the whole store: UI state (which panel is open, how wide
   * the sidebar is) and the loaded media are not things anyone means to undo.
   * Snapshotting exactly what a preset saves keeps the two definitions of "the
   * scene" from drifting apart.
   */
  history: History<SceneState>
  /**
   * Set while an undo or redo is being applied.
   *
   * The recorder watches the store for changes; without this it would see its
   * own undo as a fresh edit and record it, making undo impossible to escape.
   */
  applyingHistory: boolean
  recordHistory: () => void
  undoScene: () => void
  redoScene: () => void
  /** Back to a blank studio, keeping the loaded screenshot. */
  startOver: () => void
}

export const createHistorySlice: SliceCreator<HistorySlice> = (set, get) => ({
  history: emptyHistory(defaultSceneState()),
  applyingHistory: false,

  /** Snapshots the current scene, if it differs from the last recorded one. */
  recordHistory: () => {
    const state = get()
    const snapshot = captureScene(state)
    const last = current(state.history)
    if (last && sameScene(last, snapshot)) return

    set((draft) => {
      draft.history = push(draft.history, snapshot)
    })
  },

  undoScene: () => {
    const state = get()
    if (!canUndo(state.history)) return
    const next = undo(state.history)
    const scene = current(next)
    if (!scene) return
    set((draft) => {
      draft.applyingHistory = true
      draft.history = next
      applyScene(draft, scene)
      draft.applyingHistory = false
    })
  },

  /*
   * Deliberately keeps the media: "start over" means start the *look* again,
   * and making someone re-upload their screenshot to try a different style
   * would be a punishment rather than a reset. Recorded into history, so even
   * this is undoable.
   */
  startOver: () => {
    set((draft) => {
      applyScene(draft, defaultSceneState())
    })
    get().recordHistory()
  },

  redoScene: () => {
    const state = get()
    if (!canRedo(state.history)) return
    const next = redo(state.history)
    const scene = current(next)
    if (!scene) return
    set((draft) => {
      draft.applyingHistory = true
      draft.history = next
      applyScene(draft, scene)
      draft.applyingHistory = false
    })
  },
})
