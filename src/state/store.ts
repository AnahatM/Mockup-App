import { create } from 'zustand'
import { immer } from 'zustand/middleware/immer'
import { createCameraSlice } from './slices/camera'
import { createDeviceSlice } from './slices/device'
import { createLightingSlice } from './slices/lighting'
import { createMediaSlice } from './slices/media'
import { createSceneSlice } from './slices/scene'
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
    ...createSceneSlice(...args),
    ...createCameraSlice(...args),
    ...createLightingSlice(...args),
    ...createDeviceSlice(...args),
    ...createMediaSlice(...args),
  })),
)
