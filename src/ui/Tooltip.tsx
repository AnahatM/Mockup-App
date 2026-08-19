import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { cx } from '@/lib/cx'
import { place, type Side } from '@/lib/dom/placement'
import styles from './Tooltip.module.css'

export type TooltipSide = Side

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
 * toolbar of icon buttons is unlabelled for anyone not using a mouse.
 *
 * Positioned with `fixed` against measured rectangles rather than with CSS
 * offsets. That buys two things CSS alone cannot: it flips and clamps to stay
 * on screen for controls near a viewport edge, and it escapes any scrolling or
 * `overflow: hidden` ancestor that would otherwise clip it.
 *
 * It is deliberately presentational: the wrapped control carries its own
 * `aria-label`, so the tooltip repeats a name that is already announced rather
 * than being the only source of it.
 */
export function Tooltip({
  label,
  side = 'top',
  delay = 260,
  className,
  children,
}: TooltipProps) {
  const [open, setOpen] = useState(false)
  const [placement, setPlacement] = useState<{ left: number; top: number } | null>(null)
  const timer = useRef<number | undefined>(undefined)
  const anchor = useRef<HTMLSpanElement>(null)
  const tip = useRef<HTMLSpanElement>(null)

  useEffect(() => () => window.clearTimeout(timer.current), [])

  const show = useCallback(() => {
    window.clearTimeout(timer.current)
    timer.current = window.setTimeout(() => setOpen(true), delay)
  }, [delay])

  const hide = useCallback(() => {
    window.clearTimeout(timer.current)
    setOpen(false)
    setPlacement(null)
  }, [])

  // Measured after paint, because the tip's size is only known once it exists.
  // It renders invisible for that one frame rather than flashing in the wrong
  // place first.
  useLayoutEffect(() => {
    if (!open) return
    const anchorNode = anchor.current
    const tipNode = tip.current
    if (!anchorNode || !tipNode) return

    setPlacement(
      place({
        anchor: anchorNode.getBoundingClientRect(),
        floating: tipNode.getBoundingClientRect(),
        viewport: { left: 0, top: 0, width: innerWidth, height: innerHeight },
        preferred: side,
      }),
    )
  }, [open, side])

  return (
    <span
      ref={anchor}
      className={cx(styles.wrap, className)}
      onPointerEnter={show}
      onPointerLeave={hide}
      onPointerDown={hide}
      onFocus={show}
      onBlur={hide}
    >
      {children}
      {open && (
        <span
          ref={tip}
          role="presentation"
          className={cx(styles.tip, placement && styles.placed)}
          style={placement ?? undefined}
        >
          {label}
        </span>
      )}
    </span>
  )
}
