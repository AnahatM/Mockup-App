import { SwatchGrid, type SwatchOption } from '@/ui'
import { useAppStore } from '@/state/store'
import { deviceFinishPalette } from '../finishPalette'
import { PAINT_COLORS, type PaintColor } from '../paint'
import styles from './PaintPicker.module.css'

const toOption = (paint: PaintColor): SwatchOption => ({
  id: paint.body.toLowerCase(),
  color: paint.body,
  label: paint.label,
  detail: paint.body.toUpperCase(),
})

/*
 * Two groups rather than one long grid. A spectrum and a set of real product
 * finishes are different kinds of choice — one is "pick a colour", the other is
 * "match a shipping product" — and interleaving them makes both harder to scan.
 */
const GROUPS = [
  { label: 'Spectrum', options: PAINT_COLORS.map(toOption) },
  { label: 'Product finishes', options: deviceFinishPalette().map(toOption) },
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

  return (
    <div className={styles.groups}>
      {GROUPS.map((group) => (
        <section key={group.label}>
          <p className={styles.groupLabel}>{group.label}</p>
          <SwatchGrid
            options={group.options}
            selectedId={bodyColor.toLowerCase()}
            onSelect={(option) => paintDevice(option.color)}
          />
        </section>
      ))}
    </div>
  )
}
