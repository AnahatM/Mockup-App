import { createId } from '@/lib/id'
import {
  defaultLighting,
  type LightConfig,
  type LightingConfig,
} from '@/features/lighting'
import type { SliceCreator } from '../types'

export interface LightingSlice {
  lighting: LightingConfig
  addLight: () => void
  removeLight: (id: string) => void
  duplicateLight: (id: string) => void
  setHdri: (url: string, name: string) => void
  clearHdri: () => void
  resetLighting: () => void
}

const MAX_LIGHTS = 8

function cloneLight(light: LightConfig): LightConfig {
  return { ...light, id: createId('light'), name: `${light.name} copy` }
}

export const createLightingSlice: SliceCreator<LightingSlice> = (set) => ({
  lighting: defaultLighting(),
  addLight: () =>
    set((draft) => {
      if (draft.lighting.lights.length >= MAX_LIGHTS) return
      draft.lighting.lights.push({
        id: createId('light'),
        name: `Light ${draft.lighting.lights.length + 1}`,
        enabled: true,
        form: 'rect',
        position: [2.5, 1.5, 2],
        rotation: [0, 0, 0],
        scale: [2, 2, 1],
        color: '#ffffff',
        intensity: 3,
        visibleInBackground: false,
      })
      draft.lighting.preset = 'custom'
    }),
  removeLight: (id) =>
    set((draft) => {
      draft.lighting.lights = draft.lighting.lights.filter((l) => l.id !== id)
      draft.lighting.preset = 'custom'
    }),
  duplicateLight: (id) =>
    set((draft) => {
      const found = draft.lighting.lights.find((l) => l.id === id)
      if (!found || draft.lighting.lights.length >= MAX_LIGHTS) return
      draft.lighting.lights.push(cloneLight(found))
      draft.lighting.preset = 'custom'
    }),
  /** Revokes the previous object URL so switching maps does not leak them. */
  setHdri: (url, name) =>
    set((draft) => {
      if (draft.lighting.hdri) URL.revokeObjectURL(draft.lighting.hdri.url)
      draft.lighting.hdri = { url, name }
    }),

  clearHdri: () =>
    set((draft) => {
      if (draft.lighting.hdri) URL.revokeObjectURL(draft.lighting.hdri.url)
      draft.lighting.hdri = null
    }),

  resetLighting: () =>
    set((draft) => {
      draft.lighting = defaultLighting()
    }),
})
