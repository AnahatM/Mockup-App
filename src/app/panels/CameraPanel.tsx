import { Button, Panel } from '@/ui'
import { ControlList, slider, toggle, vec3 } from '@/ui/controls'
import type { Control } from '@/ui/controls'
import { useAppStore } from '@/state/store'
import type { AppState } from '@/state/types'
import styles from './CameraPanel.module.css'

/** Framing and viewport navigation. Angle presets arrive in P6. */

const framingControls: readonly Control<AppState>[] = [
  slider({
    label: 'Field of view',
    hint: 'Lower is more telephoto and flattens perspective.',
    min: 8,
    max: 90,
    step: 1,
    unit: '°',
    select: (s) => s.camera.fov,
    update: (d, v) => {
      d.camera.fov = v
    },
  }),
  vec3({
    label: 'Look at',
    min: -6,
    max: 6,
    step: 0.05,
    select: (s) => s.camera.target,
    update: (d, v) => {
      d.camera.target = [v[0], v[1], v[2]]
    },
  }),
  toggle({
    label: 'Auto rotate',
    select: (s) => s.camera.autoRotate,
    update: (d, v) => {
      d.camera.autoRotate = v
    },
  }),
  slider({
    label: 'Rotate speed',
    min: -8,
    max: 8,
    step: 0.1,
    disabled: (s) => !s.camera.autoRotate,
    select: (s) => s.camera.autoRotateSpeed,
    update: (d, v) => {
      d.camera.autoRotateSpeed = v
    },
  }),
]

const navigationControls: readonly Control<AppState>[] = [
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

export function CameraPanel() {
  const frameDevice = useAppStore((state) => state.frameCurrentDevice)

  return (
    <>
      <Panel title="Framing">
        <ControlList controls={framingControls} />
        <Button icon="camera" size="sm" fullWidth onClick={frameDevice}>
          Frame device
        </Button>
      </Panel>
      <Panel title="Navigation" defaultOpen={false}>
        <p className={styles.help}>
          Drag to orbit · right or middle drag to pan · scroll to zoom
        </p>
        <ControlList controls={navigationControls} />
      </Panel>
    </>
  )
}
