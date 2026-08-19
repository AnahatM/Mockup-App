import { degToRad, radToDeg } from '@/lib/math/number'
import { Field } from '../../Field'
import { NumberInput } from '../../NumberInput'
import { Slider } from '../../Slider'
import { useControlBinding } from '../ControlBindingContext'
import type { NumericControl } from '../types'
import styles from './rows.module.css'

/**
 * Renders slider, number and angle controls.
 *
 * Angles are stored in radians (what three.js wants) but edited in degrees (what
 * a human wants), and this row is the only place that conversion happens.
 */
export function NumericRow<S>({
  control,
  disabled,
}: {
  control: NumericControl<S>
  disabled: boolean
}) {
  const binding = useControlBinding<S>()
  const stored = binding.useValue(control.select)

  const isAngle = control.kind === 'angle'
  const shown = isAngle ? radToDeg(stored) : stored
  const commit = (next: number) =>
    binding.update((draft) => control.update(draft, isAngle ? degToRad(next) : next))

  const step = control.step ?? 1
  const numberProps = {
    value: shown,
    onChange: commit,
    min: control.min,
    max: control.max,
    step,
    disabled,
    label: control.label,
    unit: control.unit,
  }

  return (
    <Field label={control.label} hint={control.hint}>
      {control.kind === 'number' ? (
        <NumberInput {...numberProps} className={styles.grow} />
      ) : (
        <>
          <Slider
            className={styles.grow}
            value={shown}
            onChange={commit}
            min={control.min}
            max={control.max}
            step={step}
            disabled={disabled}
            label={control.label}
          />
          <NumberInput {...numberProps} className={styles.numeric} />
        </>
      )}
    </Field>
  )
}
