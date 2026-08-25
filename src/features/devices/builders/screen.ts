import { ShapeGeometry, type BufferGeometry } from 'three'
import { normalizeUv, squircleShape } from './shape'
import type { BodySpec, ScreenSpec } from '../spec/types'

export interface ScreenLayout {
  width: number
  height: number
  /** Vertical offset from the body centre, for devices with a larger chin. */
  offsetY: number
  cornerRadius: number
}

/** Where the screen sits inside the body, honouring an asymmetric chin and a
 *  taller camera bezel above. */
export function screenLayout(body: BodySpec, screen: ScreenSpec): ScreenLayout {
  const top = screen.insetTop ?? screen.inset
  const bottom = screen.insetBottom ?? screen.inset
  return {
    width: body.width - screen.inset * 2,
    height: body.height - top - bottom,
    offsetY: (bottom - top) / 2,
    cornerRadius: screen.cornerRadius,
  }
}

/** Flat squircle panel carrying the screenshot, with UVs spanning 0-1. */
export function buildScreen(layout: ScreenLayout): BufferGeometry {
  const shape = squircleShape({
    width: layout.width,
    height: layout.height,
    radius: layout.cornerRadius,
    exponent: 4.2,
    segments: 16,
  })

  return normalizeUv(new ShapeGeometry(shape, 1))
}
