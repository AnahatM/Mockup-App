import { findLightingPreset, applyLightingPreset, LIGHTING_PRESETS } from './presets'
import { lightingSchema, type LightingConfig } from './schema'

/**
 * The rig a fresh scene starts with.
 *
 * The three-point studio rig, now that the environment dome supplies the fill
 * that used to be missing. Before the dome existed this rig left every
 * non-key face black, so the flatter soft-box preset was the safer default;
 * with a room behind it the directional key is what gives the product its
 * modelling instead of washing it out.
 */
const DEFAULT_PRESET = 'studio'

export function defaultLighting(): LightingConfig {
  const preset = findLightingPreset(DEFAULT_PRESET) ?? LIGHTING_PRESETS[0]
  if (!preset) throw new Error('LIGHTING_PRESETS must not be empty')
  return lightingSchema.parse(applyLightingPreset(preset))
}
