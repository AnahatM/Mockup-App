import { CanvasTexture, RepeatWrapping, type Texture } from 'three'
import { canvas2d, heightField, paintNormal, paintRoughness } from './canvas'
import type { SurfaceTextureConfig } from './schema'

/**
 * Roughness + normal maps for a procedural surface texture.
 *
 * Cached by the full parameter set — including the base roughness they are
 * layered onto — so every mesh using the same body/frame/pedestal texture
 * config shares one pair of textures instead of regenerating pixels per
 * mesh. Mirrors the cache in `devices/materials/maps.ts`: a plain `Map`
 * keyed by a string of the inputs, checked before any canvas work happens.
 */
export interface SurfaceMaps {
  roughnessMap: Texture | null
  normalMap: Texture | null
}

const cache = new Map<string, SurfaceMaps>()

/** 256px is plenty for a tiled micro-pattern and keeps generation cheap —
 *  see scripts/verify-textures.mjs for the measured cost. */
const TILE_SIZE = 256

function wrap(ctx: CanvasRenderingContext2D): Texture {
  const texture = new CanvasTexture(ctx.canvas)
  texture.wrapS = RepeatWrapping
  texture.wrapT = RepeatWrapping
  texture.anisotropy = 8
  return texture
}

/**
 * Builds, or returns the cached, roughness + normal maps for a texture
 * config. `baseRoughness` is the finish's own roughness value, so the
 * pattern's contrast is layered around the material it dresses rather than
 * an arbitrary mid-grey.
 */
export function buildSurfaceMaps(
  config: SurfaceTextureConfig,
  baseRoughness: number,
): SurfaceMaps {
  if (config.kind === 'none') return { roughnessMap: null, normalMap: null }

  const key = [
    config.kind,
    config.scale,
    config.strength,
    config.contrast,
    config.direction,
    config.seed,
    baseRoughness.toFixed(3),
  ].join(':')
  const existing = cache.get(key)
  if (existing) return existing

  const roughCtx = canvas2d(TILE_SIZE)
  const normalCtx = canvas2d(TILE_SIZE)
  if (!roughCtx || !normalCtx) return { roughnessMap: null, normalMap: null }

  const field = heightField(config.kind, TILE_SIZE, {
    seed: config.seed,
    scale: config.scale,
    direction: config.direction,
  })
  paintRoughness(roughCtx, field, TILE_SIZE, baseRoughness, config.contrast)
  paintNormal(normalCtx, field, TILE_SIZE, config.strength)

  const result: SurfaceMaps = { roughnessMap: wrap(roughCtx), normalMap: wrap(normalCtx) }
  cache.set(key, result)
  return result
}

/** Frees every generated map. Mirrors `devices/materials/disposeMaps()`. */
export function disposeSurfaceMaps(): void {
  for (const { roughnessMap, normalMap } of cache.values()) {
    roughnessMap?.dispose()
    normalMap?.dispose()
  }
  cache.clear()
}
