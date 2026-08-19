import { slider, toggle } from '@/ui/controls'
import type { Control } from '@/ui/controls'
import type { AppState } from '@/state/types'

/** Viewport navigation: what the mouse does and how fast. */
export const navigationControls: readonly Control<AppState>[] = [
  toggle({
    label: 'Orbit',
    select: (s) => s.camera.enableRotate,
    update: (d, v) => {
      d.camera.enableRotate = v
    },
  }),
  toggle({
    label: 'Pan',
    select: (s) => s.camera.enablePan,
    update: (d, v) => {
      d.camera.enablePan = v
    },
  }),
  toggle({
    label: 'Zoom',
    select: (s) => s.camera.enableZoom,
    update: (d, v) => {
      d.camera.enableZoom = v
    },
  }),
  slider({
    label: 'Orbit speed',
    min: 0.1,
    max: 3,
    step: 0.05,
    select: (s) => s.camera.rotateSpeed,
    update: (d, v) => {
      d.camera.rotateSpeed = v
    },
  }),
  slider({
    label: 'Pan speed',
    min: 0.1,
    max: 3,
    step: 0.05,
    select: (s) => s.camera.panSpeed,
    update: (d, v) => {
      d.camera.panSpeed = v
    },
  }),
  slider({
    label: 'Zoom speed',
    min: 0.1,
    max: 3,
    step: 0.05,
    select: (s) => s.camera.zoomSpeed,
    update: (d, v) => {
      d.camera.zoomSpeed = v
    },
  }),
  toggle({
    label: 'Screen-space pan',
    hint: 'Pan across the view plane, as in a 3D editor.',
    select: (s) => s.camera.screenSpacePanning,
    update: (d, v) => {
      d.camera.screenSpacePanning = v
    },
  }),
  toggle({
    label: 'Orbit below floor',
    select: (s) => s.camera.orbitBelowFloor,
    update: (d, v) => {
      d.camera.orbitBelowFloor = v
    },
  }),
  slider({
    label: 'Damping',
    hint: 'Higher is snappier.',
    min: 0.01,
    max: 1,
    step: 0.01,
    select: (s) => s.camera.damping,
    update: (d, v) => {
      d.camera.damping = v
    },
  }),
]
