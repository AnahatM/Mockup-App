import type { ReactNode } from 'react'
import { cx } from '@/lib/cx'
import { Icon } from './Icon'
import type { IconName } from './icons'
import styles from './EmptyState.module.css'

export interface EmptyStateProps {
  icon: IconName
  title: string
  description?: string | undefined
  action?: ReactNode | undefined
  /**
   * Element for the title.
   *
   * A paragraph is right for an empty list inside a panel, but wrong when the
   * empty state *is* the page — a page whose main message is not a heading has
   * no heading at all, which breaks document outline and screen-reader
   * navigation. Pages pass `h1`.
   */
  titleAs?: 'p' | 'h1' | 'h2'
  className?: string | undefined
}

/** Shown wherever a list or slot has nothing in it yet. */
export function EmptyState({
  icon,
  title,
  description,
  action,
  titleAs: Title = 'p',
  className,
}: EmptyStateProps) {
  return (
    <div className={cx(styles.empty, className)}>
      <Icon name={icon} size={22} className={styles.icon} />
      <Title className={styles.title}>{title}</Title>
      {description && <p className={styles.description}>{description}</p>}
      {action}
    </div>
  )
}
