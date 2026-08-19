import type { CSSProperties, ReactNode } from 'react'
import { cx } from '@/lib/cx'
import { useReveal } from './useReveal'
import styles from './Reveal.module.css'

export interface RevealProps {
  children: ReactNode
  className?: string | undefined
  /** Stagger delay in ms, for a row of siblings revealing in sequence. */
  delay?: number
}

/** Fades and lifts its children in once they scroll into view. See `useReveal`. */
export function Reveal({ children, className, delay = 0 }: RevealProps) {
  const [ref, revealed] = useReveal<HTMLDivElement>()
  const style: CSSProperties | undefined = delay ? { transitionDelay: `${delay}ms` } : undefined

  return (
    <div ref={ref} className={cx(styles.reveal, revealed && styles.revealed, className)} style={style}>
      {children}
    </div>
  )
}
