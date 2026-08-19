import { cx } from '@/lib/cx'
import { Icon } from './Icon'
import type { IconName } from './icons'
import styles from './Tabs.module.css'

export interface Tab<T extends string> {
  value: T
  label: string
  icon?: IconName | undefined
}

export interface TabsProps<T extends string> {
  value: T
  onChange: (value: T) => void
  tabs: ReadonlyArray<Tab<T>>
  label: string
  /**
   * Wrap onto multiple rows instead of scrolling horizontally.
   *
   * A scrolling strip hides the overflow behind an invisible scrollbar, so a
   * tab clipped mid-word just reads as broken. In a narrow column where several
   * tabs cannot fit, wrapping keeps every one of them reachable and visible.
   */
  wrap?: boolean | undefined
  className?: string | undefined
}

export function Tabs<T extends string>({
  value,
  onChange,
  tabs,
  label,
  wrap = false,
  className,
}: TabsProps<T>) {
  return (
    <div
      className={cx(styles.tabs, wrap && styles.wrap, className)}
      role="tablist"
      aria-label={label}
    >
      {tabs.map((tab) => {
        const selected = tab.value === value
        return (
          <button
            key={tab.value}
            type="button"
            role="tab"
            aria-selected={selected}
            className={cx(styles.tab, selected && styles.selected)}
            onClick={() => onChange(tab.value)}
          >
            {tab.icon && <Icon name={tab.icon} size={14} />}
            <span className={styles.label}>{tab.label}</span>
          </button>
        )
      })}
    </div>
  )
}
