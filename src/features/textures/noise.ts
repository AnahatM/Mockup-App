/**
 * Deterministic, tileable value noise.
 *
 * Pure functions of (position, seed) — no `Math.random` anywhere — so a
 * texture reproduces exactly from its saved seed and is unit-testable.
 * Tiling works by hashing lattice points *modulo the cell count*: the
 * lattice value looked up for `u=0` and the one wrapped back from `u=1` land
 * on the same integer point by construction, so a tile has no seam when
 * repeated.
 */

/** Integer hash -> a pseudo-random float in [0, 1). */
export function hash2(ix: number, iy: number, seed: number): number {
  let h = ix * 374761393 + iy * 668265263 + seed * 2147483647
  h = Math.imul(h ^ (h >>> 13), 1274126177)
  h ^= h >>> 16
  return (h >>> 0) / 4294967296
}

const smoothstep = (t: number): number => t * t * (3 - 2 * t)
const lerp = (a: number, b: number, t: number): number => a + (b - a) * t
const wrap01 = (t: number): number => ((t % 1) + 1) % 1

/**
 * Bilinear value noise on a `cellsU` x `cellsV` integer lattice. `u`, `v` are
 * read modulo 1, and the cell counts are rounded to whole numbers, which is
 * what makes the result tile seamlessly at the [0, 1) x [0, 1) boundary.
 */
export function latticeNoise(
  u: number,
  v: number,
  cellsU: number,
  cellsV: number,
  seed: number,
): number {
  const nu = Math.max(1, Math.round(cellsU))
  const nv = Math.max(1, Math.round(cellsV))
  const gx = wrap01(u) * nu
  const gy = wrap01(v) * nv
  const x0 = Math.floor(gx) % nu
  const y0 = Math.floor(gy) % nv
  const x1 = (x0 + 1) % nu
  const y1 = (y0 + 1) % nv
  const tx = smoothstep(gx - Math.floor(gx))
  const ty = smoothstep(gy - Math.floor(gy))
  const top = lerp(hash2(x0, y0, seed), hash2(x1, y0, seed), tx)
  const bottom = lerp(hash2(x0, y1, seed), hash2(x1, y1, seed), tx)
  return lerp(top, bottom, ty)
}

/**
 * Fractal (multi-octave) value noise, normalised back to [0, 1). Each octave
 * doubles both cell counts and halves its own contribution, so detail gets
 * finer as it gets fainter — the standard "1/f" noise stack.
 */
export function fractalNoise(
  u: number,
  v: number,
  cellsU: number,
  cellsV: number,
  seed: number,
  octaves = 4,
): number {
  let amplitude = 0.5
  let total = 0
  let max = 0
  let freqU = cellsU
  let freqV = cellsV
  for (let o = 0; o < octaves; o += 1) {
    total += latticeNoise(u, v, freqU, freqV, seed + o * 101) * amplitude
    max += amplitude
    amplitude *= 0.5
    freqU *= 2
    freqV *= 2
  }
  return max > 0 ? total / max : 0
}
