import { useLayoutEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import type { InstancedMesh } from 'three'
import { buildSurfaceMaps } from '@/features/textures'
import { useReducedMotion } from '@/ui'
import { blockRise, tileFootprint, tileHeight, tileTint } from './field'
import { writeInstances, type Placement } from './instances'
import {
  HEX_DENSITY,
  fitPitch,
  hexLattice,
  hexRadius,
  squareLattice,
  type Cell,
} from './lattice'
import { BACKDROP_LAYER } from '../layers'
import type { StructureConfig } from './schema'

/**
 * A field of instanced tiles: hexagons, squares, or squares that pulsate.
 *
 * One draw call for the whole field, which is what makes a few thousand tiles
 * affordable at all. The tiles share a unit-height geometry and get their real
 * height from the instance matrix, so changing the relief never rebuilds a
 * buffer — it rewrites matrices, which is far cheaper and is what keeps
 * dragging the slider smooth.
 */
export function TileField({ config }: { config: StructureConfig }) {
  const mesh = useRef<InstancedMesh>(null)
  const reducedMotion = useReducedMotion()

  // Coarsened if the requested pitch would ask for more tiles than one field
  // is allowed. See `fitPitch` for why that beats drawing part of the field.
  const pitch = useMemo(
    () =>
      fitPitch(
        config.pitch,
        Math.PI * config.extent * config.extent,
        config.kind === 'hex' ? HEX_DENSITY : 1,
      ),
    [config.pitch, config.extent, config.kind],
  )

  const cells = useMemo(
    () =>
      config.kind === 'hex'
        ? hexLattice(config.extent, pitch)
        : squareLattice(config.extent, pitch),
    [config.kind, config.extent, pitch],
  )

  const heights = useMemo(
    () => cells.map((cell) => tileHeight(cell, config)),
    [cells, config],
  )

  const overlay = useMemo(
    () =>
      config.texture.kind === 'none'
        ? null
        : buildSurfaceMaps(config.texture, config.roughness),
    [config.texture, config.roughness],
  )

  const place = useMemo(() => placer(cells, heights, config), [cells, heights, config])

  // The resting pose. Written on layout rather than in an effect so the field
  // is never visible for a frame stacked at the origin.
  useLayoutEffect(() => {
    if (mesh.current) {
      mesh.current.layers.set(BACKDROP_LAYER)
      writeInstances(mesh.current, cells.length, (i) => place(i, 0), {
        color: config.color,
        accent: config.accent,
      })
    }
  }, [cells.length, place, config.color, config.accent])

  // Only the block field animates. The other two kinds must not run a frame
  // loop at all — a static field that rewrites every matrix each frame is pure
  // cost. Reduced motion holds the wave at its resting pose rather than
  // removing it, so the composition is unchanged, just still.
  const animated = config.kind === 'blocks' && config.speed > 0 && !reducedMotion
  useFrame(({ clock }) => {
    if (!animated || !mesh.current) return
    writeInstances(mesh.current, cells.length, (i) => place(i, clock.elapsedTime), {
      color: config.color,
      accent: config.accent,
    })
  })

  const footprint = tileFootprint(pitch, config.gap)
  const radius = hexRadius(pitch) * (1 - config.gap)

  return (
    <instancedMesh
      ref={mesh}
      args={[undefined, undefined, Math.max(cells.length, 1)]}
      // Casting is off, not an oversight: a mesh on the backdrop layer is
      // invisible to the lights' shadow cameras anyway, and a field of
      // thousands of tiles shadowing itself costs far more than it shows.
      receiveShadow
    >
      {config.kind === 'hex' ? (
        <cylinderGeometry args={[radius, radius, 1, 6]} />
      ) : (
        <boxGeometry args={[footprint, 1, footprint]} />
      )}
      <meshStandardMaterial
        roughness={config.roughness}
        metalness={config.metalness}
        roughnessMap={overlay?.roughnessMap ?? null}
        normalMap={overlay?.normalMap ?? null}
      />
    </instancedMesh>
  )
}

/**
 * Builds the per-instance placement callback.
 *
 * Returns a function of (index, time) rather than closing over the time, so
 * the animated and static paths share one definition of where a tile goes and
 * cannot drift apart.
 */
function placer(cells: Cell[], heights: number[], config: StructureConfig) {
  return (index: number, time: number): Placement => {
    const cell = cells[index] ?? { x: 0, z: 0, falloff: 0 }
    const height = heights[index] ?? config.depth
    const rise = config.kind === 'blocks' ? blockRise(cell, config, time) : 0

    return {
      // The geometry is unit-height and centred, so a tile resting on the
      // floor sits at half its own height.
      position: [cell.x, height / 2 + rise, cell.z],
      scale: [1, height, 1],
      tint: tileTint(height, config),
    }
  }
}
