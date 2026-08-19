import { useId, useRef, useState, type ReactElement, type ReactNode } from 'react'
import { cx } from '@/lib/cx'
import styles from './Tooltip.module.css'

export type TooltipSide = 'top' | 'bottom' | 'left' | 'right'

export interface TooltipProps {
  label: ReactNode
  side?: TooltipSide
  /** Delay before showing, so sweeping across a toolbar stays quiet. */
  delay?: number
  children: ReactElement<{
    'aria-describedby'?: string
    onFocus?: () => void
    onBlur?: () => void
  }>
}

/**
 * A styled tooltip, replacing the browser's `title` attribute.
 *
 * The native one cannot be styled, appears after an uncontrollable delay,
 * renders in the OS font, and never appears on keyboard focus at all — so a
 * toolbar of icon buttons is unlabelled for anyone not using a mouse. This shows
 * on hover *and* focus, and is wired with `aria-describedby` so it is announced
 * rather than merely drawn.
 */
export function Tooltip({ label, side = 'top', delay = 260, children }: TooltipProps) {
  const [open, setOpen] = useState(false)
  const timer = useRef<number | undefined>(undefined)
  const id = useId()

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
      className={styles.wrap}
      onPointerEnter={show}
      onPointerLeave={hide}
      onPointerDown={hide}
    >
      <span onFocus={show} onBlur={hide}>
        {children}
      </span>
      {open && (
        <span role="tooltip" id={id} className={cx(styles.tip, styles[side])}>
          {label}
        </span>
      )}
    </span>
  )
}
