import type { ReactNode } from 'react'
import type { IconName } from '@/ui'
import type { InspectorTab } from '@/state/slices/ui'
import { InterfacePanel } from './InterfacePanel'
import { PlaceholderPanel } from './PlaceholderPanel'

export interface PanelDefinition {
  label: string
  icon: IconName
  render: () => ReactNode
}

const pending = (icon: IconName, title: string, description: string) => () => (
  <PlaceholderPanel icon={icon} title={title} description={description} />
)

/**
 * Single source of truth for the inspector's tabs. Adding a panel is one entry
 * here — the tab strip and the body both read from this map.
 */
export const PANELS: Record<InspectorTab, PanelDefinition> = {
  device: {
    label: 'Device',
    icon: 'phone',
    render: pending(
      'phone',
      'Device',
      'Model, colour, materials and which physical details are shown.',
    ),
  },
  screen: {
    label: 'Screen',
    icon: 'image',
    render: pending(
      'image',
      'Screen',
      'Your screenshot or video, plus the status bar, gesture bar and dock overlays.',
    ),
  },
  scene: {
    label: 'Scene',
    icon: 'layers',
    render: () => <InterfacePanel />,
  },
  camera: {
    label: 'Camera',
    icon: 'camera',
    render: pending('camera', 'Camera', 'Angle presets, field of view and framing.'),
  },
  lighting: {
    label: 'Light',
    icon: 'light',
    render: pending('light', 'Lighting', 'Rim lights, glows, reflections and bloom.'),
  },
  animation: {
    label: 'Animate',
    icon: 'film',
    render: pending('film', 'Animation', 'Motion presets, timing and recording.'),
  },
  export: {
    label: 'Export',
    icon: 'download',
    render: pending(
      'download',
      'Export',
      'Resolution, transparency and platform size presets.',
    ),
  },
  presets: {
    label: 'Presets',
    icon: 'sparkle',
    render: pending(
      'sparkle',
      'Presets',
      'Save, load, import and share the whole scene as one file.',
    ),
  },
}
