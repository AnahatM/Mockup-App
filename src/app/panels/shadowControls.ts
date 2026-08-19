import { slider, toggle } from '@/ui/controls'
import type { Control } from '@/ui/controls'
import type { AppState } from '@/state/types'

/** Contact shadow: what grounds the product on the plinth. */
export const shadowControls: readonly Control<AppState>[] = [
  toggle({
    label: 'Contact shadow',
    select: (s) => s.scene.shadow.enabled,
    update: (d, v) => {
      d.scene.shadow.enabled = v
    },
  }),
  slider({
    label: 'Opacity',
    min: 0,
    max: 1,
    step: 0.01,
    disabled: (s) => !s.scene.shadow.enabled,
    select: (s) => s.scene.shadow.opacity,
    update: (d, v) => {
      d.scene.shadow.opacity = v
    },
  }),
  slider({
    label: 'Blur',
    min: 0,
    max: 10,
    step: 0.1,
    disabled: (s) => !s.scene.shadow.enabled,
    select: (s) => s.scene.shadow.blur,
    update: (d, v) => {
      d.scene.shadow.blur = v
    },
  }),
  slider({
    label: 'Spread',
    min: 0.5,
    max: 20,
    step: 0.1,
    disabled: (s) => !s.scene.shadow.enabled,
    select: (s) => s.scene.shadow.scale,
    update: (d, v) => {
      d.scene.shadow.scale = v
    },
  }),
]
