import { color, custom, segmented, slider, toggle } from '@/ui/controls'
import type { Control } from '@/ui/controls'
import { Dropzone, PalettePicker } from '@/features/media'
import { FIT_MODES, type FitMode } from '@/lib/media/fit'
import type { AppState } from '@/state/types'

const hasMedia = (state: AppState) => state.media.source.kind !== 'none'
const hasVideo = (state: AppState) => state.media.source.kind === 'video'

export { hasVideo }

export const contentControls: readonly Control<AppState>[] = [
  custom({ label: 'Media', bare: true, render: () => <Dropzone /> }),
  segmented<AppState, FitMode>({
    label: 'Fit',
    options: FIT_MODES.map((value) => ({
      value,
      label: value.charAt(0).toUpperCase() + value.slice(1),
    })),
    visible: hasMedia,
    select: (s) => s.screen.fit,
    update: (d, v) => {
      d.screen.fit = v
    },
  }),
  slider({
    label: 'Zoom',
    min: 0.2,
    max: 4,
    step: 0.01,
    visible: hasMedia,
    select: (s) => s.screen.zoom,
    update: (d, v) => {
      d.screen.zoom = v
    },
  }),
  slider({
    label: 'Pan X',
    min: -1,
    max: 1,
    step: 0.01,
    visible: hasMedia,
    select: (s) => s.screen.panX,
    update: (d, v) => {
      d.screen.panX = v
    },
  }),
  slider({
    label: 'Pan Y',
    min: -1,
    max: 1,
    step: 0.01,
    visible: hasMedia,
    select: (s) => s.screen.panY,
    update: (d, v) => {
      d.screen.panY = v
    },
  }),
  custom({
    label: 'Brand colours',
    bare: true,
    visible: hasMedia,
    render: () => <PalettePicker />,
  }),
  color({
    label: 'Background',
    hint: 'Shows around the media when fitted, and when nothing is loaded.',
    select: (s) => s.screen.background,
    update: (d, v) => {
      d.screen.background = v
    },
  }),
]

export const playbackControls: readonly Control<AppState>[] = [
  toggle({
    label: 'Play',
    select: (s) => s.screen.playing,
    update: (d, v) => {
      d.screen.playing = v
    },
  }),
  toggle({
    label: 'Loop',
    select: (s) => s.screen.loop,
    update: (d, v) => {
      d.screen.loop = v
    },
  }),
  toggle({
    label: 'Muted',
    select: (s) => s.screen.muted,
    update: (d, v) => {
      d.screen.muted = v
    },
  }),
  slider({
    label: 'Speed',
    min: 0.25,
    max: 4,
    step: 0.05,
    unit: '×',
    select: (s) => s.screen.rate,
    update: (d, v) => {
      d.screen.rate = v
    },
  }),
]
