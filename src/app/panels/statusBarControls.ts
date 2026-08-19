import { slider, text, toggle } from '@/ui/controls'
import type { Control } from '@/ui/controls'
import type { AppState } from '@/state/types'
import { supports } from './overlaySupport'

/** Time, carrier, signal, wifi and battery. */
export const statusBarControls: readonly Control<AppState>[] = [
  toggle({
    label: 'Status bar',
    hint: 'Time, signal, wifi and battery.',
    visible: supports('status-bar-ios', 'status-bar-android'),
    select: (s) => s.overlays.statusBar,
    update: (d, v) => {
      d.overlays.statusBar = v
    },
  }),
  text({
    label: 'Time',
    visible: supports('status-bar-ios', 'status-bar-android', 'menu-bar'),
    select: (s) => s.overlays.time,
    update: (d, v) => {
      d.overlays.time = v
    },
  }),
  text({
    label: 'Carrier',
    hint: 'Leave blank to hide.',
    visible: supports('status-bar-ios', 'status-bar-android'),
    select: (s) => s.overlays.carrier,
    update: (d, v) => {
      d.overlays.carrier = v
    },
  }),
  toggle({
    label: 'Dark glyphs',
    hint: 'For light app content.',
    visible: supports('status-bar-ios', 'status-bar-android'),
    select: (s) => s.overlays.statusBarDark,
    update: (d, v) => {
      d.overlays.statusBarDark = v
    },
  }),
  toggle({
    label: 'Signal',
    visible: supports('status-bar-ios', 'status-bar-android'),
    select: (s) => s.overlays.showSignal,
    update: (d, v) => {
      d.overlays.showSignal = v
    },
  }),
  toggle({
    label: 'Wi-Fi',
    visible: supports('status-bar-ios', 'status-bar-android'),
    select: (s) => s.overlays.showWifi,
    update: (d, v) => {
      d.overlays.showWifi = v
    },
  }),
  toggle({
    label: 'Battery',
    visible: supports('status-bar-ios', 'status-bar-android'),
    select: (s) => s.overlays.showBattery,
    update: (d, v) => {
      d.overlays.showBattery = v
    },
  }),
  slider({
    label: 'Charge',
    min: 0,
    max: 1,
    step: 0.01,
    visible: supports('status-bar-ios', 'status-bar-android'),
    disabled: (s) => !s.overlays.showBattery,
    select: (s) => s.overlays.batteryLevel,
    update: (d, v) => {
      d.overlays.batteryLevel = v
    },
  }),
]
