import type { IconName } from '@/ui'

/** Where a result came from. Also the display order of groups. */
export const SEARCH_GROUPS = [
  'Settings',
  'Devices',
  'Presets',
  'Documentation',
  'Pages',
] as const

export type SearchGroup = (typeof SEARCH_GROUPS)[number]

export interface SearchItem {
  id: string
  title: string
  /** Secondary line — the section, the panel it lives in, a read time. */
  subtitle?: string
  group: SearchGroup
  icon: IconName
  /** Terms a reader might use that do not appear in the title. */
  keywords?: readonly string[]
  /** Navigate here. Mutually exclusive with `run`. */
  path?: string
  /** Do this instead of navigating — used to open a settings panel. */
  run?: () => void
}
