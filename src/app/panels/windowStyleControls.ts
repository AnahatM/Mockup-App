import { color, slider, toggle } from '@/ui/controls'
import type { Control } from '@/ui/controls'
import type { AppState } from '@/state/types'

const framed = (state: AppState) => state.flat.style !== 'none'

/** How the window looks: colour, proportions, shadow. */
export const windowStyleControls: readonly Control<AppState>[] = [
  toggle({
    label: 'Dark window',
    visible: framed,
    select: (s) => s.flat.dark,
    update: (d, v) => {
      d.flat.dark = v
    },
  }),
  toggle({
    label: 'Match screenshot',
    hint: 'Takes the chrome colour from the uploaded image.',
    visible: framed,
    select: (s) => s.flat.colorMatch,
    update: (d, v) => {
      d.flat.colorMatch = v
    },
  }),
  color({
    label: 'Chrome',
    visible: (s) => framed(s) && !s.flat.colorMatch,
    select: (s) => s.flat.chrome,
    update: (d, v) => {
      d.flat.chrome = v
    },
  }),
  slider({
    label: 'Title bar',
    min: 0.01,
    max: 0.2,
    step: 0.001,
    visible: framed,
    select: (s) => s.flat.barHeight,
    update: (d, v) => {
      d.flat.barHeight = v
    },
  }),
  slider({
    label: 'Corner radius',
    min: 0,
    max: 0.1,
    step: 0.001,
    visible: framed,
    select: (s) => s.flat.cornerRadius,
    update: (d, v) => {
      d.flat.cornerRadius = v
    },
  }),
  slider({
    label: 'Shadow',
    min: 0,
    max: 1,
    step: 0.01,
    visible: framed,
    select: (s) => s.flat.shadow,
    update: (d, v) => {
      d.flat.shadow = v
    },
  }),
  slider({
    label: 'Margin',
    hint: 'Space around the window in a flat export.',
    min: 0,
    max: 0.3,
    step: 0.005,
    visible: framed,
    select: (s) => s.flat.margin,
    update: (d, v) => {
      d.flat.margin = v
    },
  }),
]
