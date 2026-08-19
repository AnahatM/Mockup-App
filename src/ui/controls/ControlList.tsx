import { useState } from 'react'
import { cx } from '@/lib/cx'
import { Icon } from '../Icon'
import { ControlRow } from './ControlRow'
import { useHighlight } from './HighlightContext'
import styles from './rows/rows.module.css'
import listStyles from './ControlList.module.css'
import type { Control } from './types'

export interface ControlListProps<S> {
  controls: readonly Control<S>[]
  className?: string | undefined
}

/**
 * Renders an array of control definitions. This is the only component a panel
 * needs — a panel file is a list of declarations, not JSX.
 */
export function ControlList<S>({ controls, className }: ControlListProps<S>) {
  return (
    <div className={cx(listStyles.list, className)}>
      {controls.map((control, index) => (
        <HighlightableRow
          key={`${control.kind}:${control.label}:${index}`}
          control={control}
        />
      ))}
    </div>
  )
}

/**
 * One row, wrapped only when it is the control search sent the user to. The
 * wrapper is conditional so the common case adds no element to the DOM.
 */
function HighlightableRow<S>({ control }: { control: Control<S> }) {
  const highlighted = useHighlight() === control.label
  const row = (
    <ControlRow
      control={control}
      renderGroup={(group) => <ControlGroup control={group} />}
    />
  )
  return highlighted ? <div className={listStyles.highlight}>{row}</div> : row
}

function ControlGroup<S>({
  control,
}: {
  control: Extract<Control<S>, { kind: 'group' }>
}) {
  const [open, setOpen] = useState(control.defaultOpen ?? true)

  return (
    <div className={listStyles.list}>
      <button
        type="button"
        className={styles.groupHeader}
        aria-expanded={open}
        onClick={() => setOpen((wasOpen) => !wasOpen)}
      >
        <Icon
          name="chevronRight"
          size={11}
          className={cx(styles.chevron, open && styles.chevronOpen)}
        />
        {control.label}
      </button>
      {open && (
        <div className={styles.group}>
          <ControlList controls={control.children} />
        </div>
      )}
    </div>
  )
}
