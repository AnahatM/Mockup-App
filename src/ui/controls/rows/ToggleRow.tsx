import { Field } from '../../Field'
import { Toggle } from '../../Toggle'
import { useControlBinding } from '../ControlBindingContext'
import type { ToggleControl } from '../types'

export function ToggleRow<S>({
  control,
  disabled,
}: {
  control: ToggleControl<S>
  disabled: boolean
}) {
  const binding = useControlBinding<S>()
  const value = binding.useValue(control.select)

  return (
    <Field label={control.label} hint={control.hint}>
      <Toggle
        checked={value}
        disabled={disabled}
        label={control.label}
        onChange={(next) => binding.update((draft) => control.update(draft, next))}
      />
    </Field>
  )
}
