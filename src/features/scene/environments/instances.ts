import { Color, Euler, Matrix4, Quaternion, Vector3, type InstancedMesh } from 'three'

/**
 * Writes an instanced mesh's per-instance transforms and tints.
 *
 * The scratch objects below are allocated once at module scope rather than per
 * call, because the pulsating block field runs this every frame: allocating a
 * `Matrix4` and three vectors per tile per frame would hand the garbage
 * collector thousands of short-lived objects a second, and the resulting
 * collection pauses are exactly the stutter the animation is meant to avoid.
 *
 * Shared mutable module state is safe here only because this is synchronous
 * and single-threaded — it must never be made async.
 */

const matrix = new Matrix4()
const position = new Vector3()
const scale = new Vector3()
const rotation = new Quaternion()
const euler = new Euler()
const tint = new Color()
const base = new Color()
const accent = new Color()

export interface Placement {
  /** Centre of this instance, in the field's local space. */
  position: readonly [number, number, number]
  /** Multiplies the shared geometry. Defaults to no scaling. */
  scale?: readonly [number, number, number] | undefined
  /** Euler angles in radians. Defaults to unrotated. Carrying rotation per
   *  instance is what lets the room's floor and its four walls share a single
   *  instanced mesh — and therefore a single draw call — despite facing five
   *  different directions. */
  rotation?: readonly [number, number, number] | undefined
  /** 0-1 blend from the base colour towards the accent. */
  tint?: number | undefined
}

export interface InstancePalette {
  color: string
  accent: string
}

/**
 * Fills `mesh` with `count` instances, asking `place` for each one.
 *
 * `palette` is optional: pass it only for fields that vary colour per tile,
 * since writing an instance colour buffer that never changes costs memory for
 * nothing.
 */
export function writeInstances(
  mesh: InstancedMesh,
  count: number,
  place: (index: number) => Placement,
  palette?: InstancePalette | undefined,
): void {
  if (palette) {
    base.set(palette.color)
    accent.set(palette.accent)
  }

  for (let index = 0; index < count; index += 1) {
    const placement = place(index)
    position.set(...placement.position)
    scale.set(...(placement.scale ?? [1, 1, 1]))
    euler.set(...(placement.rotation ?? [0, 0, 0]))
    rotation.setFromEuler(euler)
    matrix.compose(position, rotation, scale)
    mesh.setMatrixAt(index, matrix)

    if (palette) {
      tint.copy(base).lerp(accent, placement.tint ?? 0)
      mesh.setColorAt(index, tint)
    }
  }

  mesh.count = count
  mesh.instanceMatrix.needsUpdate = true
  // `instanceColor` only exists once `setColorAt` has been called at least
  // once, so this cannot be hoisted out of the guard.
  if (palette && mesh.instanceColor) mesh.instanceColor.needsUpdate = true
}
