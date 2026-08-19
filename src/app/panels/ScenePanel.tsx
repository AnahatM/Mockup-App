import { Panel } from '@/ui'
import { ControlList, choice, color, segmented, slider, toggle } from '@/ui/controls'
import type { Control } from '@/ui/controls'
import { BACKDROP_MODES, PEDESTAL_SHAPES } from '@/features/scene'
import type { BackdropMode, PedestalShape } from '@/features/scene'
import type { AppState } from '@/state/types'

/**
 * Backdrop, pedestal and shadow controls.
 *
 * Note what a panel is: a list of declarations. No JSX per control, no manual
 * wiring, no re-render bookkeeping — adding a knob here is one entry.
 */

const label = (value: string) =>
  value.charAt(0).toUpperCase() + value.slice(1).replace(/-/g, ' ')

const backdropControls: readonly Control<AppState>[] = [
  choice<AppState, BackdropMode>({
    label: 'Style',
    options: BACKDROP_MODES.map((value) => ({ value, label: label(value) })),
    select: (s) => s.scene.backdrop.mode,
    update: (d, v) => {
      d.scene.backdrop.mode = v
    },
  }),
  color({
    label: 'Base',
    visible: (s) => s.scene.backdrop.mode !== 'transparent',
    select: (s) => s.scene.backdrop.color,
    update: (d, v) => {
      d.scene.backdrop.color = v
    },
  }),
  color({
    label: 'Accent',
    hint: 'Gradient end, glow centre, or grid lines.',
    visible: (s) => ['gradient', 'glow', 'grid'].includes(s.scene.backdrop.mode),
    select: (s) => s.scene.backdrop.accent,
    update: (d, v) => {
      d.scene.backdrop.accent = v
    },
  }),
  slider({
    label: 'Glow size',
    min: 0.05,
    max: 2,
    step: 0.01,
    visible: (s) => s.scene.backdrop.mode === 'glow',
    select: (s) => s.scene.backdrop.glowRadius,
    update: (d, v) => {
      d.scene.backdrop.glowRadius = v
    },
  }),
  slider({
    label: 'Glow strength',
    min: 0,
    max: 1,
    step: 0.01,
    visible: (s) => s.scene.backdrop.mode === 'glow',
    select: (s) => s.scene.backdrop.glowStrength,
    update: (d, v) => {
      d.scene.backdrop.glowStrength = v
    },
  }),
  slider({
    label: 'Grid size',
    min: 0.05,
    max: 4,
    step: 0.05,
    visible: (s) => s.scene.backdrop.mode === 'grid',
    select: (s) => s.scene.backdrop.gridSize,
    update: (d, v) => {
      d.scene.backdrop.gridSize = v
    },
  }),
]

const pedestalControls: readonly Control<AppState>[] = [
  toggle({
    label: 'Show',
    select: (s) => s.scene.pedestal.enabled,
    update: (d, v) => {
      d.scene.pedestal.enabled = v
    },
  }),
  segmented<AppState, PedestalShape>({
    label: 'Shape',
    options: PEDESTAL_SHAPES.map((value) => ({ value, label: label(value) })),
    disabled: (s) => !s.scene.pedestal.enabled,
    select: (s) => s.scene.pedestal.shape,
    update: (d, v) => {
      d.scene.pedestal.shape = v
    },
  }),
  slider({
    label: 'Radius',
    min: 0.2,
    max: 4,
    step: 0.01,
    disabled: (s) => !s.scene.pedestal.enabled,
    select: (s) => s.scene.pedestal.radius,
    update: (d, v) => {
      d.scene.pedestal.radius = v
    },
  }),
  slider({
    label: 'Height',
    min: 0.01,
    max: 1,
    step: 0.01,
    disabled: (s) => !s.scene.pedestal.enabled,
    select: (s) => s.scene.pedestal.height,
    update: (d, v) => {
      d.scene.pedestal.height = v
    },
  }),
  color({
    label: 'Colour',
    disabled: (s) => !s.scene.pedestal.enabled,
    select: (s) => s.scene.pedestal.color,
    update: (d, v) => {
      d.scene.pedestal.color = v
    },
  }),
  slider({
    label: 'Roughness',
    min: 0,
    max: 1,
    step: 0.01,
    disabled: (s) => !s.scene.pedestal.enabled,
    select: (s) => s.scene.pedestal.roughness,
    update: (d, v) => {
      d.scene.pedestal.roughness = v
    },
  }),
]

export function ScenePanel() {
  return (
    <>
      <Panel title="Backdrop">
        <ControlList controls={backdropControls} />
      </Panel>
      <Panel title="Pedestal">
        <ControlList controls={pedestalControls} />
      </Panel>
    </>
  )
}
