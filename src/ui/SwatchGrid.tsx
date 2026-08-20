import { useMemo, useState } from 'react'
import { Icon } from './Icon'
import { Swatch } from './Swatch'
import { orderBySelection } from './swatchOrder'
import styles from './SwatchGrid.module.css'

export interface SwatchOption {
  id: string
  /** Any CSS colour or gradient. */
  color: string
  label: string
  detail?: string | undefined
}

export interface SwatchGridProps {
  options: readonly SwatchOption[]
  selectedId?: string | undefined
  onSelect: (option: SwatchOption) => void
  /** How many to show before collapsing. */
  visible?: number
}

const DEFAULT_VISIBLE = 4

/**
 * A palette that does not dominate the panel.
 *
 * A full palette is tall enough to push everything below it off screen, and
 * most of the time the user only wants to see what is currently applied. So it
 * shows the selected colour plus a few, and hides the rest behind a count.
 *
 * The selected swatch is always first, so the current colour is visible without
 * expanding — which is the whole point of collapsing it.
 */
export function SwatchGrid({
  options,
  selectedId,
  onSelect,
  visible = DEFAULT_VISIBLE,
}: SwatchGridProps) {
  const [expanded, setExpanded] = useState(false)

  const ordered = useMemo(
    () => orderBySelection(options, selectedId),
    [options, selectedId],
  )

  const shown = expanded ? ordered : ordered.slice(0, visible)
  const hidden = ordered.length - shown.length

  return (
    <div className={styles.wrap}>
      <div className={styles.grid}>
        {shown.map((option) => (
          <Swatch
            key={option.id}
            color={option.color}
            label={option.label}
            detail={option.detail}
            selected={option.id === selectedId}
            onSelect={() => onSelect(option)}
          />
        ))}
      </div>

      {(hidden > 0 || expanded) && (
        <button
          type="button"
          className={styles.toggle}
          aria-expanded={expanded}
          onClick={() => setExpanded((wasExpanded) => !wasExpanded)}
        >
          <Icon name={expanded ? 'chevronUp' : 'chevronDown'} size={11} />
          {expanded ? 'Show fewer' : `Show ${hidden} more`}
        </button>
      )}
    </div>
  )
}
