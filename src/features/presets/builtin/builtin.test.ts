import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
/*
 * Imported through the feature barrel, the way the app does.
 *
 * `builtin/types.ts` imports the lighting barrel, which exports React
 * components that reach the store, which loads this module again — so entering
 * through `builtin/index.ts` directly initialises the lighting defaults
 * half-built. See CHECKLIST F18.
 */
import {
  BUILTIN_PRESETS,
  builtinPresetGroups,
  findBuiltinPreset,
  sceneStateSchema,
} from '@/features/presets'

/**
 * Every built-in preset must produce a scene the app can actually load.
 *
 * A preset is a function returning a partial override, so a typo in a field
 * name or a value out of the schema's range is not a compile error — it fails
 * only when someone clicks the preset. Parsing each one through the same schema
 * that validates an imported manifest catches that here instead.
 */
describe('the built-in presets', () => {
  it('ships a useful number of them', () => {
    expect(BUILTIN_PRESETS.length).toBeGreaterThanOrEqual(12)
  })

  it('uses a unique id and name per preset', () => {
    expect(new Set(BUILTIN_PRESETS.map((p) => p.id)).size).toBe(BUILTIN_PRESETS.length)
    expect(new Set(BUILTIN_PRESETS.map((p) => p.name)).size).toBe(BUILTIN_PRESETS.length)
  })

  it('builds a scene that validates against the manifest schema', () => {
    for (const preset of BUILTIN_PRESETS) {
      const result = sceneStateSchema.safeParse(preset.build())
      expect(result.success, `${preset.id}: ${result.error?.message ?? ''}`).toBe(true)
    }
  })

  it('builds a fresh scene each time, so applying one cannot mutate another', () => {
    for (const preset of BUILTIN_PRESETS) {
      const first = preset.build()
      const second = preset.build()
      expect(first).not.toBe(second)
      expect(first.scene.backdrop).not.toBe(second.scene.backdrop)
    }
  })

  it('describes every preset', () => {
    for (const preset of BUILTIN_PRESETS) {
      expect(preset.description, `description for ${preset.id}`).toBeTruthy()
    }
  })

  it('finds a preset by id, and does not invent one', () => {
    expect(findBuiltinPreset(BUILTIN_PRESETS[0]?.id ?? '')).toBeDefined()
    expect(findBuiltinPreset('no-such-preset')).toBeUndefined()
  })

  it('groups every preset, leaving no group empty', () => {
    const groups = builtinPresetGroups()
    const total = groups.reduce((sum, g) => sum + g.presets.length, 0)
    expect(total).toBe(BUILTIN_PRESETS.length)
    for (const group of groups) expect(group.presets.length).toBeGreaterThan(0)
  })

  it('covers the window mockup, not only the 3D scene', () => {
    const window = BUILTIN_PRESETS.filter((p) => p.group === 'Window')
    expect(window.length).toBeGreaterThan(0)
  })

  it('names every preset in the manual', () => {
    // The article lists them by name. Adding a preset and not the entry leaves
    // the manual quietly describing an older version of the app.
    const article = readFileSync('src/content/docs/articles/presets.md', 'utf8')
    const undocumented = BUILTIN_PRESETS.filter((p) => !article.includes(p.name))

    expect(undocumented.map((p) => p.name), 'presets missing from the manual').toEqual([])
  })
})
