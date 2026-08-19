import { create } from 'zustand'
import { immer } from 'zustand/middleware/immer'
import { createUiSlice } from './slices/ui'
import type { AppState } from './types'

/**
 * The single application store, composed from one slice per domain.
 *
 * Immer middleware lets every update read as a direct mutation while staying
 * immutable underneath, which is what makes the control system's
 * `update: (draft, value) => { draft.a.b = value }` accessors possible.
 */
export const useAppStore = create<AppState>()(
  immer((...args) => ({
    ...createUiSlice(...args),
  })),
)
