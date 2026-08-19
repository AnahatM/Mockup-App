import type { Draft } from 'immer'
import { createContext, useContext } from 'react'

/**
 * How a control reaches application state.
 *
 * `ui/` must not know about the app store, so the binding is injected. `useValue`
 * is deliberately hook-shaped: each control subscribes to only its own slice of
 * state, which means dragging one slider does not re-render the whole inspector,
 * and an animation writing camera state every frame does not either.
 */
export interface ControlBinding<S> {
  useValue: <V>(select: (state: S) => V) => V
  update: (recipe: (draft: Draft<S>) => void) => void
}

// The binding is generic per app, but a context cannot be; `unknown` is narrowed
// by `useControlBinding<S>()` at the single point of use.
export const ControlBindingContext = createContext<ControlBinding<unknown> | null>(null)

export function useControlBinding<S>(): ControlBinding<S> {
  const binding = useContext(ControlBindingContext)
  if (!binding) {
    throw new Error('Controls must be rendered inside <ControlBindingProvider>')
  }
  return binding as ControlBinding<S>
}
