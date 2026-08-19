import type { StateCreator } from 'zustand'
import type { CameraSlice } from './slices/camera'
import type { DeviceSlice } from './slices/device'
import type { LightingSlice } from './slices/lighting'
import type { MediaSlice } from './slices/media'
import type { OverlaysSlice } from './slices/overlays'
import type { SceneSlice } from './slices/scene'
import type { UiSlice } from './slices/ui'

/**
 * The whole application state.
 *
 * Grows one slice per phase. UI state lives here too but is deliberately kept
 * separate from scene config, because only scene config is serialised into a
 * preset manifest.
 */
export type AppState = UiSlice &
  SceneSlice &
  CameraSlice &
  LightingSlice &
  DeviceSlice &
  MediaSlice &
  OverlaysSlice

/** Slice signature, pre-bound to the immer middleware. */
export type SliceCreator<T> = StateCreator<AppState, [['zustand/immer', never]], [], T>
