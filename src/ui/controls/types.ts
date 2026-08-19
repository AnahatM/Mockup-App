import type { Draft } from 'immer'
import type { ReactNode } from 'react'
import type { IconName } from '../icons'

/**
 * A control is DATA, not JSX. See docs/architecture.md.
 *
 * Every control carries a typed `select`/`update` accessor pair rather than a
 * string path into the store, so renaming a state field is a compile error
 * instead of a control that silently stops working.
 */

export interface ControlBase<S> {
  label: string
  /** One short line under the control. */
  hint?: string | undefined
  /** Hide when the control does not apply to the current state. */
  visible?: ((state: S) => boolean) | undefined
  /** Show but disable — use when the control applies but is not available yet. */
  disabled?: ((state: S) => boolean) | undefined
}

export interface Option<T extends string = string> {
  value: T
  label: string
  icon?: IconName | undefined
}

export interface NumericControl<S> extends ControlBase<S> {
  kind: 'slider' | 'number' | 'angle'
  min: number
  max: number
  step?: number | undefined
  unit?: string | undefined
  select: (state: S) => number
  update: (draft: Draft<S>, value: number) => void
}

export interface ToggleControl<S> extends ControlBase<S> {
  kind: 'toggle'
  select: (state: S) => boolean
  update: (draft: Draft<S>, value: boolean) => void
}

export interface ColorControl<S> extends ControlBase<S> {
  kind: 'color'
  select: (state: S) => string
  update: (draft: Draft<S>, value: string) => void
}

export interface ChoiceControl<S> extends ControlBase<S> {
  /** `segmented` for 2-4 short options, `select` for longer lists. */
  kind: 'select' | 'segmented'
  options: readonly Option[]
  select: (state: S) => string
  update: (draft: Draft<S>, value: string) => void
}

export type Vec3 = readonly [number, number, number]

export interface Vec3Control<S> extends ControlBase<S> {
  kind: 'vec3'
  min: number
  max: number
  step?: number | undefined
  /** Axis labels. Defaults to X/Y/Z. */
  axes?: readonly [string, string, string] | undefined
  select: (state: S) => Vec3
  update: (draft: Draft<S>, value: Vec3) => void
}

export interface GroupControl<S> extends ControlBase<S> {
  kind: 'group'
  children: readonly Control<S>[]
  defaultOpen?: boolean | undefined
}

/** Escape hatch for genuinely bespoke UI (media dropzone, preset list). */
export interface CustomControl<S> extends ControlBase<S> {
  kind: 'custom'
  render: () => ReactNode
  /** Renders edge-to-edge without the label column. */
  bare?: boolean | undefined
}

export type Control<S> =
  | NumericControl<S>
  | ToggleControl<S>
  | ColorControl<S>
  | ChoiceControl<S>
  | Vec3Control<S>
  | GroupControl<S>
  | CustomControl<S>
