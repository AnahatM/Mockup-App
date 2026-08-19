import { createId } from '@/lib/id'
import { roomSchema } from './schema'
import type { LightConfig, LightForm, LightingConfig, RoomConfig } from './schema'

/**
 * Built-in lighting rigs.
 *
 * Each is plain data, which means a preset serialises into a saved mockup for
 * free and a user's edits to one are just an ordinary object with `preset` set
 * to 'custom'.
 */

type LightSeed = Omit<LightConfig, 'id' | 'enabled' | 'visibleInBackground'> &
  Partial<Pick<LightConfig, 'enabled' | 'visibleInBackground'>>

/** Compact constructor so a whole rig stays readable at a glance. */
const seed = (
  name: string,
  form: LightForm,
  position: [number, number, number],
  scale: [number, number, number],
  color: string,
  intensity: number,
  rotation: [number, number, number] = [0, 0, 0],
): LightSeed => ({ name, form, position, scale, color, intensity, rotation })

export interface LightingPreset {
  id: string
  label: string
  description: string
  ambient: number
  environmentIntensity: number
  lights: readonly LightSeed[]
  /** The enclosing room. Overrides only what it names. */
  room?: Partial<RoomConfig>
}

export const LIGHTING_PRESETS: readonly LightingPreset[] = [
  {
    id: 'studio',
    label: 'Studio',
    description: 'Balanced three-point rig. The safe default.',
    room: { intensity: 0.9 },
    ambient: 0.08,
    environmentIntensity: 1,
    lights: [
      seed('Key', 'rect', [2.6, 2.4, 3], [4, 4, 1], '#ffffff', 1.9),
      seed('Fill', 'rect', [-3.2, 0.8, 2.4], [3.5, 3.5, 1], '#dfe6f2', 0.6),
      seed('Top', 'rect', [0, 4.2, 0.6], [5, 2.4, 1], '#ffffff', 0.9, [
        Math.PI / 2,
        0,
        0,
      ]),
      seed('Rim', 'rect', [-1.4, 1.4, -3.4], [2.2, 3.4, 1], '#c8d4ea', 3.4),
    ],
  },
  {
    id: 'rim-glow',
    label: 'Rim glow',
    description: 'Dim front, bright edges. Makes metal rails read as metal.',
    room: { intensity: 0.45, top: '#cfd6e4', horizon: '#8b93a4', bottom: '#33373f' },
    ambient: 0.1,
    environmentIntensity: 1.1,
    lights: [
      seed('Key', 'rect', [1.6, 1.8, 3.2], [2.6, 2.6, 1], '#ffffff', 1.4),
      seed('Rim left', 'rect', [-3, 1.2, -2.2], [1, 4.4, 1], '#8fb4ff', 8),
      seed('Rim right', 'rect', [3, 1.2, -2.2], [1, 4.4, 1], '#ffd9a8', 7),
      seed('Top', 'rect', [0, 4, -0.6], [4, 1.6, 1], '#ffffff', 2, [Math.PI / 2, 0, 0]),
    ],
  },
  {
    id: 'soft',
    label: 'Soft box',
    description: 'Large, wrapping, almost shadowless. Flattering and neutral.',
    room: { intensity: 1.25, top: '#ffffff', horizon: '#e6e8ec', bottom: '#a9aeb6' },
    ambient: 0.45,
    environmentIntensity: 1,
    lights: [
      seed('Front', 'rect', [0, 1.4, 4], [7, 5, 1], '#ffffff', 2.4),
      seed('Left', 'rect', [-4.4, 1, 1], [5, 5, 1], '#f3f5fa', 1.6),
      seed('Right', 'rect', [4.4, 1, 1], [5, 5, 1], '#f3f5fa', 1.6),
      seed('Top', 'rect', [0, 4.6, 0], [7, 5, 1], '#ffffff', 1.8, [Math.PI / 2, 0, 0]),
    ],
  },
  {
    id: 'dramatic',
    label: 'Dramatic',
    description: 'One hard key and a cold rim. Deep, contrasty shadows.',
    room: { intensity: 0.28, top: '#9aa3b4', horizon: '#5a606c', bottom: '#22252b' },
    ambient: 0.04,
    environmentIntensity: 1.2,
    lights: [
      seed('Key', 'rect', [3.4, 3, 2], [1.6, 1.6, 1], '#fff4e2', 9),
      seed('Rim', 'rect', [-2.6, 1, -3], [1.2, 4, 1], '#7fa0d8', 6),
    ],
  },
  {
    id: 'neon',
    label: 'Neon',
    description: 'Magenta and cyan edges over a dark room.',
    room: { intensity: 0.35, top: '#4a3a6b', horizon: '#2b2440', bottom: '#141322' },
    ambient: 0.06,
    environmentIntensity: 1.3,
    lights: [
      seed('Magenta', 'rect', [-3.2, 1, -1.6], [1, 4.6, 1], '#ff4fd8', 9),
      seed('Cyan', 'rect', [3.2, 1, -1.6], [1, 4.6, 1], '#3fe0ff', 9),
      seed('Fill', 'rect', [0, 1.6, 3.4], [3, 3, 1], '#8f7fff', 1.2),
    ],
  },
  {
    id: 'product-white',
    label: 'Product white',
    description: 'Bright, even, catalogue-style. Pairs with a light backdrop.',
    room: { intensity: 1.6, top: '#ffffff', horizon: '#f4f5f7', bottom: '#d5d8dc' },
    ambient: 0.7,
    environmentIntensity: 1,
    lights: [
      seed('Front', 'rect', [0, 1.6, 4.2], [8, 6, 1], '#ffffff', 3.4),
      seed('Top', 'rect', [0, 5, 0], [8, 6, 1], '#ffffff', 3, [Math.PI / 2, 0, 0]),
      seed('Left', 'rect', [-5, 1.2, 0.5], [5, 6, 1], '#ffffff', 2.2),
      seed('Right', 'rect', [5, 1.2, 0.5], [5, 6, 1], '#ffffff', 2.2),
    ],
  },
  {
    id: 'moody',
    label: 'Moody',
    description: 'Low warm key with a single cool kicker.',
    room: { intensity: 0.42, top: '#b9a894', horizon: '#6d6156', bottom: '#2b2723' },
    ambient: 0.08,
    environmentIntensity: 1,
    lights: [
      seed('Key', 'rect', [2, 0.8, 2.6], [2.4, 2.4, 1], '#ffb877', 3.4),
      seed('Kicker', 'ring', [-2.4, 2.2, -2], [2, 2, 1], '#88a8ff', 5),
    ],
  },
]

export function findLightingPreset(id: string): LightingPreset | undefined {
  return LIGHTING_PRESETS.find((preset) => preset.id === id)
}

/**
 * Materialises a preset into store-ready config, assigning fresh light ids.
 *
 * Rig-wide render settings (resolution, helper visibility) are deliberately not
 * part of a preset: they are how the user prefers to work, not part of the look.
 */
export function applyLightingPreset(
  preset: LightingPreset,
  current?: Pick<LightingConfig, 'resolution' | 'showHelpers'>,
): LightingConfig {
  return {
    preset: preset.id,
    ambient: preset.ambient,
    environmentIntensity: preset.environmentIntensity,
    resolution: current?.resolution ?? 512,
    showHelpers: current?.showHelpers ?? false,
    room: roomSchema.parse(preset.room ?? {}),
    lights: preset.lights.map((light) => ({
      enabled: true,
      visibleInBackground: false,
      ...light,
      id: createId('light'),
    })),
  }
}
