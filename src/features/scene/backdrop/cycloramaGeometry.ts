import {
  BufferGeometry,
  Float32BufferAttribute,
  MeshStandardMaterial,
  Uint16BufferAttribute,
} from 'three'
import { buildSurfaceMaps, type SurfaceTextureConfig } from '@/features/textures'

/**
 * Pure geometry/material builders for `Cyclorama`, kept in their own module
 * (rather than inline) so this stays plain three.js data — no React — and is
 * directly unit-testable in `cycloramaGeometry.test.ts`.
 *
 * Built as an open ribbon (see `buildSweep`), not an `ExtrudeGeometry` solid.
 * That is the actual fix for two related bugs: a "large triangular thing in
 * the background" visible from wide angles, and — reported separately — the
 * largest devices (desktop monitors) vanishing behind a blank wall the
 * moment their camera got far enough away to sit *outside* the old solid.
 * Both traced back to the same cause: `ExtrudeGeometry` treats a `Shape` as
 * closed even when it is drawn open, so it silently added a large flat face
 * closing the gap from the wall's top back to the floor's outer edge. A
 * small device's camera always sat inside that solid; a large device's
 * camera — positioned further out to fit the bigger product in frame — sat
 * outside it, with that face directly between the camera and the product.
 * An open ribbon has no such face at all, at any camera distance.
 */

// Generous enough that the sweep's edges stay out of frame at any sensible
// camera distance — a visible edge is what turns a cove back into a backdrop.
const DEPTH = 44
const FLOOR = 16
const WALL = 18
const CURVE = 4.5
const CURVE_SEGMENTS = 20

/** One point of the cove's cross-section, in (z, y) — profile "across" maps
 *  directly to world Z, profile "up" to world Y (see `buildSweep`). */
interface ProfilePoint {
  z: number
  y: number
}

function buildProfile(): ProfilePoint[] {
  const points: ProfilePoint[] = [
    { z: FLOOR, y: 0 },
    { z: -CURVE, y: 0 },
  ]

  // The fillet: a quadratic Bézier from the floor's inner edge up into the
  // wall, sampled by hand rather than via `THREE.Shape` so nothing ever
  // implicitly closes the path — see the module doc for why that matters.
  const p0 = { z: -CURVE, y: 0 }
  const control = { z: -FLOOR * 0.55, y: 0 }
  const p2 = { z: -FLOOR * 0.55, y: CURVE }
  for (let i = 1; i <= CURVE_SEGMENTS; i += 1) {
    const t = i / CURVE_SEGMENTS
    const mt = 1 - t
    points.push({
      z: mt * mt * p0.z + 2 * mt * t * control.z + t * t * p2.z,
      y: mt * mt * p0.y + 2 * mt * t * control.y + t * t * p2.y,
    })
  }

  points.push({ z: -FLOOR * 0.55, y: WALL })
  return points
}

/**
 * A single-sided ribbon: the floor/fillet/wall profile above, swept straight
 * along X. Two rings of vertices (one per edge of the sweep) with a quad per
 * profile segment between them — nothing at the two open ends, and no face
 * closing the profile's own open mouth, unlike the `ExtrudeGeometry` this
 * replaced.
 *
 * Winding is chosen so the visible (front) side faces into the room: the
 * floor's normal points up (+Y) and the wall's points out toward the camera
 * (+Z), which is what lets a camera positioned outside the cove — a large
 * device's, framed from further back — see straight through it instead of
 * hitting a wall that was never meant to be there.
 */
export function buildSweep(): BufferGeometry {
  const profile = buildProfile()
  const half = DEPTH / 2
  const count = profile.length

  const positions: number[] = []
  for (const point of profile) positions.push(-half, point.y, point.z)
  for (const point of profile) positions.push(half, point.y, point.z)

  const indices: number[] = []
  for (let i = 0; i < count - 1; i += 1) {
    const a = i
    const b = count + i
    const c = count + i + 1
    const d = i + 1
    indices.push(a, b, c, a, c, d)
  }

  const geometry = new BufferGeometry()
  geometry.setAttribute('position', new Float32BufferAttribute(positions, 3))
  geometry.setIndex(new Uint16BufferAttribute(indices, 1))
  // Adjacent quads share vertices at every profile point, so this averages
  // into smooth shading across the fillet instead of faceted flat panels.
  geometry.computeVertexNormals()
  return geometry
}

/** The sweep's own roughness. Named because the procedural texture below is
 *  layered *around* it rather than replacing it — see `buildSurfaceMaps`. */
const ROUGHNESS = 0.78

/** Slightly glossy rather than pure matte: a real cove sweep picks up a soft
 *  sheen from the key light, and that gradient across the floor is most of
 *  what makes the space read as three-dimensional. Single-sided (the
 *  default `FrontSide`) is deliberate — see `buildSweep`.
 *
 *  `texture` is the same procedural surface config the device body and the
 *  pedestal take. A backdrop is the largest surface in frame, so it is also
 *  where a plain flat colour gives the render away fastest. */
export function buildMaterial(
  color: string,
  texture?: SurfaceTextureConfig | undefined,
): MeshStandardMaterial {
  const overlay =
    texture && texture.kind !== 'none' ? buildSurfaceMaps(texture, ROUGHNESS) : null

  return new MeshStandardMaterial({
    color,
    roughness: ROUGHNESS,
    metalness: 0,
    envMapIntensity: 0.85,
    roughnessMap: overlay?.roughnessMap ?? null,
    normalMap: overlay?.normalMap ?? null,

    /*
     * The floor loses the depth test to anything standing on it.
     *
     * The plinth's top face is deliberately coplanar with this floor — a device
     * at y=0 rests on both — so which one is drawn comes down to rasterised
     * depth. The plinth carries its own offset so the contact shadow can win
     * over *it*, and that same offset pushed it behind this sweep, which meant
     * the plinth was never drawn at all: invisible at every size, every colour,
     * and with any procedural texture on it.
     *
     * Ordering the three by offset is what keeps all of it true at once —
     * shadow at 0, plinth at 1, floor here at 2. A backdrop is behind
     * everything by definition, so this is where the largest offset belongs.
     */
    polygonOffset: true,
    polygonOffsetFactor: 2,
    polygonOffsetUnits: 2,
  })
}
