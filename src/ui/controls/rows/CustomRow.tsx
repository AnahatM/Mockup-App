import { Field } from '../../Field'
import type { CustomControl } from '../types'

/** Escape hatch for bespoke UI, optionally rendered without the label column. */
export function CustomRow<S>({ control }: { control: CustomControl<S> }) {
  if (control.bare) return <>{control.render()}</>

  return (
    <Field label={control.label} hint={control.hint}>
      {control.render()}
    </Field>
  )
}
