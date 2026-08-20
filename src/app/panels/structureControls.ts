import { choice, number, slider } from '@/ui/controls'
import type { Control } from '@/ui/controls'
import { STRUCTURE_KINDS, STRUCTURE_LABELS } from '@/features/scene'
import type { StructureKind } from '@/features/scene'
import type { AppState } from '@/state/types'

/**
 * Shape and motion of the backdrop structure.
 *
 * The finish knobs live next door in `structureSurfaceControls` — not for
 * tidiness, but because "what shape is this" and "what is it made of" are the
 * two questions a user actually asks in sequence, and the file limit here
 * pushes in the same direction.
 */

const KIND_OPTIONS = STRUCTURE_KINDS.map((value) => ({
  value,
  label: STRUCTURE_LABELS[value],
}))

const off = (s: AppState) => s.scene.backdrop.structure.kind === 'none'
const notBlocks = (s: AppState) => s.scene.backdrop.structure.kind !== 'blocks'
const notRoom = (s: AppState) => s.scene.backdrop.structure.kind !== 'room'

export const structureControls: readonly Control<AppState>[] = [
  choice<AppState, StructureKind>({
    label: 'Environment',
    hint: 'Generated from these numbers alone — nothing is loaded from disk.',
    options: KIND_OPTIONS,
    select: (s) => s.scene.backdrop.structure.kind,
    update: (d, v) => {
      d.scene.backdrop.structure.kind = v
    },
  }),
  slider({
    label: 'Size',
    hint: 'How far the field reaches, or the room’s half-width.',
    min: 1,
    max: 24,
    step: 0.5,
    disabled: off,
    select: (s) => s.scene.backdrop.structure.extent,
    update: (d, v) => {
      d.scene.backdrop.structure.extent = v
    },
  }),
  slider({
    label: 'Tile size',
    min: 0.1,
    max: 3,
    step: 0.01,
    disabled: off,
    select: (s) => s.scene.backdrop.structure.pitch,
    update: (d, v) => {
      d.scene.backdrop.structure.pitch = v
    },
  }),
  slider({
    label: 'Gap',
    hint: 'Share of each tile left as a grout line.',
    min: 0,
    max: 1,
    step: 0.01,
    disabled: off,
    select: (s) => s.scene.backdrop.structure.gap,
    update: (d, v) => {
      d.scene.backdrop.structure.gap = v
    },
  }),
  slider({
    label: 'Depth',
    min: 0.02,
    max: 3,
    step: 0.01,
    disabled: off,
    select: (s) => s.scene.backdrop.structure.depth,
    update: (d, v) => {
      d.scene.backdrop.structure.depth = v
    },
  }),
  slider({
    label: 'Relief',
    hint: 'Height variation, rising with distance so the product’s own floor stays flat.',
    min: 0,
    max: 1,
    step: 0.01,
    disabled: off,
    select: (s) => s.scene.backdrop.structure.relief,
    update: (d, v) => {
      d.scene.backdrop.structure.relief = v
    },
  }),
  slider({
    label: 'Wall height',
    min: 1,
    max: 20,
    step: 0.5,
    visible: (s) => !notRoom(s),
    select: (s) => s.scene.backdrop.structure.wallHeight,
    update: (d, v) => {
      d.scene.backdrop.structure.wallHeight = v
    },
  }),
  slider({
    label: 'Pulse height',
    min: 0,
    max: 3,
    step: 0.01,
    visible: (s) => !notBlocks(s),
    select: (s) => s.scene.backdrop.structure.pulse,
    update: (d, v) => {
      d.scene.backdrop.structure.pulse = v
    },
  }),
  slider({
    label: 'Pulse speed',
    hint: 'Cycles per second. Zero holds the wave still.',
    min: 0,
    max: 2,
    step: 0.01,
    visible: (s) => !notBlocks(s),
    select: (s) => s.scene.backdrop.structure.speed,
    update: (d, v) => {
      d.scene.backdrop.structure.speed = v
    },
  }),
  number({
    label: 'Seed',
    hint: 'Same seed, same layout — for a reproducible result.',
    min: 0,
    max: 9999,
    step: 1,
    disabled: off,
    select: (s) => s.scene.backdrop.structure.seed,
    update: (d, v) => {
      d.scene.backdrop.structure.seed = Math.round(v)
    },
  }),
]
