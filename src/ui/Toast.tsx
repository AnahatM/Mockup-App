import { useEffect } from 'react'
import { cx } from '@/lib/cx'
import { Icon } from './Icon'
import type { IconName } from './icons'
import styles from './Toast.module.css'

export type ToastTone = 'success' | 'error' | 'info'

export interface ToastProps {
  message: string
  tone: ToastTone
  onDismiss: () => void
  /** Milliseconds before it removes itself. */
  duration?: number
}

const ICONS: Record<ToastTone, IconName> = {
  success: 'check',
  error: 'close',
  info: 'info',
}

const DEFAULT_DURATION = 4000

/**
 * A transient confirmation.
 *
 * Deliberately not a dialog: it confirms something that already happened, so it
 * must not take focus or need dismissing. It is announced politely rather than
 * assertively for the same reason — an export finishing should not interrupt a
 * screen reader mid-sentence.
 */
export function Toast({
  message,
  tone,
  onDismiss,
  duration = DEFAULT_DURATION,
}: ToastProps) {
  useEffect(() => {
    const timer = window.setTimeout(onDismiss, duration)
    return () => window.clearTimeout(timer)
  }, [duration, onDismiss])

  return (
    <div className={cx(styles.toast, styles[tone])} role="status" aria-live="polite">
      <Icon name={ICONS[tone]} size={14} className={styles.icon} />
      <span className={styles.message}>{message}</span>
      <button
        type="button"
        className={styles.close}
        aria-label="Dismiss"
        onClick={onDismiss}
      >
        <Icon name="close" size={12} />
      </button>
    </div>
  )
}
