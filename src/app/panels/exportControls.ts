import { choice, number, slider, text, toggle } from '@/ui/controls'
import type { Control } from '@/ui/controls'
import { SIZE_PRESETS } from '@/features/capture'
import type { AppState } from '@/state/types'

const SIZE_OPTIONS = [
  ...SIZE_PRESETS.map((preset) => ({
    value: preset.id,
    label: `${preset.group} · ${preset.label}`,
  })),
  { value: 'custom', label: 'Custom size' },
]

const isCustom = (state: AppState) => state.exportConfig.sizePreset === 'custom'

export const imageControls: readonly Control<AppState>[] = [
  choice({
    label: 'Size',
    options: SIZE_OPTIONS,
    select: (s) => s.exportConfig.sizePreset,
    update: (d, v) => {
      d.exportConfig.sizePreset = v
    },
  }),
  number({
    label: 'Width',
    min: 64,
    max: 8192,
    step: 1,
    unit: 'px',
    visible: isCustom,
    select: (s) => s.exportConfig.customWidth,
    update: (d, v) => {
      d.exportConfig.customWidth = Math.round(v)
    },
  }),
  number({
    label: 'Height',
    min: 64,
    max: 8192,
    step: 1,
    unit: 'px',
    visible: isCustom,
    select: (s) => s.exportConfig.customHeight,
    update: (d, v) => {
      d.exportConfig.customHeight = Math.round(v)
    },
  }),
  slider({
    label: 'Scale',
    hint: 'Multiplies the size. Quality is independent of your window.',
    min: 1,
    max: 4,
    step: 1,
    unit: '×',
    select: (s) => s.exportConfig.scale,
    update: (d, v) => {
      d.exportConfig.scale = Math.round(v)
    },
  }),
  toggle({
    label: 'Transparent',
    hint: 'Drops the backdrop and keeps the alpha channel.',
    select: (s) => s.exportConfig.transparent,
    update: (d, v) => {
      d.exportConfig.transparent = v
    },
  }),
  text({
    label: 'Filename',
    select: (s) => s.exportConfig.filename,
    update: (d, v) => {
      d.exportConfig.filename = v
    },
  }),
]

export const videoControls: readonly Control<AppState>[] = [
  slider({
    label: 'Duration',
    hint: 'Match the motion duration for a seamless loop.',
    min: 0.5,
    max: 60,
    step: 0.5,
    unit: 's',
    select: (s) => s.exportConfig.videoDuration,
    update: (d, v) => {
      d.exportConfig.videoDuration = v
    },
  }),
  slider({
    label: 'Frame rate',
    min: 12,
    max: 60,
    step: 1,
    unit: 'fps',
    select: (s) => s.exportConfig.fps,
    update: (d, v) => {
      d.exportConfig.fps = Math.round(v)
    },
  }),
  slider({
    label: 'Bitrate',
    min: 1,
    max: 50,
    step: 1,
    unit: 'Mbps',
    select: (s) => s.exportConfig.bitrateMbps,
    update: (d, v) => {
      d.exportConfig.bitrateMbps = Math.round(v)
    },
  }),
]
