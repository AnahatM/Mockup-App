import { Field } from '../../Field'
import { SegmentedControl } from '../../SegmentedControl'
import { Select } from '../../Select'
import { useControlBinding } from '../ControlBindingContext'
import type { ChoiceControl } from '../types'

export function ChoiceRow<S>({
  control,
  disabled,
}: {
  control: ChoiceControl<S>
  disabled: boolean
}) {
  const binding = useControlBinding<S>()
  const value = binding.useValue(control.select)
  const onChange = (next: string) =>
    binding.update((draft) => control.update(draft, next))

  return (
    <Field
      label={control.label}
      stacked={control.kind === 'segmented' && control.options.length > 3}
      hint={control.hint}
    >
      {control.kind === 'segmented' ? (
        <SegmentedControl
          value={value}
          onChange={onChange}
          label={control.label}
          segments={control.options.map((option) => ({
            value: option.value,
            label: option.label,
            icon: option.icon,
          }))}
        />
      ) : (
        <Select
          value={value}
          onChange={onChange}
          options={control.options}
          disabled={disabled}
          label={control.label}
        />
      )}
    </Field>
  )
}
