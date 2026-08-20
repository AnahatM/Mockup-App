/*
 * Deep-imported on purpose. The lighting barrel exports React components that
 * read the store, and the store loads this module — so importing the barrel
 * here closes a cycle that leaves the lighting defaults half-initialised
 * depending on which file happens to be imported first.
 */
import { applyLightingPreset, findLightingPreset } from '@/features/lighting/presets'
import { defaultSceneState, type SceneState } from '../manifest'

/**
 * A premade look.
 *
 * Each builds a partial override of the default scene rather than declaring one
 * in full, so a preset written today keeps working when a new field is added
 * tomorrow — and the code shows what the preset actually changes.
 */
export interface BuiltinPreset {
  id: string
  name: string
  description: string
  /** Groups the preset list, so a dozen entries stay scannable. */
  group: 'Studio' | 'Dramatic' | 'Flat' | 'Window' | 'Motion'
  build: () => SceneState
}

/** A named lighting rig, materialised. */
export const lighting = (id: string) => {
  const preset = findLightingPreset(id)
  return preset ? applyLightingPreset(preset) : defaultSceneState().lighting
}

export const base = (): SceneState => defaultSceneState()
