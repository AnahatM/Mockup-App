import { choice, number, segmented, text, toggle } from '@/ui/controls'
import type { Control } from '@/ui/controls'
import {
  TITLE_ALIGNMENTS,
  WINDOW_STYLES,
  type TitleAlignment,
  type WindowStyle,
} from '@/features/flat'
import type { AppState } from '@/state/types'

const STYLE_LABELS: Record<WindowStyle, string> = {
  none: 'None',
  macos: 'macOS',
  browser: 'Browser',
}

const framed = (state: AppState) => state.flat.style !== 'none'
const isBrowser = (state: AppState) => state.flat.style === 'browser'

export const windowContentControls: readonly Control<AppState>[] = [
  segmented<AppState, WindowStyle>({
    label: 'Frame',
    hint: 'Wraps the screenshot in window chrome, on the device or on its own.',
    options: WINDOW_STYLES.map((value) => ({ value, label: STYLE_LABELS[value] })),
    select: (s) => s.flat.style,
    update: (d, v) => {
      d.flat.style = v
    },
  }),
  text({
    label: 'Title',
    visible: framed,
    select: (s) => s.flat.title,
    update: (d, v) => {
      d.flat.title = v
    },
  }),
  choice<AppState, TitleAlignment>({
    label: 'Title align',
    options: TITLE_ALIGNMENTS.map((value) => ({
      value,
      label: value === 'left' ? 'Left' : 'Centre',
    })),
    visible: (s) => s.flat.style === 'macos',
    select: (s) => s.flat.titleAlign,
    update: (d, v) => {
      d.flat.titleAlign = v
    },
  }),
  text({
    label: 'URL',
    visible: isBrowser,
    select: (s) => s.flat.url,
    update: (d, v) => {
      d.flat.url = v
    },
  }),
  number({
    label: 'Tabs',
    min: 0,
    max: 6,
    step: 1,
    visible: isBrowser,
    select: (s) => s.flat.tabs,
    update: (d, v) => {
      d.flat.tabs = Math.round(v)
    },
  }),
  toggle({
    label: 'Traffic lights',
    visible: framed,
    select: (s) => s.flat.trafficLights,
    update: (d, v) => {
      d.flat.trafficLights = v
    },
  }),
  toggle({
    label: 'Unfocused',
    hint: 'Grey traffic lights, as an inactive window has.',
    visible: (s) => framed(s) && s.flat.trafficLights,
    select: (s) => s.flat.trafficLightsMuted,
    update: (d, v) => {
      d.flat.trafficLightsMuted = v
    },
  }),
]
