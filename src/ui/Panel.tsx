import { useState, type ReactNode } from 'react'
import { cx } from '@/lib/cx'
import { Icon } from './Icon'
import styles from './Panel.module.css'

export interface PanelProps {
  title: string
  children: ReactNode
  /** Collapsible sections default to open. */
  collapsible?: boolean | undefined
  defaultOpen?: boolean | undefined
  /** Controls rendered on the right of the header, e.g. a reset button. */
  actions?: ReactNode | undefined
  className?: string | undefined
}

/** A titled section inside the inspector. Groups related controls. */
export function Panel({
  title,
  children,
  collapsible = true,
  defaultOpen = true,
  actions,
  className,
}: PanelProps) {
  const [open, setOpen] = useState(defaultOpen)
  const expanded = collapsible ? open : true

  return (
    <section className={cx(styles.panel, className)}>
      <header className={styles.header}>
        {collapsible ? (
          <button
            type="button"
            className={styles.toggle}
            aria-expanded={expanded}
            onClick={() => setOpen((wasOpen) => !wasOpen)}
          >
            <Icon
              name="chevronRight"
              size={12}
              className={cx(styles.chevron, expanded && styles.chevronOpen)}
            />
            {title}
          </button>
        ) : (
          <span className={styles.staticTitle}>{title}</span>
        )}
        {actions && <div className={styles.actions}>{actions}</div>}
      </header>
      {expanded && <div className={styles.body}>{children}</div>}
    </section>
  )
}
