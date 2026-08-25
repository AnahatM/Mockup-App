import { Mesh, MeshBasicMaterial, MeshStandardMaterial, type Object3D, type Texture } from 'three'

/** Finds the mesh the user picked as the screen, by name. */
export function findMeshByName(root: Object3D, name: string): Mesh | null {
  let found: Mesh | null = null
  root.traverse((child) => {
    if (!found && child instanceof Mesh && child.name === name) found = child
  })
  return found
}

/** The picked mesh's colour/emissive as authored, captured once right after
 *  cloning so applying — and later removing — a screenshot can round-trip
 *  back to exactly what the model shipped with. */
export interface ScreenMaterialSnapshot {
  color: number
  emissive: number
  emissiveIntensity: number
}

export function snapshotScreenMaterial(mesh: Mesh): ScreenMaterialSnapshot | null {
  const material = mesh.material
  if (Array.isArray(material)) return null
  if (material instanceof MeshStandardMaterial) {
    return {
      color: material.color.getHex(),
      emissive: material.emissive.getHex(),
      emissiveIntensity: material.emissiveIntensity,
    }
  }
  if (material instanceof MeshBasicMaterial) {
    return { color: material.color.getHex(), emissive: 0, emissiveIntensity: 0 }
  }
  return null
}

/**
 * Applies the user's screenshot to the picked mesh's own material, respecting
 * whatever UVs the mesh was authored with (the map is assigned directly, never
 * re-projected). With no screenshot loaded yet, the mesh instead reverts to
 * `original` — its authored colour and emissive — so importing a model never
 * bleaches its screen to white before the user has uploaded anything.
 *
 * Callers are expected to have already swapped `mesh.material` for a clone,
 * so this never mutates a material other instances of the same GLTF might
 * still be using.
 */
export function applyScreenTexture(
  mesh: Mesh,
  texture: Texture | null,
  brightness: number,
  original: ScreenMaterialSnapshot | null,
): void {
  const material = mesh.material
  if (Array.isArray(material)) return

  /*
   * glTF puts the UV origin at the *top* left, and `GLTFLoader` accordingly
   * loads its own textures with `flipY = false`. Our screenshot does not come
   * from that loader — `TextureLoader` flips on upload so three.js's own
   * bottom-left-origin UVs come out the right way up — so handing it
   * unmodified to an imported mesh renders it upside down.
   *
   * Set here rather than where the texture is built because the same texture
   * object serves both paths, and each has the opposite convention. Only one
   * device is ever mounted, so whichever path is live states what it needs and
   * the procedural screen does the same. See `screenMaterial`.
   */
  if (texture && texture.flipY) {
    texture.flipY = false
    texture.needsUpdate = true
  }

  if (material instanceof MeshStandardMaterial) {
    material.map = texture
    material.emissiveMap = texture
    if (texture) {
      material.color.set(0xffffff)
      material.emissive.set(0xffffff)
      material.emissiveIntensity = brightness
    } else if (original) {
      material.color.setHex(original.color)
      material.emissive.setHex(original.emissive)
      material.emissiveIntensity = original.emissiveIntensity
    }
    material.needsUpdate = true
    return
  }

  // Unlit glTF materials (KHR_materials_unlit) import as MeshBasicMaterial,
  // which has no emissive channel — the map alone is enough since it isn't
  // lit in the first place.
  if (material instanceof MeshBasicMaterial) {
    material.map = texture
    if (texture) material.color.set(0xffffff)
    else if (original) material.color.setHex(original.color)
    material.needsUpdate = true
  }
}
