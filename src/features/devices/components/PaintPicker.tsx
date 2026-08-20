import { Swatch } from '@/ui'
import { useAppStore } from '@/state/store'
import { deviceFinishPalette } from '../finishPalette'
import { PAINT_COLORS } from '../paint'
import styles from './PaintPicker.module.css'

/*
 * Two groups rather than one long grid. A spectrum and a set of real product
 * finishes are different kinds of choice — one is "pick a colour", the other is
 * "match a shipping product" — and interleaving them makes both harder to scan.
 */
const GROUPS = [
  { label: 'Spectrum', colors: PAINT_COLORS },
  { label: 'Product finishes', colors: deviceFinishPalette() },
] as const

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
    <div className={styles.groups}>
      {GROUPS.map((group) => (
        <section key={group.label}>
          <p className={styles.groupLabel}>{group.label}</p>
          <div className={styles.grid}>
            {group.colors.map((paint) => (
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
        </section>
      ))}
    </div>
  )
}
