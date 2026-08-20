import { LATTICE_KINDS, type StructureConfig } from './schema'
import { TileField } from './TileField'
import { TiledRoom } from './TiledRoom'

/**
 * Geometry standing in front of the painted backdrop.
 *
 * Takes its config as a prop rather than reading the store, matching
 * `Cyclorama` — the backdrop owns this slice of state and passes it down, so
 * there is one component that knows where structure config lives.
 *
 * See ADR 0007 for why a structure is a separate axis from `backdrop.mode`
 * rather than more entries in that enum.
 */
export function Structures({ config }: { config: StructureConfig }) {
  if (config.kind === 'none') return null
  if (LATTICE_KINDS.includes(config.kind)) return <TileField config={config} />
  return <TiledRoom config={config} />
}
