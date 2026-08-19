import { useState } from 'react'
import { cx } from '@/lib/cx'
import { clamp, roundToStep } from '@/lib/math/number'
import styles from './NumberInput.module.css'

export interface NumberInputProps {
  value: number
  onChange: (value: number) => void
  min?: number | undefined
  max?: number | undefined
  step?: number | undefined
  unit?: string | undefined
  disabled?: boolean | undefined
  label?: string | undefined
  className?: string | undefined
}

/**
 * Numeric field that keeps a local text draft while focused.
 *
 * Committing on every keystroke makes intermediate states like "-" or "1." either
 * impossible to type or destructive, so the draft is only parsed and clamped on
 * blur or Enter. Escape abandons the edit.
 */
export function NumberInput({
  value,
  onChange,
  min = -Infinity,
  max = Infinity,
  step = 1,
  unit,
  disabled = false,
  label,
  className,
}: NumberInputProps) {
  const [draft, setDraft] = useState<string | null>(null)
  const [lastValue, setLastValue] = useState(value)

  // Drop the draft when the value changes underneath us (preset load, animation,
  // reset). Adjusting state during render is React's documented pattern for this;
  // an effect would cascade an extra render on every external change.
  if (value !== lastValue) {
    setLastValue(value)
    setDraft(null)
  }

  const commit = (raw: string) => {
    const parsed = Number.parseFloat(raw)
    setDraft(null)
    if (Number.isFinite(parsed)) onChange(clamp(roundToStep(parsed, step), min, max))
  }

  return (
    <span className={cx(styles.wrap, disabled && styles.disabled, className)}>
      <input
        type="text"
        inputMode="decimal"
        className={styles.input}
        value={draft ?? formatValue(value)}
        disabled={disabled}
        aria-label={label}
        onChange={(event) => setDraft(event.currentTarget.value)}
        onBlur={(event) => commit(event.currentTarget.value)}
        onKeyDown={(event) => {
          if (event.key === 'Enter') event.currentTarget.blur()
          if (event.key === 'Escape') {
            setDraft(null)
            event.currentTarget.blur()
          }
        }}
      />
      {unit && <span className={styles.unit}>{unit}</span>}
    </span>
  )
}

/** Trims float noise (0.30000000000000004) without forcing a fixed precision. */
function formatValue(value: number): string {
  return String(Math.round(value * 1e4) / 1e4)
}
