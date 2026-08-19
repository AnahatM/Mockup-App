import { cx } from '@/lib/cx'
import { useAppStore } from '@/state/store'
import { resolveDevice } from '../spec/registry'
import styles from './ColorwayPicker.module.css'

/**
 * Swatch row for the selected device's factory colours.
 *
 * Swatches rather than a dropdown because the choice *is* visual — and because
 * the underlying colours stay editable afterwards, so a colourway is a starting
 * point rather than a fixed option.
 */
export function ColorwayPicker() {
  const specId = useAppStore((state) => state.device.specId)
  const selected = useAppStore((state) => state.device.colorway)
  const selectColorway = useAppStore((state) => state.selectColorway)
  const spec = resolveDevice(specId)

  return (
    <div className={styles.row}>
      {spec.colorways.map((colorway) => (
        <button
          key={colorway.id}
          type="button"
          title={colorway.label}
          aria-label={colorway.label}
          aria-pressed={colorway.id === selected}
          className={cx(styles.swatch, colorway.id === selected && styles.selected)}
          onClick={() => selectColorway(colorway.id)}
        >
          <span
            className={styles.fill}
            style={{
              background: `linear-gradient(135deg, ${colorway.frame ?? colorway.body} 0%, ${colorway.body} 55%)`,
            }}
          />
        </button>
      ))}
    </div>
  )
}
