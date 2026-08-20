import { useEffect, useMemo, useRef } from 'react'
import { Box3, Mesh, type Texture } from 'three'
import { useGLTF } from '@react-three/drei'
import {
  applyScreenTexture,
  findMeshByName,
  snapshotScreenMaterial,
  type ScreenMaterialSnapshot,
} from '../glb/applyScreenTexture'
import { normalizeBounds } from '../glb/normalize'
import { collectResources, disposeResources, type GlbResources } from '../glb/resources'
import { pickDefaultScreenMesh } from '../glb/screenHeuristic'

export interface GlbModelProps {
  url: string
  screenMesh: string | null
  texture: Texture | null
  brightness: number
  onMeshes: (names: string[], suggested: string | null) => void
  onBounds: (sizeMm: readonly [number, number, number]) => void
  onError: (message: string) => void
}

/**
 * The suspending half of an import: `useGLTF` throws a promise while loading,
 * so this component only ever renders once the model is ready. Its parent
 * (`GlbDevice`) supplies the `Suspense` boundary and the error boundary that
 * catches a rejected load.
 *
 * Draco compression is deliberately disabled (`useGLTF(url, false, true)`) —
 * drei's default Draco decoder is fetched from a Google CDN on first use,
 * which would break this app's fully-local promise the moment someone
 * imported a Draco-compressed file.
 */
export function GlbModel({
  url,
  screenMesh,
  texture,
  brightness,
  onMeshes,
  onBounds,
  onError,
}: GlbModelProps) {
  const gltf = useGLTF(url, false, true)
  // Cloned so mutating the screen mesh's material never touches drei's cached
  // parse result — a second import reusing this URL would otherwise reuse it.
  const scene = useMemo(() => gltf.scene.clone(true), [gltf])
  const normalization = useMemo(() => normalizeBounds(new Box3().setFromObject(scene)), [scene])
  const resources = useRef<GlbResources | null>(null)
  // What the screen mesh's material looked like before any screenshot was
  // applied, so removing one round-trips back to the model's own authoring
  // instead of leaving it bleached white.
  const original = useRef<ScreenMaterialSnapshot | null>(null)

  useEffect(() => {
    const names: string[] = []
    scene.traverse((child) => {
      if (child instanceof Mesh) names.push(child.name)
    })
    if (names.length === 0) onError('This model has no meshes to render.')
    else onMeshes(names, pickDefaultScreenMesh(names))
  }, [scene, onMeshes, onError])

  useEffect(() => {
    if (normalization) onBounds(normalization.sizeMm)
    else onError('This model has no visible size — every mesh is degenerate.')
  }, [normalization, onBounds, onError])

  // Snapshots ownership once, before the screen-material swap below can touch
  // anything, then frees it all when the model is replaced or unmounted.
  useEffect(() => {
    resources.current = collectResources(scene)
    return () => {
      if (resources.current) disposeResources(resources.current)
    }
  }, [scene])

  useEffect(() => {
    if (!screenMesh) return undefined
    const mesh = findMeshByName(scene, screenMesh)
    if (!mesh || Array.isArray(mesh.material)) return undefined
    const authored = mesh.material
    const clone = authored.clone()
    mesh.material = clone
    original.current = snapshotScreenMaterial(mesh)
    return () => {
      mesh.material = authored
      original.current = null
      clone.dispose()
    }
  }, [scene, screenMesh])

  useEffect(() => {
    if (!screenMesh) return
    const mesh = findMeshByName(scene, screenMesh)
    if (mesh) applyScreenTexture(mesh, texture, brightness, original.current)
  }, [scene, screenMesh, texture, brightness])

  if (!normalization) return null

  return (
    <group scale={normalization.scale} position={normalization.offset}>
      <primitive object={scene} />
    </group>
  )
}
