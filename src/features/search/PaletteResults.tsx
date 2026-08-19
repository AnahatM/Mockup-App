import { useEffect, useMemo, useRef } from 'react'
import { cx } from '@/lib/cx'
import { Icon } from '@/ui'
import { groupItems } from './rank'
import type { SearchItem } from './types'
import styles from './CommandPalette.module.css'

export interface PaletteResultsProps {
  results: readonly SearchItem[]
  /** Index into `results` in render order. */
  cursor: number
  onChoose: (item: SearchItem) => void
}

/** The grouped result list, and the scroll-into-view behaviour for the cursor. */
export function PaletteResults({ results, cursor, onChoose }: PaletteResultsProps) {
  const listRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    listRef.current
      ?.querySelector('[data-active="true"]')
      ?.scrollIntoView({ block: 'nearest' })
  }, [cursor])

  // Render order matches `results`, so each item's position in that array is
  // also its keyboard index. Precomputed rather than counted during render.
  const positions = useMemo(
    () => new Map(results.map((item, index) => [item.id, index])),
    [results],
  )

  if (results.length === 0) {
    return <p className={styles.empty}>No matches.</p>
  }

  return (
    <div className={styles.results} ref={listRef} role="listbox" aria-label="Results">
      {groupItems(results).map(({ group, items }) => (
        <div key={group} className={styles.group}>
          <p className={styles.groupLabel}>{group}</p>
          {items.map((item) => {
            const active = positions.get(item.id) === cursor
            return (
              <button
                key={item.id}
                type="button"
                role="option"
                aria-selected={active}
                data-active={active}
                className={cx(styles.result, active && styles.resultActive)}
                onClick={() => onChoose(item)}
              >
                <Icon name={item.icon} size={14} className={styles.resultIcon} />
                <span className={styles.resultTitle}>{item.title}</span>
                {item.subtitle && (
                  <span className={styles.resultSubtitle}>{item.subtitle}</span>
                )}
              </button>
            )
          })}
        </div>
      ))}
    </div>
  )
}
