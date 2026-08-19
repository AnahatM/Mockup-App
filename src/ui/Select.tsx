import { cx } from '@/lib/cx'
import { Icon } from './Icon'
import styles from './Select.module.css'

export interface SelectOption<T extends string> {
  value: T
  label: string
}

export interface SelectProps<T extends string> {
  value: T
  onChange: (value: T) => void
  options: ReadonlyArray<SelectOption<T>>
  disabled?: boolean | undefined
  label?: string | undefined
  className?: string | undefined
}

/**
 * Native select under token styling. A custom listbox would buy nothing here and
 * would cost keyboard behaviour, type-ahead and mobile ergonomics.
 */
export function Select<T extends string>({
  value,
  onChange,
  options,
  disabled = false,
  label,
  className,
}: SelectProps<T>) {
  return (
    <span className={cx(styles.wrap, disabled && styles.disabled, className)}>
      <select
        className={styles.select}
        value={value}
        disabled={disabled}
        aria-label={label}
        onChange={(event) => onChange(event.currentTarget.value as T)}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <Icon name="chevronDown" size={13} className={styles.chevron} />
    </span>
  )
}
