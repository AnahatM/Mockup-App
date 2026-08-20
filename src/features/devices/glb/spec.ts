import type { DeviceSpec } from '../spec/types'

/** Sentinel `specId` while an imported model is the active device. Never in
 *  the catalogue, so `resolveDevice` is deliberately bypassed for this case —
 *  see `Device.tsx`. */
export const IMPORTED_DEVICE_ID = '__imported-glb__'

/** Used only before the model has finished loading and its real bounds are
 *  known — replaced the moment `setGlbBounds` fires. */
const FALLBACK_SIZE_MM: readonly [number, number, number] = [150, 220, 12]

export interface ImportedGlbSource {
  url: string
  name: string
  screenMesh: string | null
  sizeMm: readonly [number, number, number] | null
}

/**
 * A `DeviceSpec` for an imported model, so it can flow through the same
 * camera-framing, pedestal-sizing and ground-placement maths every procedural
 * device already uses (see spec/framing.ts) instead of duplicating it.
 *
 * Parts a procedural device would have — cutout, buttons, camera bump — are
 * left empty: the model brings its own geometry for those, and the detail
 * toggles in the panel are hidden for an import for the same reason (see
 * DevicePanel.tsx).
 */
export function buildImportedDeviceSpec(glb: ImportedGlbSource): DeviceSpec {
  const [width, height, depth] = glb.sizeMm ?? FALLBACK_SIZE_MM

  return {
    id: IMPORTED_DEVICE_ID,
    name: glb.name,
    category: 'Imported',
    kind: 'phone',
    icon: 'upload',
    mesh: { kind: 'glb', url: glb.url, screenMesh: glb.screenMesh ?? '' },
    body: { width, height, depth, cornerRadius: 0, edgeRadius: 0 },
    screen: { inset: 0, cornerRadius: 0 },
    cutout: { type: 'none' },
    buttons: [],
    materials: { frame: 'aluminium', back: 'aluminium' },
    colorways: [],
    supportedOverlays: [],
  }
}
