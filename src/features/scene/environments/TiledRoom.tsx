import { useLayoutEffect, useMemo, useRef } from 'react'
import type { InstancedMesh } from 'three'
import { buildSurfaceMaps } from '@/features/textures'
import { writeInstances } from './instances'
import { roomTiles } from './room'
import { tileFootprint } from './field'
import type { StructureConfig } from './schema'

/**
 * A real room: tiled floor, four tiled walls, and genuine corners where they
 * meet.
 *
 * The corners are the point. A painted vignette can fake a darkened edge, but
 * only actual geometry meeting at an angle lets the ambient-occlusion pass
 * darken the join and the light rig fall off across it — which is what the
 * request for "real room shading" was asking for. See `room.ts` for why every
 * tile is a single-sided plane rather than a box.
 */
export function TiledRoom({ config }: { config: StructureConfig }) {
  const mesh = useRef<InstancedMesh>(null)

  const tiles = useMemo(() => roomTiles(config), [config])

  const overlay = useMemo(
    () =>
      config.texture.kind === 'none'
        ? null
        : buildSurfaceMaps(config.texture, config.roughness),
    [config.texture, config.roughness],
  )

  useLayoutEffect(() => {
    if (!mesh.current) return
    writeInstances(mesh.current, tiles.length, (i) => tiles[i] ?? EMPTY, {
      color: config.color,
      accent: config.accent,
    })
  }, [tiles, config.color, config.accent])

  const footprint = tileFootprint(config)

  return (
    <instancedMesh
      ref={mesh}
      args={[undefined, undefined, Math.max(tiles.length, 1)]}
      receiveShadow
    >
      <planeGeometry args={[footprint, footprint]} />
      <meshStandardMaterial
        roughness={config.roughness}
        metalness={config.metalness}
        roughnessMap={overlay?.roughnessMap ?? null}
        normalMap={overlay?.normalMap ?? null}
        // Single-sided, deliberately, and left at the default rather than set
        // explicitly so nobody "fixes" it to DoubleSide later: every tile is
        // already oriented to face into the room, and being culled from
        // outside is the property that stops the walls occluding the product
        // when the camera leaves. See `room.ts`.
      />
    </instancedMesh>
  )
}

/** Stands in if an index somehow falls outside the tile list, so the writer
 *  never has to deal with `undefined` under `noUncheckedIndexedAccess`. */
const EMPTY = { position: [0, 0, 0] } as const
