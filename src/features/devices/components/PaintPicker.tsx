import { Swatch } from '@/ui'
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
  const current = bodyColor.toLowerCase()

  return (
    <div className={styles.grid}>
      {PAINT_COLORS.map((paint) => (
        <Swatch
          key={paint.id}
          color={paint.body}
          label={paint.label}
          detail={paint.body.toUpperCase()}
          selected={paint.body.toLowerCase() === current}
          onSelect={() => paintDevice(paint.body)}
        />
      ))}
    </div>
  )
}
