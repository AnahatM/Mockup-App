import type { Draft } from 'immer'
import { color, segmented, slider, text, toggle, vec3 } from '@/ui/controls'
import type { Control } from '@/ui/controls'
import { LIGHT_FORMS, type LightConfig, type LightForm } from '@/features/lighting'
import type { AppState } from '@/state/types'

/**
 * Builds the control list for one light in the rig.
 *
 * Editing any light means the rig no longer matches its preset, so every update
 * flips `preset` to 'custom' — handled once in `edit` rather than repeated in
 * each control.
 */

function edit<V>(
  index: number,
  apply: (light: Draft<LightConfig>, value: V) => void,
): (draft: Draft<AppState>, value: V) => void {
  return (draft, value) => {
    const light = draft.lighting.lights[index]
    if (!light) return
    apply(light, value)
    draft.lighting.preset = 'custom'
  }
}

const FORM_OPTIONS = LIGHT_FORMS.map((value) => ({
  value,
  label: value === 'rect' ? 'Panel' : value === 'circle' ? 'Disc' : 'Ring',
}))

/** Name, on/off, look and strength — everything but the transform. */
function identityControls(
  index: number,
  light: (state: AppState) => LightConfig | undefined,
): readonly Control<AppState>[] {
  return [
    text({
      label: 'Name',
      maxLength: 48,
      select: (s) => light(s)?.name ?? '',
      update: edit<string>(index, (l, v) => {
        l.name = v
      }),
    }),
    toggle({
      label: 'Enabled',
      select: (s) => light(s)?.enabled ?? false,
      update: edit<boolean>(index, (l, v) => {
        l.enabled = v
      }),
    }),
    segmented<AppState, LightForm>({
      label: 'Shape',
      options: FORM_OPTIONS,
      select: (s) => light(s)?.form ?? 'rect',
      update: edit<LightForm>(index, (l, v) => {
        l.form = v
      }),
    }),
    color({
      label: 'Colour',
      select: (s) => light(s)?.color ?? '#ffffff',
      update: edit<string>(index, (l, v) => {
        l.color = v
      }),
    }),
    slider({
      label: 'Intensity',
      min: 0,
      max: 30,
      step: 0.1,
      select: (s) => light(s)?.intensity ?? 0,
      update: edit<number>(index, (l, v) => {
        l.intensity = v
      }),
    }),
    toggle({
      label: 'Visible in background',
      hint: 'Show this panel itself where the environment is the backdrop, not just its reflections.',
      select: (s) => light(s)?.visibleInBackground ?? false,
      update: edit<boolean>(index, (l, v) => {
        l.visibleInBackground = v
      }),
    }),
  ]
}

/** Where the light is, how big it is, and which way it points. */
function transformControls(
  index: number,
  light: (state: AppState) => LightConfig | undefined,
): readonly Control<AppState>[] {
  return [
    vec3({
      label: 'Position',
      min: -12,
      max: 12,
      step: 0.1,
      select: (s) => light(s)?.position ?? [0, 0, 0],
      update: edit<readonly [number, number, number]>(index, (l, v) => {
        l.position = [v[0], v[1], v[2]]
      }),
    }),
    vec3({
      label: 'Size',
      hint: 'Bigger panels give softer, wider reflections.',
      min: 0.05,
      max: 14,
      step: 0.05,
      axes: ['W', 'H', 'D'],
      select: (s) => light(s)?.scale ?? [1, 1, 1],
      update: edit<readonly [number, number, number]>(index, (l, v) => {
        l.scale = [v[0], v[1], v[2]]
      }),
    }),
    vec3({
      label: 'Rotation',
      hint: 'Leave at zero to keep the light aimed at the product.',
      min: -Math.PI,
      max: Math.PI,
      step: 0.01,
      select: (s) => light(s)?.rotation ?? [0, 0, 0],
      update: edit<readonly [number, number, number]>(index, (l, v) => {
        l.rotation = [v[0], v[1], v[2]]
      }),
    }),
  ]
}

export function lightControls(index: number): readonly Control<AppState>[] {
  const light = (state: AppState): LightConfig | undefined =>
    state.lighting.lights[index]

  return [...identityControls(index, light), ...transformControls(index, light)]
}
