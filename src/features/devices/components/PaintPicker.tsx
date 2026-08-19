import { cx } from '@/lib/cx'
import { useAppStore } from '@/state/store'
import { PAINT_COLORS } from '../paint'
import styles from './PaintPicker.module.css'

/**
 * Free colour palette for the device body.
 *
 * Sits alongside the factory colourways rather than replacing them: a mockup
 * sometimes wants the real product finish and sometimes wants to match a brand.
 */
export function PaintPicker() {
  const bodyColor = useAppStore((state) => state.device.bodyColor)
  const paintDevice = useAppStore((state) => state.paintDevice)

  return (
    <div className={styles.grid}>
      {PAINT_COLORS.map((paint) => (
        <button
          key={paint.id}
          type="button"
          title={paint.label}
          aria-label={paint.label}
          aria-pressed={paint.body.toLowerCase() === bodyColor.toLowerCase()}
          className={cx(
            styles.swatch,
            paint.body.toLowerCase() === bodyColor.toLowerCase() && styles.selected,
          )}
          onClick={() => paintDevice(paint.body)}
        >
          <span className={styles.fill} style={{ background: paint.body }} />
        </button>
      ))}
    </div>
  )
}
