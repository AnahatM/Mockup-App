import { applyLightingPreset, findLightingPreset } from '@/features/lighting'
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
  group: 'Studio' | 'Dramatic' | 'Flat' | 'Motion'
  build: () => SceneState
}

/** A named lighting rig, materialised. */
export const lighting = (id: string) => {
  const preset = findLightingPreset(id)
  return preset ? applyLightingPreset(preset) : defaultSceneState().lighting
}

export const base = (): SceneState => defaultSceneState()
