import { useState } from 'react'
import { cx } from '@/lib/cx'
import { Icon } from '@/ui'
import { DocsSidebar } from './DocsSidebar'
import styles from './Docs.module.css'

/**
 * The "Contents" rail on an article page.
 *
 * Below the `mobile` breakpoint (see design-tokens.md) it is a disclosure
 * rather than a permanently-visible column — collapsed by default so it does
 * not stand between a reader and the article, but always one tap away rather
 * than hidden. It owns its own open state so `DocArticlePage` does not have
 * to.
 */
export function DocContentsRail({ activeSlug }: { activeSlug: string }) {
  const [open, setOpen] = useState(false)

  return (
    <aside className={styles.rail}>
      <button
        type="button"
        className={styles.railToggle}
        aria-expanded={open}
        onClick={() => setOpen((wasOpen) => !wasOpen)}
      >
        <Icon name="book" size={14} />
        Contents
        <Icon
          name={open ? 'chevronUp' : 'chevronDown'}
          size={13}
          className={styles.railChevron}
        />
      </button>
      <div className={cx(styles.railBody, open && styles.railBodyOpen)}>
        <DocsSidebar activeSlug={activeSlug} />
      </div>
    </aside>
  )
}
