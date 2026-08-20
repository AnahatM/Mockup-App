import { z } from 'zod'
import { hexSchema, unitSchema } from '@/lib/schema/primitives'
import { surfaceTextureSchema } from '@/features/textures/schema'

/**
 * Structured backdrop environments — the thing that turns a painted gradient
 * into a place.
 *
 * Deliberately a *separate* config from `backdropSchema.mode` rather than more
 * entries in that enum. A mode paints the scene's background; a structure is
 * real geometry standing in front of it. Keeping them apart is what lets a
 * warm gradient sit behind a hex-tiled floor, which is the combination that
 * actually reads as depth — see docs/adr for why F6 was never going to be
 * solved by a better gradient.
 *
 * Every kind is generated from these numbers alone. No bundled meshes, no
 * downloaded HDRIs: a preset that saves a structure reproduces it exactly on
 * a machine that has never been online.
 */

export const STRUCTURE_KINDS = ['none', 'hex', 'tiles', 'room', 'blocks'] as const
export type StructureKind = (typeof STRUCTURE_KINDS)[number]

export const STRUCTURE_LABELS: Record<StructureKind, string> = {
  none: 'None',
  hex: 'Hexagon tiles',
  tiles: 'Tiled floor',
  room: 'Tiled room',
  blocks: 'Pulsating blocks',
}

/** Kinds laid out on a lattice of instances, as opposed to the built room. */
export const LATTICE_KINDS: readonly StructureKind[] = ['hex', 'tiles', 'blocks']

export const structureSchema = z.object({
  kind: z.enum(STRUCTURE_KINDS).default('none'),
  /** Centre-to-centre spacing of the lattice, in world units. */
  pitch: z.number().min(0.1).max(3).default(0.55),
  /** Share of the pitch left as a grout line between neighbours. */
  gap: unitSchema.default(0.12),
  /** Radius of the field, or half-width of the room's floor. */
  extent: z.number().min(1).max(24).default(8),
  /** Extrusion of a single tile or the resting height of a block. */
  depth: z.number().min(0.02).max(3).default(0.16),
  /** How much taller tiles get towards the edge of the field. Keeps the
   *  product's own patch of floor flat while the surround gains relief. */
  relief: unitSchema.default(0.5),
  color: hexSchema.default('#d9d6d0'),
  /** Blended in by height, so the field reads as lit rather than painted. */
  accent: hexSchema.default('#b7c2d4'),
  roughness: unitSchema.default(0.72),
  metalness: unitSchema.default(0.04),
  /** Blocks only: peak rise of the oscillation, in world units. */
  pulse: z.number().min(0).max(3).default(0.45),
  /** Blocks only: cycles per second. Zero freezes the wave at its resting pose. */
  speed: z.number().min(0).max(2).default(0.25),
  /** Room only: how far the walls rise above the floor. */
  wallHeight: z.number().min(1).max(20).default(7),
  /** Same six knobs as every other surface — see `features/textures`. */
  texture: surfaceTextureSchema.prefault({}),
  /** Reproducibility: the same seed always lays out the same relief. */
  seed: z.number().int().min(0).max(9999).default(7),
})

export type StructureConfig = z.infer<typeof structureSchema>

export const defaultStructure = (): StructureConfig => structureSchema.parse({})
