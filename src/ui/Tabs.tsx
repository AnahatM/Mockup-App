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
  className?: string | undefined
}

export function Tabs<T extends string>({
  value,
  onChange,
  tabs,
  label,
  className,
}: TabsProps<T>) {
  return (
    <div className={cx(styles.tabs, className)} role="tablist" aria-label={label}>
      {tabs.map((tab) => {
        const selected = tab.value === value
        return (
          <button
            key={tab.value}
            type="button"
            role="tab"
            title={tab.label}
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
