import { useEffect, useRef, useState, type ReactNode } from 'react'
import { cx } from '@/lib/cx'
import styles from './Tooltip.module.css'

export type TooltipSide = 'top' | 'bottom' | 'left' | 'right'

export interface TooltipProps {
  label: ReactNode
  side?: TooltipSide
  /** Delay before showing, so sweeping across a toolbar stays quiet. */
  delay?: number
  /** Applied to the wrapper — use it when the wrapped control must stretch. */
  className?: string | undefined
  children: ReactNode
}

/**
 * A styled tooltip, replacing the browser's `title` attribute.
 *
 * The native one cannot be styled, appears after an uncontrollable delay,
 * renders in the OS font, and never appears on keyboard focus at all — so a
 * toolbar of icon buttons is unlabelled for anyone not using a mouse. This shows
 * on hover and on focus.
 *
 * It is deliberately presentational: the wrapped control is expected to carry
 * its own `aria-label`, so the tooltip repeats a name that is already announced
 * rather than being the only source of it. That keeps it safe to drop around
 * anything without auditing what the control exposes to assistive tech.
 */
export function Tooltip({
  label,
  side = 'top',
  delay = 260,
  className,
  children,
}: TooltipProps) {
  const [open, setOpen] = useState(false)
  const timer = useRef<number | undefined>(undefined)

  useEffect(() => () => window.clearTimeout(timer.current), [])

  const show = () => {
    window.clearTimeout(timer.current)
    timer.current = window.setTimeout(() => setOpen(true), delay)
  }

  const hide = () => {
    window.clearTimeout(timer.current)
    setOpen(false)
  }

  return (
    <span
      className={cx(styles.wrap, className)}
      onPointerEnter={show}
      onPointerLeave={hide}
      onPointerDown={hide}
      onFocus={show}
      onBlur={hide}
    >
      {children}
      {open && (
        <span role="presentation" className={cx(styles.tip, styles[side])}>
          {label}
        </span>
      )}
    </span>
  )
}
