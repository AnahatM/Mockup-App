import { DRAMATIC_PRESETS } from './dramatic'
import { FLAT_PRESETS } from './flat'
import { MOTION_PRESETS } from './motion'
import { STUDIO_PRESETS } from './studio'
import type { BuiltinPreset } from './types'

export type { BuiltinPreset } from './types'

/** Every premade look, in display order. */
export const BUILTIN_PRESETS: readonly BuiltinPreset[] = [
  ...STUDIO_PRESETS,
  ...DRAMATIC_PRESETS,
  ...FLAT_PRESETS,
  ...MOTION_PRESETS,
]

export function findBuiltinPreset(id: string): BuiltinPreset | undefined {
  return BUILTIN_PRESETS.find((preset) => preset.id === id)
}

/** Presets grouped for display, preserving declaration order. */
export function builtinPresetGroups(): Array<{
  group: BuiltinPreset['group']
  presets: BuiltinPreset[]
}> {
  const groups = new Map<BuiltinPreset['group'], BuiltinPreset[]>()
  for (const preset of BUILTIN_PRESETS) {
    const bucket = groups.get(preset.group)
    if (bucket) bucket.push(preset)
    else groups.set(preset.group, [preset])
  }
  return [...groups].map(([group, presets]) => ({ group, presets }))
}
