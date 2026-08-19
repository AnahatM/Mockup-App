import { Panel } from '@/ui'
import { ControlList, choice, slider, toggle } from '@/ui/controls'
import type { Control } from '@/ui/controls'
import { CLIPS, findClip } from '@/features/animation'
import { EASINGS, type Easing } from '@/lib/math/easing'
import type { AppState } from '@/state/types'

/** Motion preset, timing and transport. */

const isStatic = (state: AppState) => state.animation.clip === 'none'

const animationControls: readonly Control<AppState>[] = [
  choice({
    label: 'Motion',
    options: CLIPS.map((clip) => ({ value: clip.id, label: clip.label })),
    select: (s) => s.animation.clip,
    update: (d, v) => {
      d.animation.clip = v
      // Looping a one-shot clip just freezes on its last frame, so default it off.
      d.animation.loop = findClip(v)?.seamless ?? true
    },
  }),
  slider({
    label: 'Duration',
    hint: 'Seconds for one cycle.',
    min: 0.2,
    max: 60,
    step: 0.1,
    unit: 's',
    disabled: isStatic,
    select: (s) => s.animation.duration,
    update: (d, v) => {
      d.animation.duration = v
    },
  }),
  choice<AppState, Easing>({
    label: 'Easing',
    options: EASINGS.map((value) => ({ value, label: label(value) })),
    disabled: isStatic,
    select: (s) => s.animation.easing,
    update: (d, v) => {
      d.animation.easing = v
    },
  }),
  slider({
    label: 'Amount',
    hint: 'Scales the movement. Negative reverses it.',
    min: -3,
    max: 3,
    step: 0.05,
    disabled: isStatic,
    select: (s) => s.animation.amplitude,
    update: (d, v) => {
      d.animation.amplitude = v
    },
  }),
  toggle({
    label: 'Loop',
    disabled: isStatic,
    select: (s) => s.animation.loop,
    update: (d, v) => {
      d.animation.loop = v
    },
  }),
  toggle({
    label: 'Play',
    disabled: isStatic,
    select: (s) => s.animation.playing,
    update: (d, v) => {
      d.animation.playing = v
    },
  }),
  slider({
    label: 'Scrub',
    hint: 'Position through the cycle while paused.',
    min: 0,
    max: 1,
    step: 0.001,
    disabled: (s) => isStatic(s) || s.animation.playing,
    select: (s) => s.animation.progress,
    update: (d, v) => {
      d.animation.progress = v
    },
  }),
]

function label(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1).replace(/-/g, ' ')
}

export function AnimationPanel() {
  return (
    <Panel title="Motion">
      <ControlList controls={animationControls} />
    </Panel>
  )
}
