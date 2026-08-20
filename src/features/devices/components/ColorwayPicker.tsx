import { SwatchGrid, type SwatchOption } from '@/ui'
import { useAppStore } from '@/state/store'
import { resolveDevice } from '../spec/registry'

/**
 * The selected device's factory colours.
 *
 * Named cards rather than bare chips because these are real product finishes —
 * "Natural Titanium" is the thing being chosen, not just a shade of grey — and
 * because the colours stay editable afterwards, so a colourway is a starting
 * point rather than a fixed option.
 */
export function ColorwayPicker() {
  const specId = useAppStore((state) => state.device.specId)
  const selected = useAppStore((state) => state.device.colorway)
  const selectColorway = useAppStore((state) => state.selectColorway)
  const spec = resolveDevice(specId)

  const options: SwatchOption[] = spec.colorways.map((colorway) => ({
    id: colorway.id,
    color: `linear-gradient(135deg, ${colorway.frame ?? colorway.body} 0%, ${colorway.body} 55%)`,
    label: colorway.label,
  }))

  return (
    <SwatchGrid
      options={options}
      selectedId={selected}
      onSelect={(option) => selectColorway(option.id)}
    />
  )
}
