import { Euler, Vector3 } from 'three'
import type { LightConfig } from '../schema'

/**
 * Pure maths for the light gizmos — kept free of React/three scene state so it
 * can be unit tested without a renderer.
 */

const ORIGIN = new Vector3(0, 0, 0)
const LOCAL_FORWARD = new Vector3(0, 0, -1)

/** A light with no explicit rotation is aimed at the origin — see LightRig. */
export function isAimedAtOrigin(rotation: LightConfig['rotation']): boolean {
  return rotation.every((angle) => angle === 0)
}

/**
 * World-space unit vector the light points along.
 *
 * Aimed lights (rotation left at zero) point from their position toward the
 * origin, matching `Lightformer`'s own `target` behaviour. A rotated light
 * points along its local -Z axis — the same axis `Object3D.lookAt` aligns to
 * a target — so the arrow matches what a rotation control would produce.
 */
export function lightDirection(
  light: Pick<LightConfig, 'position' | 'rotation'>,
): [number, number, number] {
  if (isAimedAtOrigin(light.rotation)) {
    const toOrigin = ORIGIN.clone().sub(new Vector3(...light.position))
    if (toOrigin.lengthSq() < 1e-8) return [0, 0, -1]
    return toOrigin.normalize().toArray() as [number, number, number]
  }
  const rotated = LOCAL_FORWARD.clone().applyEuler(new Euler(...light.rotation))
  return rotated.normalize().toArray() as [number, number, number]
}

/**
 * World-space uniform scale that keeps a gizmo a constant apparent size in
 * pixels, regardless of camera distance.
 *
 * Without this a marker sized for a close-up shrinks to a single pixel once
 * the camera pulls back to frame a whole device — the exact failure mode a
 * gizmo exists to avoid. `distance` and `verticalFovDegrees` describe a
 * perspective camera; `viewportHeightPx` is the canvas height in CSS pixels.
 */
export function gizmoScaleForDistance(
  distance: number,
  verticalFovDegrees: number,
  viewportHeightPx: number,
  targetPixels: number,
): number {
  if (viewportHeightPx <= 0) return 1
  const fovRad = (verticalFovDegrees * Math.PI) / 180
  const worldHeightAtDistance = 2 * distance * Math.tan(fovRad / 2)
  const worldPerPixel = worldHeightAtDistance / viewportHeightPx
  return worldPerPixel * targetPixels
}
