import { angle, slider, toggle } from '@/ui/controls'
import type { Control } from '@/ui/controls'
import { resolveDevice } from '@/features/devices'
import type { AppState } from '@/state/types'

/** Only offer a toggle for a part the selected device actually has. */
const hasCameraBump = (state: AppState) =>
  resolveDevice(state.device.specId).cameraBump !== undefined

const hasCutout = (state: AppState) =>
  resolveDevice(state.device.specId).cutout.type !== 'none'

const hasButtons = (state: AppState) =>
  resolveDevice(state.device.specId).buttons.length > 0

/** Which physical details are shown, and how bright the screen is. */
export const detailControls: readonly Control<AppState>[] = [
  toggle({
    label: 'Metal frame',
    select: (s) => s.device.showRails,
    update: (d, v) => {
      d.device.showRails = v
    },
  }),
  toggle({
    label: 'Notch / island',
    visible: hasCutout,
    select: (s) => s.device.showCutout,
    update: (d, v) => {
      d.device.showCutout = v
    },
  }),
  toggle({
    label: 'Camera bump',
    visible: hasCameraBump,
    select: (s) => s.device.showCameraBump,
    update: (d, v) => {
      d.device.showCameraBump = v
    },
  }),
  toggle({
    label: 'Side buttons',
    visible: hasButtons,
    select: (s) => s.device.showButtons,
    update: (d, v) => {
      d.device.showButtons = v
    },
  }),
  slider({
    label: 'Screen brightness',
    min: 0,
    max: 4,
    step: 0.05,
    select: (s) => s.device.screenBrightness,
    update: (d, v) => {
      d.device.screenBrightness = v
    },
  }),
]

/** Orientation and position on the plinth. */
export const placementControls: readonly Control<AppState>[] = [
  angle({
    label: 'Turn',
    min: -180,
    max: 180,
    step: 1,
    select: (s) => s.device.rotation[1],
    update: (d, v) => {
      d.device.rotation = [d.device.rotation[0], v, d.device.rotation[2]]
    },
  }),
  angle({
    label: 'Tilt',
    min: -90,
    max: 90,
    step: 1,
    select: (s) => s.device.rotation[0],
    update: (d, v) => {
      d.device.rotation = [v, d.device.rotation[1], d.device.rotation[2]]
    },
  }),
  angle({
    label: 'Roll',
    min: -180,
    max: 180,
    step: 1,
    select: (s) => s.device.rotation[2],
    update: (d, v) => {
      d.device.rotation = [d.device.rotation[0], d.device.rotation[1], v]
    },
  }),
  toggle({
    label: 'Landscape',
    select: (s) => s.device.landscape,
    update: (d, v) => {
      d.device.landscape = v
    },
  }),
  slider({
    label: 'Levitate',
    hint: 'Lifts the device off the pedestal.',
    min: 0,
    max: 3,
    step: 0.01,
    select: (s) => s.device.levitate,
    update: (d, v) => {
      d.device.levitate = v
    },
  }),
]
