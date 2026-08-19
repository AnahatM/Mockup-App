import { useState } from 'react'
import { Select, Swatch } from '@/ui'
import { nameColor } from '@/lib/color/name'
import { useAppStore } from '@/state/store'
import { BRAND_TARGETS } from './brandTargets'
import { mediaPalette } from './schema'
import styles from './PalettePicker.module.css'

const OPTIONS = BRAND_TARGETS.map((target) => ({
  value: target.id,
  label: target.label,
}))

/**
 * Brand colours pulled from the uploaded media.
 *
 * Pick where a colour should go, then click it. One click rather than
 * copy-pasting a hex into three different fields, which is the whole point of
 * extracting the palette in the first place.
 */
export function PalettePicker() {
  const palette = useAppStore((state) => mediaPalette(state.media.source))
  const applyBrandColor = useAppStore((state) => state.applyBrandColor)
  const [target, setTarget] = useState(OPTIONS[0]?.value ?? 'backdrop-accent')

  if (palette.length === 0) return null

  return (
    <div className={styles.wrap}>
      <Select
        value={target}
        onChange={setTarget}
        options={OPTIONS}
        label="Apply colour to"
      />
      <div className={styles.swatches}>
        {palette.map((hex) => (
          <Swatch
            key={hex}
            color={hex}
            label={nameColor(hex)}
            detail={hex.toUpperCase()}
            onSelect={() => applyBrandColor(hex, target)}
          />
        ))}
      </div>
    </div>
  )
}
