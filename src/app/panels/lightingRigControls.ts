import { choice, slider } from '@/ui/controls'
import type { Control } from '@/ui/controls'
import {
  LIGHTING_PRESETS,
  applyLightingPreset,
  findLightingPreset,
} from '@/features/lighting'
import type { AppState } from '@/state/types'

const PRESET_OPTIONS = [
  ...LIGHTING_PRESETS.map((preset) => ({ value: preset.id, label: preset.label })),
  { value: 'custom', label: 'Custom' },
]

export const rigControls: readonly Control<AppState>[] = [
  choice({
    label: 'Preset',
    options: PRESET_OPTIONS,
    select: (s) => s.lighting.preset,
    update: (d, v) => {
      const preset = findLightingPreset(v)
      if (preset) d.lighting = applyLightingPreset(preset)
    },
  }),
  slider({
    label: 'Environment',
    hint: 'Strength of the reflections the rig casts.',
    min: 0,
    max: 5,
    step: 0.01,
    select: (s) => s.lighting.environmentIntensity,
    update: (d, v) => {
      d.lighting.environmentIntensity = v
    },
  }),
  slider({
    label: 'Ambient',
    hint: 'Soft fill so unlit faces never crush to black.',
    min: 0,
    max: 3,
    step: 0.01,
    select: (s) => s.lighting.ambient,
    update: (d, v) => {
      d.lighting.ambient = v
    },
  }),
]
