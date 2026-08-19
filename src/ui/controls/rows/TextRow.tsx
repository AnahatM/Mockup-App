import { Field } from '../../Field'
import { TextInput } from '../../TextInput'
import { useControlBinding } from '../ControlBindingContext'
import type { TextControl } from '../types'

export function TextRow<S>({
  control,
  disabled,
}: {
  control: TextControl<S>
  disabled: boolean
}) {
  const binding = useControlBinding<S>()
  const value = binding.useValue(control.select)

  return (
    <Field label={control.label} hint={control.hint}>
      <TextInput
        value={value}
        disabled={disabled}
        label={control.label}
        placeholder={control.placeholder}
        maxLength={control.maxLength}
        onChange={(next) => binding.update((draft) => control.update(draft, next))}
      />
    </Field>
  )
}
