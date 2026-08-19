import { Field } from '../../Field'
import { Vec3Field } from '../../Vec3Field'
import { useControlBinding } from '../ControlBindingContext'
import type { Vec3Control } from '../types'

export function Vec3Row<S>({
  control,
  disabled,
}: {
  control: Vec3Control<S>
  disabled: boolean
}) {
  const binding = useControlBinding<S>()
  const value = binding.useValue(control.select)

  return (
    <Field label={control.label} stacked hint={control.hint}>
      <Vec3Field
        value={value}
        min={control.min}
        max={control.max}
        disabled={disabled}
        label={control.label}
        step={control.step}
        axes={control.axes}
        onChange={(next) => binding.update((draft) => control.update(draft, next))}
      />
    </Field>
  )
}
