import type { StateCreator } from 'zustand'
import type { UiSlice } from './slices/ui'

/**
 * The whole application state.
 *
 * Grows one slice per phase (scene, device, screen, camera, lighting, animation,
 * export). UI state lives here too but is deliberately kept separate from scene
 * config, because only scene config is serialised into a preset manifest.
 */
export type AppState = UiSlice

/** Slice signature, pre-bound to the immer middleware. */
export type SliceCreator<T> = StateCreator<AppState, [['zustand/immer', never]], [], T>
