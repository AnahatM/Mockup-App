import { ColorField } from '../../ColorField'
import { Field } from '../../Field'
import { useControlBinding } from '../ControlBindingContext'
import type { ColorControl } from '../types'

export function ColorRow<S>({
  control,
  disabled,
}: {
  control: ColorControl<S>
  disabled: boolean
}) {
  const binding = useControlBinding<S>()
  const value = binding.useValue(control.select)

  return (
    <Field label={control.label} hint={control.hint}>
      <ColorField
        value={value}
        disabled={disabled}
        label={control.label}
        onChange={(next) => binding.update((draft) => control.update(draft, next))}
      />
    </Field>
  )
}
