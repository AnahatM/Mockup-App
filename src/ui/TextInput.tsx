import { cx } from '@/lib/cx'
import styles from './TextInput.module.css'

export interface TextInputProps {
  value: string
  onChange: (value: string) => void
  label?: string | undefined
  placeholder?: string | undefined
  maxLength?: number | undefined
  disabled?: boolean | undefined
  className?: string | undefined
}

/** Single-line text field. Commits on every keystroke — these are short labels. */
export function TextInput({
  value,
  onChange,
  label,
  placeholder,
  maxLength,
  disabled,
  className,
}: TextInputProps) {
  return (
    <input
      type="text"
      className={cx(styles.input, className)}
      value={value}
      placeholder={placeholder}
      maxLength={maxLength}
      disabled={disabled}
      aria-label={label}
      spellCheck={false}
      onChange={(event) => onChange(event.currentTarget.value)}
    />
  )
}
