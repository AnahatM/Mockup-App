import { fractalNoise, hash2, latticeNoise } from './noise'
import type { SurfaceTextureDirection, SurfaceTextureKind } from './schema'

/**
 * Per-pattern height fields, valued 0-1, sampled at one pixel of a `size` x
 * `size` tile. Kept as plain functions of position (no canvas, no `three`)
 * so they can be unit tested directly, and so `canvas.ts` is the only
 * DOM-touching module this feature needs.
 */

export interface HeightSample {
  u: number
  v: number
  px: number
  py: number
  size: number
}

export interface HeightConfig {
  seed: number
  scale: number
  direction: SurfaceTextureDirection
}

const clamp01 = (v: number): number => Math.max(0, Math.min(1, v))

/** Splits (u, v) into the axis a brush/scratch runs along and across. */
function alongAcross(u: number, v: number, direction: SurfaceTextureDirection) {
  return direction === 'vertical' ? { along: v, across: u } : { along: u, across: v }
}

function noiseHeight(u: number, v: number, cfg: HeightConfig): number {
  const cells = 3 * cfg.scale
  return fractalNoise(u, v, cells, cells, cfg.seed, 4)
}

function grainHeight(px: number, py: number, size: number, cfg: HeightConfig): number {
  const cell = Math.max(1, Math.round(size / (cfg.scale * 48)))
  return hash2(Math.floor(px / cell), Math.floor(py / cell), cfg.seed)
}

/** Dense directional streaks: coarse along the grain, fine across it. */
function brushedHeight(u: number, v: number, cfg: HeightConfig): number {
  const { along, across } = alongAcross(u, v, cfg.direction)
  const cellsAlong = Math.max(1, 2 * cfg.scale)
  const cellsAcross = Math.max(8, 24 * cfg.scale)
  return fractalNoise(along, across, cellsAlong, cellsAcross, cfg.seed, 3)
}

/** Sparse thin lines: same anisotropy as `brushed`, but thresholded so only
 *  the extremes of the noise survive as visible scratches. */
function scratchesHeight(u: number, v: number, cfg: HeightConfig): number {
  const { along, across } = alongAcross(u, v, cfg.direction)
  const cellsAlong = Math.max(1, 3 * cfg.scale)
  const cellsAcross = Math.max(16, 48 * cfg.scale)
  const n = latticeNoise(along, across, cellsAlong, cellsAcross, cfg.seed) - 0.5
  const sign = n < 0 ? -1 : 1
  const sharp = sign * Math.max(0, Math.abs(n) - 0.3) * 2.6
  return clamp01(0.5 + sharp)
}

/** Two orthogonal thread families raised in a checkerboard, so it reads as
 *  over/under weave rather than a plain grid. */
function weaveHeight(u: number, v: number, cfg: HeightConfig): number {
  const threads = Math.max(2, Math.round(6 * cfg.scale))
  const tx = ((u % 1) + 1) % 1 * threads
  const ty = ((v % 1) + 1) % 1 * threads
  const fx = tx - Math.floor(tx)
  const fy = ty - Math.floor(ty)
  const ix = Math.floor(tx) % threads
  const iy = Math.floor(ty) % threads
  const over = (ix + iy) % 2 === 0
  const profileX = Math.cos(Math.PI * (fx - 0.5))
  const profileY = Math.cos(Math.PI * (fy - 0.5))
  const jitter = (hash2(ix, iy, cfg.seed) - 0.5) * 0.1
  return clamp01(0.5 + 0.35 * (over ? profileX : profileY) + jitter)
}

/** Dispatches to the pattern for `kind`. `none` is handled by the caller. */
export function surfaceHeight(
  kind: SurfaceTextureKind,
  sample: HeightSample,
  cfg: HeightConfig,
): number {
  switch (kind) {
    case 'noise':
      return noiseHeight(sample.u, sample.v, cfg)
    case 'grain':
      return grainHeight(sample.px, sample.py, sample.size, cfg)
    case 'brushed':
      return brushedHeight(sample.u, sample.v, cfg)
    case 'scratches':
      return scratchesHeight(sample.u, sample.v, cfg)
    case 'weave':
      return weaveHeight(sample.u, sample.v, cfg)
    case 'none':
      return 0.5
  }
}
