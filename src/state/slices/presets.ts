import { createId } from '@/lib/id'
import {
  MANIFEST_KIND,
  MANIFEST_VERSION,
  applyScene,
  captureScene,
  exportManifest,
  findBuiltinPreset,
  loadPresets,
  savePresets,
  type MockupManifest,
} from '@/features/presets'
import type { SliceCreator } from '../types'

export interface PresetsSlice {
  presets: MockupManifest[]
  presetError: string | null
  savePreset: (name: string) => void
  applyPreset: (id: string) => void
  applyBuiltinPreset: (id: string) => void
  renamePreset: (id: string, name: string) => void
  duplicatePreset: (id: string) => void
  deletePreset: (id: string) => void
  downloadPreset: (id: string) => void
  /** Loads a manifest that has already been validated. */
  loadManifest: (manifest: MockupManifest) => void
  setPresetError: (error: string | null) => void
}

export const createPresetsSlice: SliceCreator<PresetsSlice> = (set, get) => {
  /** Persists after every mutation, surfacing a quota failure to the user. */
  const persist = (presets: MockupManifest[]) => {
    const result = savePresets(presets)
    set((draft) => {
      draft.presets = presets
      draft.presetError = result.ok ? null : result.error
    })
  }

  return {
    presets: loadPresets(),
    presetError: null,

    savePreset: (name) => {
      const manifest: MockupManifest = {
        kind: MANIFEST_KIND,
        version: MANIFEST_VERSION,
        id: createId('preset'),
        name: name.trim() || 'Untitled',
        createdAt: new Date().toISOString(),
        scene: captureScene(get()),
        media: { kind: 'none' },
      }
      persist([...get().presets, manifest])
    },

    applyPreset: (id) => {
      const preset = get().presets.find((entry) => entry.id === id)
      if (!preset) return
      set((draft) => applyScene(draft, preset.scene))
    },

    applyBuiltinPreset: (id) => {
      const preset = findBuiltinPreset(id)
      if (!preset) return
      set((draft) => applyScene(draft, preset.build()))
    },

    renamePreset: (id, name) =>
      persist(
        get().presets.map((preset) =>
          preset.id === id ? { ...preset, name: name.trim() || preset.name } : preset,
        ),
      ),

    duplicatePreset: (id) => {
      const preset = get().presets.find((entry) => entry.id === id)
      if (!preset) return
      persist([
        ...get().presets,
        {
          ...preset,
          id: createId('preset'),
          name: `${preset.name} copy`,
          createdAt: new Date().toISOString(),
        },
      ])
    },

    deletePreset: (id) => persist(get().presets.filter((preset) => preset.id !== id)),

    downloadPreset: (id) => {
      const preset = get().presets.find((entry) => entry.id === id)
      if (preset) exportManifest(preset)
    },

    /** An imported manifest is applied AND kept, so it survives a reload. */
    loadManifest: (manifest) => {
      set((draft) => applyScene(draft, manifest.scene))
      persist([...get().presets, { ...manifest, id: createId('preset') }])
    },

    setPresetError: (error) =>
      set((draft) => {
        draft.presetError = error
      }),
  }
}
