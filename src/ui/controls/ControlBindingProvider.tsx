import { useMemo, type ReactNode } from 'react'
import { ControlBindingContext, type ControlBinding } from './ControlBindingContext'

export interface ControlBindingProviderProps<S> {
  binding: ControlBinding<S>
  children: ReactNode
}

/** Supplies the state binding that every control below it reads and writes through. */
export function ControlBindingProvider<S>({
  binding,
  children,
}: ControlBindingProviderProps<S>) {
  const value = useMemo(() => binding as ControlBinding<unknown>, [binding])
  return (
    <ControlBindingContext.Provider value={value}>
      {children}
    </ControlBindingContext.Provider>
  )
}
