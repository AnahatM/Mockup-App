import { useId } from 'react'
import { cx } from '@/lib/cx'
import styles from './Toggle.module.css'

export interface ToggleProps {
  checked: boolean
  onChange: (checked: boolean) => void
  label?: string | undefined
  disabled?: boolean | undefined
  className?: string | undefined
}

/**
 * Switch-style boolean. Built on a real checkbox input so keyboard, form and
 * assistive-technology behaviour is native rather than reimplemented.
 */
export function Toggle({
  checked,
  onChange,
  label,
  disabled = false,
  className,
}: ToggleProps) {
  const id = useId()
  return (
    <span className={cx(styles.wrap, className)}>
      <input
        id={id}
        type="checkbox"
        role="switch"
        className={styles.input}
        checked={checked}
        disabled={disabled}
        onChange={(event) => onChange(event.currentTarget.checked)}
      />
      <label htmlFor={id} className={styles.track} aria-label={label}>
        <span className={styles.thumb} />
      </label>
    </span>
  )
}
