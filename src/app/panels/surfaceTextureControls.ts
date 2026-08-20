import type { Draft } from 'immer'
import { choice, number, segmented, slider } from '@/ui/controls'
import type { Control } from '@/ui/controls'
import {
  DIRECTIONAL_KINDS,
  TEXTURE_DIRECTIONS,
  TEXTURE_DIRECTION_LABELS,
  TEXTURE_KINDS,
  TEXTURE_LABELS,
  type SurfaceTextureConfig,
  type SurfaceTextureDirection,
  type SurfaceTextureKind,
} from '@/features/textures'
import type { AppState } from '@/state/types'

const KIND_OPTIONS = TEXTURE_KINDS.map((value) => ({ value, label: TEXTURE_LABELS[value] }))
const DIRECTION_OPTIONS = TEXTURE_DIRECTIONS.map((value) => ({
  value,
  label: TEXTURE_DIRECTION_LABELS[value],
}))

export interface SurfaceTextureLens {
  /** Reads the texture config this control set edits. */
  read: (state: AppState) => SurfaceTextureConfig
  /** Returns the mutable draft of that same config, for the update side. */
  write: (draft: Draft<AppState>) => Draft<SurfaceTextureConfig>
  /** Additional reason the whole set is unavailable, e.g. the parent surface
   *  (the pedestal) being hidden. */
  disabled?: (state: AppState) => boolean
}

/**
 * One reusable control set — pattern, scale, strength, contrast, direction,
 * seed — bound to wherever a `SurfaceTextureConfig` lives in the store. Used
 * for the device body, the device frame and the pedestal alike, so the six
 * knobs stay identical everywhere a procedural texture applies.
 */
export function surfaceTextureControls(lens: SurfaceTextureLens): readonly Control<AppState>[] {
  const { read, write, disabled } = lens
  const off = (s: AppState) => Boolean(disabled?.(s)) || read(s).kind === 'none'
  const isDirectional = (s: AppState) => DIRECTIONAL_KINDS.includes(read(s).kind)

  return [
    choice<AppState, SurfaceTextureKind>({
      label: 'Pattern',
      hint: 'Generated at runtime — no images are ever loaded.',
      options: KIND_OPTIONS,
      disabled,
      select: (s) => read(s).kind,
      update: (d, v) => {
        write(d).kind = v
      },
    }),
    slider({
      label: 'Scale',
      min: 0.25,
      max: 8,
      step: 0.05,
      disabled: off,
      select: (s) => read(s).scale,
      update: (d, v) => {
        write(d).scale = v
      },
    }),
    slider({
      label: 'Strength',
      hint: 'How strongly the pattern bumps the surface under light.',
      min: 0,
      max: 1,
      step: 0.01,
      disabled: off,
      select: (s) => read(s).strength,
      update: (d, v) => {
        write(d).strength = v
      },
    }),
    slider({
      label: 'Contrast',
      hint: 'How much the pattern varies the roughness.',
      min: 0,
      max: 1,
      step: 0.01,
      disabled: off,
      select: (s) => read(s).contrast,
      update: (d, v) => {
        write(d).contrast = v
      },
    }),
    segmented<AppState, SurfaceTextureDirection>({
      label: 'Direction',
      options: DIRECTION_OPTIONS,
      visible: isDirectional,
      disabled,
      select: (s) => read(s).direction,
      update: (d, v) => {
        write(d).direction = v
      },
    }),
    number({
      label: 'Seed',
      hint: 'Same seed, same look — for a reproducible result.',
      min: 0,
      max: 9999,
      step: 1,
      disabled: off,
      select: (s) => read(s).seed,
      update: (d, v) => {
        write(d).seed = Math.round(v)
      },
    }),
  ]
}
