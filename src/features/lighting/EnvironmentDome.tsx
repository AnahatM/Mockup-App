import { useEffect, useMemo } from 'react'
import {
  BackSide,
  CanvasTexture,
  EquirectangularReflectionMapping,
  SRGBColorSpace,
} from 'three'
import type { RoomConfig } from './schema'

/**
 * A soft enclosing room for the environment map.
 *
 * This is the single biggest thing separating a product render from a flat one.
 * A rig of a few bright panels floating in void means every direction that is
 * not a panel reflects pure black — so a metal rail lights on one face only, a
 * dark back panel reads as vantablack, and a camera lens (smooth, dark glass)
 * reflects nothing at all and stops looking like glass.
 *
 * Real product studios solve this with a light tent: a large, dim, enveloping
 * surface so every direction carries *some* luminance. That is what this is —
 * an inverted sphere with a vertical gradient, brighter above and darker below,
 * which is also what makes bevels and chamfers legible without a rim light
 * behind them.
 *
 * Rendered inside `<Environment>`, so it contributes to reflections and image
 * based lighting but is never visible in the scene itself.
 */
export function EnvironmentDome({ room }: { room: RoomConfig }) {
  const texture = useMemo(() => buildGradient(room), [room])

  useEffect(() => () => texture?.dispose(), [texture])

  if (!room.enabled || !texture) return null

  return (
    <mesh scale={[-60, 60, 60]}>
      <sphereGeometry args={[1, 40, 24]} />
      <meshBasicMaterial
        map={texture}
        side={BackSide}
        toneMapped={false}
        // Intensity is folded into the gradient's own brightness rather than a
        // colour multiply, so the horizon stays neutral as it is turned up.
      />
    </mesh>
  )
}

/** Vertical gradient: ceiling, horizon, floor. */
function buildGradient(room: RoomConfig): CanvasTexture | null {
  const canvas = document.createElement('canvas')
  canvas.width = 8
  canvas.height = 256
  const ctx = canvas.getContext('2d')
  if (!ctx) return null

  const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height)
  gradient.addColorStop(0, room.top)
  gradient.addColorStop(0.5, room.horizon)
  gradient.addColorStop(1, room.bottom)
  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  // Scale the whole gradient by intensity in linear-ish terms.
  if (room.intensity !== 1) {
    ctx.globalCompositeOperation = room.intensity > 1 ? 'lighter' : 'multiply'
    const amount =
      room.intensity > 1
        ? Math.min((room.intensity - 1) / 2, 1)
        : Math.max(room.intensity, 0)
    ctx.globalAlpha = room.intensity > 1 ? amount : 1
    ctx.fillStyle = room.intensity > 1 ? '#ffffff' : shade(Math.max(room.intensity, 0))
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    ctx.globalCompositeOperation = 'source-over'
    ctx.globalAlpha = 1
  }

  const texture = new CanvasTexture(canvas)
  texture.mapping = EquirectangularReflectionMapping
  texture.colorSpace = SRGBColorSpace
  return texture
}

/** Grey whose channels equal `amount`, for a multiply-darken pass. */
function shade(amount: number): string {
  const level = Math.round(Math.min(Math.max(amount, 0), 1) * 255)
  const hex = level.toString(16).padStart(2, '0')
  return `#${hex}${hex}${hex}`
}
