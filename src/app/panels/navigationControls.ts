import { slider, toggle } from '@/ui/controls'
import type { Control } from '@/ui/controls'
import type { AppState } from '@/state/types'
import { supports } from './overlaySupport'

/** Gesture bar, Android nav buttons, desktop menu bar and dock. */
export const navigationControls: readonly Control<AppState>[] = [
  toggle({
    label: 'Gesture bar',
    visible: supports('gesture-bar'),
    select: (s) => s.overlays.gestureBar,
    update: (d, v) => {
      d.overlays.gestureBar = v
    },
  }),
  toggle({
    label: 'Nav buttons',
    hint: 'Three-button navigation instead of the gesture bar.',
    visible: supports('nav-bar-android'),
    select: (s) => s.overlays.navBar,
    update: (d, v) => {
      d.overlays.navBar = v
    },
  }),
  toggle({
    label: 'Dark bar',
    visible: supports('gesture-bar', 'nav-bar-android'),
    select: (s) => s.overlays.gestureBarDark,
    update: (d, v) => {
      d.overlays.gestureBarDark = v
    },
  }),
  toggle({
    label: 'Menu bar',
    visible: supports('menu-bar'),
    select: (s) => s.overlays.menuBar,
    update: (d, v) => {
      d.overlays.menuBar = v
    },
  }),
  toggle({
    label: 'Dock',
    visible: supports('dock'),
    select: (s) => s.overlays.dock,
    update: (d, v) => {
      d.overlays.dock = v
    },
  }),
  slider({
    label: 'Dock items',
    min: 3,
    max: 12,
    step: 1,
    visible: supports('dock'),
    disabled: (s) => !s.overlays.dock,
    select: (s) => s.overlays.dockIcons,
    update: (d, v) => {
      d.overlays.dockIcons = Math.round(v)
    },
  }),
  toggle({
    label: 'Light desktop UI',
    visible: supports('menu-bar', 'dock'),
    select: (s) => s.overlays.menuBarDark,
    update: (d, v) => {
      d.overlays.menuBarDark = v
    },
  }),
]
