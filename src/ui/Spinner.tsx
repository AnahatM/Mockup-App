import { cx } from '@/lib/cx'
import styles from './Spinner.module.css'

export interface SpinnerProps {
  /** Diameter in pixels. */
  size?: number
  className?: string | undefined
  /** Accessible label; the spinner carries no visible text of its own. */
  label?: string
}

/**
 * A minimal indeterminate spinner. Pure CSS — no rAF loop — so it costs
 * nothing to keep mounted for the lifetime of whatever it is inside.
 *
 * Respects `prefers-reduced-motion`: spinning is a vestibular trigger for
 * some users, so reduced-motion swaps the rotation for a slow opacity pulse,
 * which still reads as "busy" without the motion.
 */
export function Spinner({ size = 24, className, label = 'Loading' }: SpinnerProps) {
  return (
    <span
      className={cx(styles.spinner, className)}
      style={{ width: size, height: size }}
      role="status"
      aria-label={label}
    />
  )
}
