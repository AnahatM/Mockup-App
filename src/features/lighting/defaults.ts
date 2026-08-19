import { applyLightingPreset, LIGHTING_PRESETS } from './presets'
import { lightingSchema, type LightingConfig } from './schema'

const STUDIO = LIGHTING_PRESETS[0]

/** The rig a fresh scene starts with. */
export function defaultLighting(): LightingConfig {
  if (!STUDIO) throw new Error('LIGHTING_PRESETS must not be empty')
  return lightingSchema.parse(applyLightingPreset(STUDIO))
}
