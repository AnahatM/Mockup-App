import { useEffect, useMemo } from 'react'
import { CanvasTexture, SRGBColorSpace } from 'three'
import type { DeviceKind, OverlayKind } from '@/features/devices'
import { useAppStore } from '@/state/store'
import { composeOverlays } from './overlays/compose'

/** Vertical resolution of the overlay layer. Ample for text at export scale. */
const RESOLUTION = 2048

/**
 * Renders the enabled overlays into a texture for the screen.
 *
 * Redrawn only when the overlay config, the device's supported set, or the
 * screen aspect changes — never per frame — so overlays cost nothing while a
 * video plays behind them.
 */
export function useOverlayTexture(
  supported: readonly OverlayKind[],
  aspect: number,
  kind: DeviceKind,
): CanvasTexture | null {
  const overlays = useAppStore((state) => state.overlays)

  const texture = useMemo(() => {
    const height = RESOLUTION
    const width = Math.max(2, Math.round(height * aspect))

    const canvas = document.createElement('canvas')
    canvas.width = width
    canvas.height = height
    const ctx = canvas.getContext('2d')
    if (!ctx) return null

    const drew = composeOverlays({ ctx, width, height }, supported, overlays, kind)
    if (!drew) return null

    const created = new CanvasTexture(canvas)
    created.colorSpace = SRGBColorSpace
    created.anisotropy = 8
    return created
  }, [supported, aspect, overlays, kind])

  useEffect(() => () => texture?.dispose(), [texture])

  return texture
}
