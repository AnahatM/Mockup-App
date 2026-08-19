import { cx } from '@/lib/cx'
import { Icon } from './Icon'
import styles from './Swatch.module.css'

export interface SwatchProps {
  /** Any CSS colour or gradient. */
  color: string
  label: string
  /** Second line — a hex value, a finish name. */
  detail?: string | undefined
  selected?: boolean | undefined
  onSelect: () => void
  className?: string | undefined
}

/**
 * A named colour, as a card rather than a bare chip.
 *
 * A grid of unlabelled circles forces you to hover each one to find out what it
 * is, and gives no way to say "the graphite one" to anyone else. The name is
 * part of the choice, so it is on screen.
 */
export function Swatch({
  color,
  label,
  detail,
  selected = false,
  onSelect,
  className,
}: SwatchProps) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      className={cx(styles.card, selected && styles.selected, className)}
      onClick={onSelect}
    >
      <span className={styles.chip} style={{ background: color }}>
        {selected && <Icon name="check" size={11} className={styles.check} />}
      </span>
      <span className={styles.text}>
        <span className={styles.label}>{label}</span>
        {detail && <span className={styles.detail}>{detail}</span>}
      </span>
    </button>
  )
}
