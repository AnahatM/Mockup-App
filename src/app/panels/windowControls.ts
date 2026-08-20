import { choice, number, segmented, text, toggle } from '@/ui/controls'
import type { Control } from '@/ui/controls'
// From the pure schema module, not the feature barrel: the barrel also
// exports `FlatStudio`, which imports this very file, and these constants
// are read at module top level (in the `.map()` calls below) — reading a
// barrel export while that import cycle is still resolving throws "before
// initialization". See the same note in `windowContainerControls.ts`.
import {
  TITLE_ALIGNMENTS,
  WINDOW_STYLES,
  type TitleAlignment,
  type WindowStyle,
} from '@/features/flat/schema'
import type { AppState } from '@/state/types'

const STYLE_LABELS: Record<WindowStyle, string> = {
  none: 'None',
  macos: 'macOS',
  browser: 'Browser',
}

const hasChrome = (state: AppState) => !state.flat.hideMockup
const framed = (state: AppState) => hasChrome(state) && state.flat.style !== 'none'
const isBrowser = (state: AppState) => framed(state) && state.flat.style === 'browser'

export const windowContentControls: readonly Control<AppState>[] = [
  toggle({
    label: 'Hide mockup',
    hint: 'Renders the screenshot straight onto the backdrop, with no frame, bar, shadow or border.',
    select: (s) => s.flat.hideMockup,
    update: (d, v) => {
      d.flat.hideMockup = v
    },
  }),
  segmented<AppState, WindowStyle>({
    label: 'Frame',
    hint: 'Wraps the screenshot in window chrome, on the device or on its own.',
    options: WINDOW_STYLES.map((value) => ({ value, label: STYLE_LABELS[value] })),
    visible: hasChrome,
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
    visible: (s) => framed(s) && s.flat.style === 'macos',
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
