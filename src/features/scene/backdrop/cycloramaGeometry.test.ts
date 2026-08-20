import { describe, expect, it } from 'vitest'
import { Box3, FrontSide, Triangle, Vector3 } from 'three'
import type { BufferAttribute, BufferGeometry } from 'three'
import { buildMaterial, buildSweep } from './cycloramaGeometry'

const boundsOf = (geometry: BufferGeometry): Box3 =>
  new Box3().setFromBufferAttribute(geometry.getAttribute('position') as BufferAttribute)

function vertexAt(geometry: BufferGeometry, index: number): Vector3 {
  const position = geometry.getAttribute('position')
  return new Vector3(position.getX(index), position.getY(index), position.getZ(index))
}

describe('buildSweep', () => {
  it('centres the sweep on the origin instead of sitting off to one side', () => {
    const box = boundsOf(buildSweep())
    // The mesh is 44 units wide; if it were still offset by the old sign bug
    // it would span roughly [22, 66] instead of straddling x = 0.
    expect(box.min.x).toBeCloseTo(-22, 0)
    expect(box.max.x).toBeCloseTo(22, 0)
  })

  it('puts the wall behind the origin and the floor toward the camera', () => {
    const box = boundsOf(buildSweep())
    expect(box.min.z).toBeLessThan(0)
    expect(box.max.z).toBeGreaterThan(0)
  })

  it('has exactly two triangles per profile segment — no implicit closing face', () => {
    // A bare triangle/vertex count check that would fail the instant anything
    // (like `ExtrudeGeometry`'s auto-closed Shape did) adds an extra face
    // beyond the real floor/fillet/wall segments.
    const geometry = buildSweep()
    const index = geometry.getIndex()
    if (!index) throw new Error('expected an indexed geometry')
    const profileCount = geometry.getAttribute('position').count / 2
    expect(index.count / 3).toBe(2 * (profileCount - 1))
  })

  it('never connects the wall-top back to the floor edge — the reported closing-diagonal bug', () => {
    // This is what actually broke desktop devices: `ExtrudeGeometry` treated
    // the open profile as closed and added a face spanning the whole mouth
    // of the cove, from the wall's top straight back to the floor's outer
    // edge. A camera far enough out (a large device's) ended up outside that
    // solid, with this face directly blocking the product. This ribbon only
    // ever connects ADJACENT profile points, so that connection cannot exist.
    const geometry = buildSweep()
    const index = geometry.getIndex()
    if (!index) throw new Error('expected an indexed geometry')
    const profileCount = geometry.getAttribute('position').count / 2
    const lastProfileIndex = profileCount - 1
    const profileIndexOf = (vertexIndex: number) => vertexIndex % profileCount

    for (let i = 0; i < index.count; i += 3) {
      const used = new Set([
        profileIndexOf(index.getX(i)),
        profileIndexOf(index.getX(i + 1)),
        profileIndexOf(index.getX(i + 2)),
      ])
      expect(used.has(0) && used.has(lastProfileIndex)).toBe(false)
    }
  })

  it('faces the room: the floor points up and the wall points toward the camera', () => {
    // The single-sided material only shows the cove from inside on purpose
    // (see `buildMaterial`) — that depends on this winding being correct.
    const geometry = buildSweep()
    const index = geometry.getIndex()
    if (!index) throw new Error('expected an indexed geometry')

    const floor = new Triangle(
      vertexAt(geometry, index.getX(0)),
      vertexAt(geometry, index.getX(1)),
      vertexAt(geometry, index.getX(2)),
    )
    expect(floor.getNormal(new Vector3()).y).toBeGreaterThan(0.9)

    const last = index.count - 3
    const wall = new Triangle(
      vertexAt(geometry, index.getX(last)),
      vertexAt(geometry, index.getX(last + 1)),
      vertexAt(geometry, index.getX(last + 2)),
    )
    expect(wall.getNormal(new Vector3()).z).toBeGreaterThan(0.9)
  })
})

describe('buildMaterial', () => {
  it('colours the sweep', () => {
    const material = buildMaterial('#ff00ff')
    expect(material.color.getHexString()).toBe('ff00ff')
  })

  it('renders only its front side, so a camera outside the cove sees through it', () => {
    // FrontSide is MeshStandardMaterial's default; asserted explicitly since
    // the whole fix depends on this never silently becoming DoubleSide.
    const material = buildMaterial('#e3e1dc')
    expect(material.side).toBe(FrontSide)
  })
})
