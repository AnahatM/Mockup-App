import { cx } from '@/lib/cx'
import { Icon } from './Icon'
import { Tooltip } from './Tooltip'
import type { IconName } from './icons'
import styles from './SegmentedControl.module.css'

export interface Segment<T extends string> {
  value: T
  label?: string | undefined
  icon?: IconName | undefined
  /** Falls back to `label`. Required when the segment is icon-only. */
  title?: string | undefined
}

export interface SegmentedControlProps<T extends string> {
  value: T
  onChange: (value: T) => void
  segments: ReadonlyArray<Segment<T>>
  label?: string | undefined
  className?: string | undefined
}

/** Exclusive choice among a small set. Uses a radiogroup so arrow keys work. */
export function SegmentedControl<T extends string>({
  value,
  onChange,
  segments,
  label,
  className,
}: SegmentedControlProps<T>) {
  return (
    <div className={cx(styles.group, className)} role="radiogroup" aria-label={label}>
      {segments.map((segment) => {
        const selected = segment.value === value
        const name = segment.title ?? segment.label ?? segment.value
        const button = (
          <button
            key={segment.value}
            type="button"
            role="radio"
            aria-checked={selected}
            aria-label={segment.label ? undefined : name}
            className={cx(styles.segment, selected && styles.selected)}
            onClick={() => onChange(segment.value)}
          >
            {segment.icon && <Icon name={segment.icon} size={13} />}
            {segment.label}
          </button>
        )

        // Only icon-only segments get a tooltip; on a labelled one it would
        // just repeat the word already printed on the button.
        return segment.label ? (
          button
        ) : (
          <Tooltip key={segment.value} label={name}>
            {button}
          </Tooltip>
        )
      })}
    </div>
  )
}
