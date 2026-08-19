import type { ReactNode } from 'react'
import type { IconName } from '@/ui'
import type { InspectorTab } from '@/state/slices/ui'
import { CameraPanel } from './CameraPanel'
import { DevicePanel } from './DevicePanel'
import { LightingPanel } from './LightingPanel'
import { PlaceholderPanel } from './PlaceholderPanel'
import { RenderPanel } from './RenderPanel'
import { ScenePanel } from './ScenePanel'
import { ScreenPanel } from './ScreenPanel'

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
    render: () => <DevicePanel />,
  },
  screen: {
    label: 'Screen',
    icon: 'image',
    render: () => <ScreenPanel />,
  },
  scene: {
    label: 'Scene',
    icon: 'layers',
    render: () => (
      <>
        <ScenePanel />
        <RenderPanel />
      </>
    ),
  },
  camera: {
    label: 'Camera',
    icon: 'camera',
    render: () => <CameraPanel />,
  },
  lighting: {
    label: 'Light',
    icon: 'light',
    render: () => <LightingPanel />,
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
