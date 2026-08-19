import { useMemo } from 'react'
import { DEVICES } from '@/features/devices'
import { BUILTIN_PRESETS } from '@/features/presets'
import { DOC_SECTION_LABELS, docIndex } from '@/content/docs'
import { SITE_ROUTES, docPath } from '@/app/routes'
import { settingEntries } from '@/app/panels/settingsIndex'
import { PANELS } from '@/app/panels/registry'
import { useAppStore } from '@/state/store'
import type { SearchItem } from './types'

/**
 * The whole app, as one searchable list.
 *
 * Every source here is an existing declaration — panel schemas, the device
 * registry, the preset list, the docs registry, the route table. Nothing is
 * restated, so nothing can fall out of sync with what the app actually offers.
 */
export function useSearchIndex(): readonly SearchItem[] {
  const focusSetting = useAppStore((state) => state.focusSetting)
  const selectDevice = useAppStore((state) => state.selectDevice)
  const applyBuiltinPreset = useAppStore((state) => state.applyBuiltinPreset)

  return useMemo(
    () => [
      ...settingItems(focusSetting),
      ...deviceItems(selectDevice),
      ...presetItems(applyBuiltinPreset),
      ...docItems(),
      ...pageItems(),
    ],
    [applyBuiltinPreset, focusSetting, selectDevice],
  )
}

type FocusSetting = ReturnType<typeof useAppStore.getState>['focusSetting']

function settingItems(focusSetting: FocusSetting): SearchItem[] {
  return settingEntries().map((entry, index) => ({
    id: `setting:${entry.tab}:${entry.panel}:${entry.label}:${index}`,
    title: entry.label,
    subtitle: `${PANELS[entry.tab].label} › ${entry.panel}`,
    group: 'Settings',
    icon: PANELS[entry.tab].icon,
    ...(entry.hint ? { keywords: [entry.hint] } : {}),
    run: () => focusSetting(entry.tab, entry.label),
  }))
}

function deviceItems(selectDevice: (id: string) => void): SearchItem[] {
  return DEVICES.map((device) => ({
    id: `device:${device.id}`,
    title: device.name,
    subtitle: device.category,
    group: 'Devices',
    icon: 'phone',
    keywords: [device.kind, device.category],
    run: () => selectDevice(device.id),
  }))
}

function presetItems(apply: (id: string) => void): SearchItem[] {
  return BUILTIN_PRESETS.map((preset) => ({
    id: `preset:${preset.id}`,
    title: preset.name,
    subtitle: preset.description,
    group: 'Presets',
    icon: 'sparkle',
    run: () => apply(preset.id),
  }))
}

function docItems(): SearchItem[] {
  return docIndex().map((article) => ({
    id: `doc:${article.slug}`,
    title: article.title,
    subtitle: DOC_SECTION_LABELS[article.section],
    group: 'Documentation',
    icon: 'folder',
    keywords: article.keywords,
    path: docPath(article.slug),
  }))
}

function pageItems(): SearchItem[] {
  return SITE_ROUTES.map((route) => ({
    id: `page:${route.path}`,
    title: route.label,
    group: 'Pages',
    icon: 'window',
    path: route.path,
  }))
}
