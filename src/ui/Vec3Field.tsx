import { cx } from '@/lib/cx'
import { NumberInput } from './NumberInput'
import styles from './Vec3Field.module.css'

export type Vec3Value = readonly [number, number, number]

export interface Vec3FieldProps {
  value: Vec3Value
  onChange: (value: Vec3Value) => void
  min?: number | undefined
  max?: number | undefined
  step?: number | undefined
  axes?: readonly [string, string, string] | undefined
  disabled?: boolean | undefined
  label?: string | undefined
  className?: string | undefined
}

const DEFAULT_AXES = ['X', 'Y', 'Z'] as const

/** Three numeric inputs for a position, rotation or scale triple. */
export function Vec3Field({
  value,
  onChange,
  min,
  max,
  step,
  axes = DEFAULT_AXES,
  disabled,
  label,
  className,
}: Vec3FieldProps) {
  const setAxis = (index: number, next: number) => {
    const updated: [number, number, number] = [value[0], value[1], value[2]]
    updated[index] = next
    onChange(updated)
  }

  return (
    <div className={cx(styles.row, className)}>
      {axes.map((axis, index) => (
        <label key={axis} className={styles.axis}>
          <span className={styles.axisLabel}>{axis}</span>
          <NumberInput
            className={styles.input}
            value={value[index] ?? 0}
            onChange={(next) => setAxis(index, next)}
            min={min}
            max={max}
            step={step}
            disabled={disabled}
            label={label ? `${label} ${axis}` : axis}
          />
        </label>
      ))}
    </div>
  )
}
