import { choice, color, custom, segmented } from '@/ui/controls'
import type { Control } from '@/ui/controls'
import {
  ColorwayPicker,
  FINISH_KINDS,
  FINISH_LABELS,
  PaintPicker,
  SCREEN_FINISHES,
  SCREEN_FINISH_LABELS,
  type ScreenFinish,
} from '@/features/devices'
import type { AppState } from '@/state/types'

const FINISH_OPTIONS = [
  { value: 'spec', label: 'As built' },
  ...FINISH_KINDS.map((value) => ({ value, label: FINISH_LABELS[value] })),
]

/** Colour: factory colourways, a free paint palette, and manual overrides. */
export const finishControls: readonly Control<AppState>[] = [
  custom({ label: 'Colourway', bare: true, render: () => <ColorwayPicker /> }),
  custom({ label: 'Paint', bare: true, render: () => <PaintPicker /> }),
  color({
    label: 'Body',
    select: (s) => s.device.bodyColor,
    update: (d, v) => {
      d.device.bodyColor = v
      d.device.colorway = 'custom'
    },
  }),
  color({
    label: 'Frame',
    select: (s) => s.device.frameColor,
    update: (d, v) => {
      d.device.frameColor = v
      d.device.colorway = 'custom'
    },
  }),
]

/**
 * Finish overrides.
 *
 * 'spec' means "however this device is actually built", which is the default so
 * a device keeps its real construction until deliberately changed.
 */
export const materialControls: readonly Control<AppState>[] = [
  choice({
    label: 'Frame',
    hint: 'The side band.',
    options: FINISH_OPTIONS,
    select: (s) => s.device.frameFinish ?? 'spec',
    update: (d, v) => {
      d.device.frameFinish = v === 'spec' ? null : v
    },
  }),
  choice({
    label: 'Back',
    options: FINISH_OPTIONS,
    select: (s) => s.device.backFinish ?? 'spec',
    update: (d, v) => {
      d.device.backFinish = v === 'spec' ? null : v
    },
  }),
  segmented<AppState, ScreenFinish>({
    label: 'Screen glass',
    hint: 'Glossy mirrors the room; matte scatters it.',
    options: SCREEN_FINISHES.map((value) => ({
      value,
      label: SCREEN_FINISH_LABELS[value],
    })),
    select: (s) => s.device.screenFinish,
    update: (d, v) => {
      d.device.screenFinish = v
    },
  }),
]
