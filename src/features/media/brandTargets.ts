import type { Draft } from 'immer'
import type { AppState } from '@/state/types'

/**
 * Where an extracted brand colour can be applied.
 *
 * Declared as data with its own writer so adding a target is one entry, and so
 * the picker UI and the store action can never disagree about what exists.
 */
export interface BrandTarget {
  id: string
  label: string
  apply: (draft: Draft<AppState>, hex: string) => void
}

export const BRAND_TARGETS: readonly BrandTarget[] = [
  {
    id: 'backdrop-accent',
    label: 'Backdrop glow',
    apply: (d, hex) => {
      d.scene.backdrop.accent = hex
    },
  },
  {
    id: 'backdrop-base',
    label: 'Backdrop base',
    apply: (d, hex) => {
      d.scene.backdrop.color = hex
    },
  },
  {
    id: 'rim-lights',
    label: 'Rim lights',
    apply: (d, hex) => {
      // The rim lights are the ones behind the product; tinting the key light
      // too would colour-cast the whole device rather than edge it.
      const behind = d.lighting.lights.filter((light) => light.position[2] < 0)
      const targets = behind.length > 0 ? behind : d.lighting.lights
      for (const light of targets) light.color = hex
      d.lighting.preset = 'custom'
    },
  },
  {
    id: 'all-lights',
    label: 'All lights',
    apply: (d, hex) => {
      for (const light of d.lighting.lights) light.color = hex
      d.lighting.preset = 'custom'
    },
  },
  {
    id: 'device-body',
    label: 'Device body',
    apply: (d, hex) => {
      d.device.bodyColor = hex
      d.device.colorway = 'custom'
    },
  },
  {
    id: 'device-frame',
    label: 'Device frame',
    apply: (d, hex) => {
      d.device.frameColor = hex
      d.device.colorway = 'custom'
    },
  },
  {
    id: 'pedestal',
    label: 'Pedestal',
    apply: (d, hex) => {
      d.scene.pedestal.color = hex
    },
  },
  {
    id: 'screen-background',
    label: 'Screen background',
    apply: (d, hex) => {
      d.screen.background = hex
    },
  },
]

export function findBrandTarget(id: string): BrandTarget | undefined {
  return BRAND_TARGETS.find((target) => target.id === id)
}
