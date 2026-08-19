import { findLightingPreset, applyLightingPreset, LIGHTING_PRESETS } from './presets'
import { lightingSchema, type LightingConfig } from './schema'

/**
 * The rig a fresh scene starts with.
 *
 * Soft box rather than the darker studio rig, because the default backdrop is a
 * bright neutral sweep — a contrasty rig over a light background reads as a
 * mistake rather than as drama.
 */
const DEFAULT_PRESET = 'soft'

export function defaultLighting(): LightingConfig {
  const preset = findLightingPreset(DEFAULT_PRESET) ?? LIGHTING_PRESETS[0]
  if (!preset) throw new Error('LIGHTING_PRESETS must not be empty')
  return lightingSchema.parse(applyLightingPreset(preset))
}
