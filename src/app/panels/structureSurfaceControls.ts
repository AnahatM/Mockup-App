import { color, slider } from '@/ui/controls'
import type { Control } from '@/ui/controls'
import type { AppState } from '@/state/types'
import { surfaceTextureControls } from './surfaceTextureControls'

/**
 * What the backdrop structure is made of, and the procedural texture laid over
 * it — the same six knobs the device body, the device frame and the pedestal
 * take, bound to a different place in the store.
 */

const off = (s: AppState) => s.scene.backdrop.structure.kind === 'none'

export const structureFinishControls: readonly Control<AppState>[] = [
  color({
    label: 'Colour',
    disabled: off,
    select: (s) => s.scene.backdrop.structure.color,
    update: (d, v) => {
      d.scene.backdrop.structure.color = v
    },
  }),
  color({
    label: 'Accent',
    hint: 'Blended in by height, so the field reads as lit rather than painted.',
    disabled: off,
    select: (s) => s.scene.backdrop.structure.accent,
    update: (d, v) => {
      d.scene.backdrop.structure.accent = v
    },
  }),
  slider({
    label: 'Roughness',
    min: 0,
    max: 1,
    step: 0.01,
    disabled: off,
    select: (s) => s.scene.backdrop.structure.roughness,
    update: (d, v) => {
      d.scene.backdrop.structure.roughness = v
    },
  }),
  slider({
    label: 'Metalness',
    min: 0,
    max: 1,
    step: 0.01,
    disabled: off,
    select: (s) => s.scene.backdrop.structure.metalness,
    update: (d, v) => {
      d.scene.backdrop.structure.metalness = v
    },
  }),
]

export const structureTextureControls = surfaceTextureControls({
  read: (s) => s.scene.backdrop.structure.texture,
  write: (d) => d.scene.backdrop.structure.texture,
  disabled: off,
})

/** The cyclorama's sweep is the largest surface in frame, so it is where a
 *  flat colour gives a render away fastest. Same control set again. */
export const cycloramaTextureControls = surfaceTextureControls({
  read: (s) => s.scene.backdrop.texture,
  write: (d) => d.scene.backdrop.texture,
  disabled: (s) => s.scene.backdrop.mode !== 'cyclorama',
})
