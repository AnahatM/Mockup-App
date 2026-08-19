import type { ReactNode } from 'react'
import { useControlBinding } from './ControlBindingContext'
import { ChoiceRow } from './rows/ChoiceRow'
import { ColorRow } from './rows/ColorRow'
import { CustomRow } from './rows/CustomRow'
import { NumericRow } from './rows/NumericRow'
import { TextRow } from './rows/TextRow'
import { ToggleRow } from './rows/ToggleRow'
import { Vec3Row } from './rows/Vec3Row'
import type { Control } from './types'

export interface ControlRowProps<S> {
  control: Control<S>
  /**
   * Groups are rendered by ControlList, which imports this module — delegating
   * back through a prop keeps the two from importing each other.
   */
  renderGroup: (control: Extract<Control<S>, { kind: 'group' }>) => ReactNode
}

/**
 * Dispatches one control definition to its renderer, and owns the shared
 * `visible`/`disabled` predicates so no individual row re-implements them.
 */
/* An exhaustive dispatch over a discriminated union is flat and compiler-checked
   — every branch is a single line — so cyclomatic complexity is a poor proxy here. */
// eslint-disable-next-line complexity
export function ControlRow<S>({ control, renderGroup }: ControlRowProps<S>) {
  const binding = useControlBinding<S>()
  const visible = binding.useValue((state) => control.visible?.(state) ?? true)
  const disabled = binding.useValue((state) => control.disabled?.(state) ?? false)

  if (!visible) return null

  switch (control.kind) {
    case 'slider':
    case 'number':
    case 'angle':
      return <NumericRow control={control} disabled={disabled} />
    case 'toggle':
      return <ToggleRow control={control} disabled={disabled} />
    case 'color':
      return <ColorRow control={control} disabled={disabled} />
    case 'text':
      return <TextRow control={control} disabled={disabled} />
    case 'select':
    case 'segmented':
      return <ChoiceRow control={control} disabled={disabled} />
    case 'vec3':
      return <Vec3Row control={control} disabled={disabled} />
    case 'custom':
      return <CustomRow control={control} />
    case 'group':
      return renderGroup(control)
  }
}
