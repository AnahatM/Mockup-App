import { Panel } from '@/ui'
import { ControlList, slider, toggle } from '@/ui/controls'
import type { Control } from '@/ui/controls'
import type { AppState } from '@/state/types'

/** Shadow, exposure and post-processing controls. */

const shadowControls: readonly Control<AppState>[] = [
  toggle({
    label: 'Contact shadow',
    select: (s) => s.scene.shadow.enabled,
    update: (d, v) => {
      d.scene.shadow.enabled = v
    },
  }),
  slider({
    label: 'Opacity',
    min: 0,
    max: 1,
    step: 0.01,
    disabled: (s) => !s.scene.shadow.enabled,
    select: (s) => s.scene.shadow.opacity,
    update: (d, v) => {
      d.scene.shadow.opacity = v
    },
  }),
  slider({
    label: 'Blur',
    min: 0,
    max: 10,
    step: 0.1,
    disabled: (s) => !s.scene.shadow.enabled,
    select: (s) => s.scene.shadow.blur,
    update: (d, v) => {
      d.scene.shadow.blur = v
    },
  }),
  slider({
    label: 'Spread',
    min: 0.5,
    max: 20,
    step: 0.1,
    disabled: (s) => !s.scene.shadow.enabled,
    select: (s) => s.scene.shadow.scale,
    update: (d, v) => {
      d.scene.shadow.scale = v
    },
  }),
]

const renderControls: readonly Control<AppState>[] = [
  slider({
    label: 'Exposure',
    hint: 'Overall brightness, applied by the tone mapper.',
    min: 0,
    max: 3,
    step: 0.01,
    select: (s) => s.scene.exposure,
    update: (d, v) => {
      d.scene.exposure = v
    },
  }),
  toggle({
    label: 'Bloom',
    hint: 'Turns bright rim lights into visible glow.',
    select: (s) => s.scene.post.bloomEnabled,
    update: (d, v) => {
      d.scene.post.bloomEnabled = v
    },
  }),
  slider({
    label: 'Bloom amount',
    min: 0,
    max: 4,
    step: 0.01,
    disabled: (s) => !s.scene.post.bloomEnabled,
    select: (s) => s.scene.post.bloomIntensity,
    update: (d, v) => {
      d.scene.post.bloomIntensity = v
    },
  }),
  slider({
    label: 'Bloom threshold',
    hint: 'Only pixels brighter than this glow.',
    min: 0,
    max: 1,
    step: 0.01,
    disabled: (s) => !s.scene.post.bloomEnabled,
    select: (s) => s.scene.post.bloomThreshold,
    update: (d, v) => {
      d.scene.post.bloomThreshold = v
    },
  }),
  toggle({
    label: 'Vignette',
    select: (s) => s.scene.post.vignetteEnabled,
    update: (d, v) => {
      d.scene.post.vignetteEnabled = v
    },
  }),
  slider({
    label: 'Vignette amount',
    min: 0,
    max: 1,
    step: 0.01,
    disabled: (s) => !s.scene.post.vignetteEnabled,
    select: (s) => s.scene.post.vignetteDarkness,
    update: (d, v) => {
      d.scene.post.vignetteDarkness = v
    },
  }),
  toggle({
    label: 'Depth of field',
    hint: 'Expensive, and easy to overdo.',
    select: (s) => s.scene.post.depthOfFieldEnabled,
    update: (d, v) => {
      d.scene.post.depthOfFieldEnabled = v
    },
  }),
  slider({
    label: 'Bokeh',
    min: 0,
    max: 12,
    step: 0.1,
    disabled: (s) => !s.scene.post.depthOfFieldEnabled,
    select: (s) => s.scene.post.bokehScale,
    update: (d, v) => {
      d.scene.post.bokehScale = v
    },
  }),
]

export function RenderPanel() {
  return (
    <>
      <Panel title="Shadow">
        <ControlList controls={shadowControls} />
      </Panel>
      <Panel title="Render">
        <ControlList controls={renderControls} />
      </Panel>
    </>
  )
}
