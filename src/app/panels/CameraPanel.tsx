import { Panel } from '@/ui'
import { ControlList, slider, toggle, vec3 } from '@/ui/controls'
import type { Control } from '@/ui/controls'
import type { AppState } from '@/state/types'

/** Framing and orbit behaviour. Angle presets arrive in P6. */
const cameraControls: readonly Control<AppState>[] = [
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
  toggle({
    label: 'Allow panning',
    select: (s) => s.camera.enablePan,
    update: (d, v) => {
      d.camera.enablePan = v
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
  return (
    <Panel title="Camera">
      <ControlList controls={cameraControls} />
    </Panel>
  )
}
