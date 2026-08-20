import { Mesh, Texture } from 'three'
import type { BufferGeometry, Material, Object3D } from 'three'

/**
 * Every geometry, material and texture a loaded GLTF scene owns.
 *
 * Deliberately a class-agnostic sweep over known texture-map property names
 * rather than an `instanceof` chain over every material subtype: glTF import
 * commonly produces `MeshStandardMaterial`/`MeshPhysicalMaterial`, but nothing
 * here should silently under-collect (and so leak) if a future importer path
 * hands back something else with the same conventional property names.
 */
export interface GlbResources {
  geometries: ReadonlySet<BufferGeometry>
  materials: ReadonlySet<Material>
  textures: ReadonlySet<Texture>
}

const TEXTURE_KEYS = [
  'map', 'normalMap', 'roughnessMap', 'metalnessMap', 'emissiveMap', 'aoMap',
  'alphaMap', 'bumpMap', 'displacementMap', 'clearcoatMap', 'clearcoatNormalMap',
  'clearcoatRoughnessMap', 'sheenColorMap', 'sheenRoughnessMap', 'transmissionMap',
  'thicknessMap', 'specularMap', 'specularColorMap', 'specularIntensityMap', 'lightMap',
  // Deliberately no `envMap`: that is the shared scene environment, not owned
  // by this material.
] as const

function isTexture(value: unknown): value is Texture {
  return value instanceof Texture
}

function texturesOf(material: Material): Texture[] {
  const record = material as unknown as Record<string, unknown>
  return TEXTURE_KEYS.map((key) => record[key]).filter(isTexture)
}

/**
 * Snapshots ownership right after loading, before anything is mutated (e.g.
 * the screen mesh's material gets swapped for a clone carrying the user's
 * screenshot). Disposing this snapshot later is then correct no matter what
 * happened to the live scene graph afterwards.
 */
export function collectResources(root: Object3D): GlbResources {
  const geometries = new Set<BufferGeometry>()
  const materials = new Set<Material>()
  const textures = new Set<Texture>()

  root.traverse((child) => {
    if (!(child instanceof Mesh)) return
    geometries.add(child.geometry)
    const materialList = Array.isArray(child.material) ? child.material : [child.material]
    for (const material of materialList) {
      materials.add(material)
      for (const texture of texturesOf(material)) textures.add(texture)
    }
  })

  return { geometries, materials, textures }
}

export function disposeResources(resources: GlbResources): void {
  resources.textures.forEach((texture) => texture.dispose())
  resources.materials.forEach((material) => material.dispose())
  resources.geometries.forEach((geometry) => geometry.dispose())
}
