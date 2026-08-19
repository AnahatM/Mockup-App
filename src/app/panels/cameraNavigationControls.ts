import { segmented, slider, toggle } from '@/ui/controls'
import type { Control } from '@/ui/controls'
import { CAMERA_MODES, type CameraMode } from '@/features/camera'
import type { AppState } from '@/state/types'

/** Viewport navigation: what the mouse does and how fast. */
const isOrbit = (state: AppState) => state.camera.mode === 'orbit'
const isFly = (state: AppState) => state.camera.mode === 'fly'

export const navigationControls: readonly Control<AppState>[] = [
  segmented<AppState, CameraMode>({
    label: 'Mode',
    hint: 'Orbit circles the product. Fly goes anywhere: WASD, R/F, drag to look.',
    options: CAMERA_MODES.map((value) => ({
      value,
      label: value === 'orbit' ? 'Orbit' : 'Fly',
    })),
    select: (s) => s.camera.mode,
    update: (d, v) => {
      d.camera.mode = v
    },
  }),
  slider({
    label: 'Fly speed',
    min: 0.1,
    max: 20,
    step: 0.1,
    visible: isFly,
    select: (s) => s.camera.flySpeed,
    update: (d, v) => {
      d.camera.flySpeed = v
    },
  }),
  slider({
    label: 'Look speed',
    min: 0.05,
    max: 4,
    step: 0.05,
    visible: isFly,
    select: (s) => s.camera.flyLook,
    update: (d, v) => {
      d.camera.flyLook = v
    },
  }),
  toggle({
    label: 'Orbit',
    visible: isOrbit,
    select: (s) => s.camera.enableRotate,
    update: (d, v) => {
      d.camera.enableRotate = v
    },
  }),
  toggle({
    label: 'Pan',
    visible: isOrbit,
    select: (s) => s.camera.enablePan,
    update: (d, v) => {
      d.camera.enablePan = v
    },
  }),
  toggle({
    label: 'Zoom',
    visible: isOrbit,
    select: (s) => s.camera.enableZoom,
    update: (d, v) => {
      d.camera.enableZoom = v
    },
  }),
  slider({
    label: 'Orbit speed',
    visible: isOrbit,
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
    visible: isOrbit,
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
    visible: isOrbit,
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
    visible: isOrbit,
    hint: 'Pan across the view plane, as in a 3D editor.',
    select: (s) => s.camera.screenSpacePanning,
    update: (d, v) => {
      d.camera.screenSpacePanning = v
    },
  }),
  toggle({
    label: 'Orbit below floor',
    visible: isOrbit,
    select: (s) => s.camera.orbitBelowFloor,
    update: (d, v) => {
      d.camera.orbitBelowFloor = v
    },
  }),
  slider({
    label: 'Damping',
    visible: isOrbit,
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
