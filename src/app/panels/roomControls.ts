import { color, slider, toggle } from '@/ui/controls'
import type { Control } from '@/ui/controls'
import type { AppState } from '@/state/types'

/**
 * The enclosing room.
 *
 * Without it, every direction that is not a light panel reflects black — which
 * is what makes a dark device read as painted vantablack and stops a camera lens
 * looking like glass. See features/lighting/EnvironmentDome.
 */
const roomOff = (state: AppState) => !state.lighting.room.enabled

export const roomControls: readonly Control<AppState>[] = [
  toggle({
    label: 'Room',
    hint: 'Soft light from every direction, as a light tent gives.',
    select: (s) => s.lighting.room.enabled,
    update: (d, v) => {
      d.lighting.room.enabled = v
      d.lighting.preset = 'custom'
    },
  }),
  slider({
    label: 'Room light',
    min: 0,
    max: 3,
    step: 0.01,
    disabled: roomOff,
    select: (s) => s.lighting.room.intensity,
    update: (d, v) => {
      d.lighting.room.intensity = v
      d.lighting.preset = 'custom'
    },
  }),
  color({
    label: 'Ceiling',
    disabled: roomOff,
    select: (s) => s.lighting.room.top,
    update: (d, v) => {
      d.lighting.room.top = v
      d.lighting.preset = 'custom'
    },
  }),
  color({
    label: 'Horizon',
    disabled: roomOff,
    select: (s) => s.lighting.room.horizon,
    update: (d, v) => {
      d.lighting.room.horizon = v
      d.lighting.preset = 'custom'
    },
  }),
  color({
    label: 'Floor',
    disabled: roomOff,
    select: (s) => s.lighting.room.bottom,
    update: (d, v) => {
      d.lighting.room.bottom = v
      d.lighting.preset = 'custom'
    },
  }),
  slider({
    label: 'Reflection detail',
    hint: 'Cubemap resolution. Low values make polished surfaces sparkle.',
    min: 128,
    max: 1024,
    step: 128,
    unit: 'px',
    select: (s) => s.lighting.resolution,
    update: (d, v) => {
      d.lighting.resolution = Math.round(v)
    },
  }),
  toggle({
    label: 'Show light markers',
    hint: 'Wireframe markers in the scene. Never appear in an export.',
    select: (s) => s.lighting.showHelpers,
    update: (d, v) => {
      d.lighting.showHelpers = v
    },
  }),
]
