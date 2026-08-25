import { useLayoutEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import type { InstancedMesh } from 'three'
import { buildSurfaceMaps, mapsKey } from '@/features/textures'
import { useReducedMotion } from '@/ui'
import { fieldOffsetY, placer, tileFootprint, tileHeight } from './field'
import { writeInstances } from './instances'
import {
  HEX_DENSITY,
  cappedPitch,
  fitPitch,
  hexLattice,
  hexRadius,
  squareLattice,
} from './lattice'
import { useProductBounds } from './useClearance'
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
  const { clear, ceiling } = useProductBounds()

  // Coarsened if the requested pitch would ask for more tiles than one field
  // is allowed. See `fitPitch` for why that beats drawing part of the field.
  const pitch = useMemo(
    () =>
      fitPitch(
        cappedPitch(config.pitch, config.extent),
        Math.PI * config.extent * config.extent,
        config.kind === 'hex' ? HEX_DENSITY : 1,
      ),
    [config.pitch, config.extent, config.kind],
  )

  const cells = useMemo(
    () =>
      config.kind === 'hex'
        ? hexLattice(config.extent, pitch, clear)
        : squareLattice(config.extent, pitch, clear),
    [config.kind, config.extent, pitch, clear],
  )

  const heights = useMemo(
    () => cells.map((cell) => tileHeight(cell, config, ceiling)),
    [cells, config, ceiling],
  )

  const overlay = useMemo(
    () =>
      config.texture.kind === 'none'
        ? null
        : buildSurfaceMaps(config.texture, config.roughness),
    [config.texture, config.roughness],
  )

  const place = useMemo(
    () => placer(cells, heights, config, ceiling),
    [cells, heights, config, ceiling],
  )

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
    // Sunk so the plateau under the product comes out level with the floor —
    // see `fieldOffsetY`, which is also what the test measures against.
    <group position={[0, fieldOffsetY(config, ceiling), 0]}>
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
          key={mapsKey(overlay)}
          roughness={config.roughness}
          metalness={config.metalness}
          roughnessMap={overlay?.roughnessMap ?? null}
          normalMap={overlay?.normalMap ?? null}
        />
      </instancedMesh>
    </group>
  )
}
