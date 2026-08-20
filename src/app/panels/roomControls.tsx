import { color, custom, slider, toggle } from '@/ui/controls'
import type { Control } from '@/ui/controls'
import { HdriPicker } from '@/features/lighting'
import type { AppState } from '@/state/types'

/**
 * The enclosing room.
 *
 * Without it, every direction that is not a light panel reflects black — which
 * is what makes a dark device read as painted vantablack and stops a camera lens
 * looking like glass. See features/lighting/EnvironmentDome.
 */
const usingHdri = (state: AppState) => state.lighting.hdri !== null
const roomOff = (state: AppState) => !state.lighting.room.enabled || usingHdri(state)

export const roomControls: readonly Control<AppState>[] = [
  custom({
    label: 'Environment map',
    bare: true,
    render: () => <HdriPicker />,
  }),
  slider({
    label: 'Map rotation',
    hint: 'Turns the environment to move its light.',
    min: -180,
    max: 180,
    step: 1,
    unit: '°',
    visible: usingHdri,
    select: (s) => (s.lighting.hdriRotation * 180) / Math.PI,
    update: (d, v) => {
      d.lighting.hdriRotation = (v * Math.PI) / 180
    },
  }),
  toggle({
    label: 'Room',
    visible: (s) => !usingHdri(s),
    hint: 'Soft light from every direction, as a light tent gives.',
    select: (s) => s.lighting.room.enabled,
    update: (d, v) => {
      d.lighting.room.enabled = v
      d.lighting.preset = 'custom'
    },
  }),
  slider({
    label: 'Room light',
    visible: (s) => !usingHdri(s),
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
    visible: (s) => !usingHdri(s),
    disabled: roomOff,
    select: (s) => s.lighting.room.top,
    update: (d, v) => {
      d.lighting.room.top = v
      d.lighting.preset = 'custom'
    },
  }),
  color({
    label: 'Horizon',
    visible: (s) => !usingHdri(s),
    disabled: roomOff,
    select: (s) => s.lighting.room.horizon,
    update: (d, v) => {
      d.lighting.room.horizon = v
      d.lighting.preset = 'custom'
    },
  }),
  color({
    label: 'Floor',
    visible: (s) => !usingHdri(s),
    disabled: roomOff,
    select: (s) => s.lighting.room.bottom,
    update: (d, v) => {
      d.lighting.room.bottom = v
      d.lighting.preset = 'custom'
    },
  }),
  slider({
    label: 'Reflection detail',
    visible: (s) => !usingHdri(s),
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
]
