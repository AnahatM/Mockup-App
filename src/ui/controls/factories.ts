import type { Draft } from 'immer'
import type {
  ChoiceControl,
  ColorControl,
  Control,
  CustomControl,
  GroupControl,
  NumericControl,
  Option,
  ToggleControl,
  Vec3Control,
} from './types'

/**
 * Typed constructors for control definitions.
 *
 * They exist for two reasons. First, they let TypeScript infer the state type `S`
 * from the accessors, so a panel never has to annotate it. Second, `choice` keeps
 * the option values and the update callback bound to the same string-literal union
 * at the call site, while storing them widened in the control union — which is the
 * only place a cast is needed, contained in one function instead of every panel.
 */

export const slider = <S>(def: Omit<NumericControl<S>, 'kind'>): Control<S> => ({
  ...def,
  kind: 'slider',
})

export const number = <S>(def: Omit<NumericControl<S>, 'kind'>): Control<S> => ({
  ...def,
  kind: 'number',
})

/** Numeric control whose stored value is radians but which is edited in degrees. */
export const angle = <S>(def: Omit<NumericControl<S>, 'kind'>): Control<S> => ({
  unit: '°',
  ...def,
  kind: 'angle',
})

export const toggle = <S>(def: Omit<ToggleControl<S>, 'kind'>): Control<S> => ({
  ...def,
  kind: 'toggle',
})

export const color = <S>(def: Omit<ColorControl<S>, 'kind'>): Control<S> => ({
  ...def,
  kind: 'color',
})

interface ChoiceDef<S, T extends string> {
  label: string
  options: readonly Option<T>[]
  select: (state: S) => T
  update: (draft: Draft<S>, value: T) => void
  hint?: string | undefined
  visible?: ((state: S) => boolean) | undefined
  disabled?: ((state: S) => boolean) | undefined
}

function makeChoice<S, T extends string>(
  kind: ChoiceControl<S>['kind'],
  def: ChoiceDef<S, T>,
): Control<S> {
  return {
    ...def,
    kind,
    // Safe by construction: `options` only ever contains values of type T, so the
    // string handed back to `update` is always one of them.
    update: (draft, value) => def.update(draft, value as T),
  }
}

export const choice = <S, T extends string>(def: ChoiceDef<S, T>): Control<S> =>
  makeChoice('select', def)

export const segmented = <S, T extends string>(def: ChoiceDef<S, T>): Control<S> =>
  makeChoice('segmented', def)

export const vec3 = <S>(def: Omit<Vec3Control<S>, 'kind'>): Control<S> => ({
  ...def,
  kind: 'vec3',
})

export const group = <S>(def: Omit<GroupControl<S>, 'kind'>): Control<S> => ({
  ...def,
  kind: 'group',
})

export const custom = <S>(def: Omit<CustomControl<S>, 'kind'>): Control<S> => ({
  ...def,
  kind: 'custom',
})
