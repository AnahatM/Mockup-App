import { segmented, slider } from '@/ui/controls'
import type { Control } from '@/ui/controls'
import { seedRadius } from '@/features/flat'
// These three are read at module top level (inside the `.map()` calls
// below), so they must come from the pure schema module rather than the
// feature barrel: the barrel also exports FlatStudio, which imports this
// very file back, and reading a barrel export while that cycle is still
// resolving throws "before initialization". `seedRadius` above is only
// called from an `update` closure, long after startup, so the barrel is
// safe for it.
import {
  BORDER_SHAPES,
  CONTAINER_STYLES,
  SHADOW_STYLES,
  type BorderShape,
  type ContainerStyle,
  type ShadowStyle,
} from '@/features/flat/schema'
import type { AppState } from '@/state/types'

const hasChrome = (state: AppState) => !state.flat.hideMockup

const CONTAINER_LABELS: Record<ContainerStyle, string> = {
  default: 'Default',
  'glass-light': 'Glass light',
  'glass-dark': 'Glass dark',
  'inset-light': 'Inset light',
  'inset-dark': 'Inset dark',
  outline: 'Outline',
  border: 'Border',
}

const SHAPE_LABELS: Record<BorderShape, string> = {
  sharp: 'Sharp',
  curved: 'Curved',
  round: 'Round',
}

const SHADOW_LABELS: Record<ShadowStyle, string> = {
  none: 'None',
  spread: 'Spread',
  hug: 'Hug',
  adaptive: 'Adaptive',
}

/** Container appearance: style preset, border shape, and shadow preset. */
export const windowContainerControls: readonly Control<AppState>[] = [
  segmented<AppState, ContainerStyle>({
    label: 'Container style',
    hint: 'Glass and inset are canvas approximations — see the note in containerLooks.ts.',
    options: CONTAINER_STYLES.map((value) => ({ value, label: CONTAINER_LABELS[value] })),
    visible: hasChrome,
    select: (s) => s.flat.containerStyle,
    update: (d, v) => {
      d.flat.containerStyle = v
    },
  }),
  segmented<AppState, BorderShape>({
    label: 'Border shape',
    hint: 'Seeds the corner radius below — the slider then fine-tunes it.',
    options: BORDER_SHAPES.map((value) => ({ value, label: SHAPE_LABELS[value] })),
    visible: hasChrome,
    select: (s) => s.flat.borderShape,
    update: (d, v) => {
      d.flat.borderShape = v
      d.flat.cornerRadius = seedRadius(v)
    },
  }),
  slider({
    label: 'Corner radius',
    min: 0,
    max: 0.1,
    step: 0.001,
    visible: hasChrome,
    select: (s) => s.flat.cornerRadius,
    update: (d, v) => {
      d.flat.cornerRadius = v
    },
  }),
  segmented<AppState, ShadowStyle>({
    label: 'Shadow',
    options: SHADOW_STYLES.map((value) => ({ value, label: SHADOW_LABELS[value] })),
    visible: hasChrome,
    select: (s) => s.flat.shadowStyle,
    update: (d, v) => {
      d.flat.shadowStyle = v
    },
  }),
  slider({
    label: 'Shadow opacity',
    min: 0,
    max: 1,
    step: 0.01,
    visible: (s) => hasChrome(s) && s.flat.shadowStyle !== 'none',
    select: (s) => s.flat.shadow,
    update: (d, v) => {
      d.flat.shadow = v
    },
  }),
]
