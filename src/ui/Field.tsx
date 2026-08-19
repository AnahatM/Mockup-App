import { type ReactNode } from 'react'
import { cx } from '@/lib/cx'
import styles from './Field.module.css'

export interface FieldProps {
  label: string
  children: ReactNode
  /** Short clarification shown under the control. Keep it to one line. */
  hint?: string | undefined
  /** Stacks the control under the label instead of beside it. */
  stacked?: boolean | undefined
  className?: string | undefined
}

/**
 * The one label-plus-control row used by every panel. Centralising it is what
 * keeps label width, alignment and hint styling identical across the whole app
 * without any panel having to think about layout.
 */
export function Field({ label, children, hint, stacked, className }: FieldProps) {
  return (
    <div className={cx(styles.field, stacked && styles.stacked, className)}>
      <span className={styles.label} title={label}>
        {label}
      </span>
      <div className={styles.control}>{children}</div>
      {hint && <p className={styles.hint}>{hint}</p>}
    </div>
  )
}
