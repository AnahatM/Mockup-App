/**
 * Export size presets.
 *
 * Named for where the image is going, because that is how people actually think
 * about it — "an App Store screenshot", not "1290 by 2796".
 */
export interface SizePreset {
  id: string
  label: string
  group: string
  width: number
  height: number
}

export const SIZE_PRESETS: readonly SizePreset[] = [
  { id: 'viewport', label: 'Match viewport', group: 'General', width: 0, height: 0 },
  { id: 'square', label: 'Square 2048', group: 'General', width: 2048, height: 2048 },
  { id: 'hd', label: '1920 × 1080', group: 'General', width: 1920, height: 1080 },
  { id: '4k', label: '4K · 3840 × 2160', group: 'General', width: 3840, height: 2160 },

  { id: 'og', label: 'OG image · 1200 × 630', group: 'Web', width: 1200, height: 630 },
  {
    id: 'x-card',
    label: 'X card · 1600 × 900',
    group: 'Web',
    width: 1600,
    height: 900,
  },
  {
    id: 'dribbble',
    label: 'Dribbble · 1600 × 1200',
    group: 'Web',
    width: 1600,
    height: 1200,
  },
  {
    id: 'product-hunt',
    label: 'Product Hunt · 1270 × 760',
    group: 'Web',
    width: 1270,
    height: 760,
  },
  {
    id: 'readme',
    label: 'README · 1400 × 900',
    group: 'Web',
    width: 1400,
    height: 900,
  },

  {
    id: 'app-store-67',
    label: 'App Store 6.7" · 1290 × 2796',
    group: 'App stores',
    width: 1290,
    height: 2796,
  },
  {
    id: 'app-store-61',
    label: 'App Store 6.1" · 1179 × 2556',
    group: 'App stores',
    width: 1179,
    height: 2556,
  },
  {
    id: 'app-store-ipad',
    label: 'App Store iPad · 2048 × 2732',
    group: 'App stores',
    width: 2048,
    height: 2732,
  },
  {
    id: 'play-store',
    label: 'Play Store · 1080 × 1920',
    group: 'App stores',
    width: 1080,
    height: 1920,
  },
]

export function findSizePreset(id: string): SizePreset | undefined {
  return SIZE_PRESETS.find((preset) => preset.id === id)
}

/**
 * Resolves a preset to concrete pixels. `viewport` and `custom` fall back to the
 * live canvas size, so "what I see" is always an option.
 */
export function resolveSize(
  presetId: string,
  custom: { width: number; height: number },
  viewport: { width: number; height: number },
): { width: number; height: number } {
  if (presetId === 'custom') return custom
  const preset = findSizePreset(presetId)
  if (!preset || preset.width === 0) return viewport
  return { width: preset.width, height: preset.height }
}
