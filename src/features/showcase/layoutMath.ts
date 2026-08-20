import { LAYOUT_DESIGNS, type SlotDesign } from './layoutDesigns'
import type { ShowcaseLayoutId } from './schema'

export interface Rect {
  x: number
  y: number
  width: number
  height: number
}

/** A device's final placement in canvas pixels, ready to draw. */
export interface SlotRect {
  cx: number
  cy: number
  width: number
  height: number
  rotationDeg: number
  z: number
}

export function deviceCountFor(layout: ShowcaseLayoutId): number {
  return LAYOUT_DESIGNS[layout].length
}

const DEG_TO_RAD = Math.PI / 180
/** Fraction of the content rect's shorter side kept clear on every edge. */
const FIT_MARGIN = 0.04

function rotatedCornerOffsets(
  halfWidth: number,
  halfHeight: number,
  rotationDeg: number,
): Array<[number, number]> {
  const rad = rotationDeg * DEG_TO_RAD
  const cos = Math.cos(rad)
  const sin = Math.sin(rad)
  const corners: Array<[number, number]> = [
    [-halfWidth, -halfHeight],
    [halfWidth, -halfHeight],
    [halfWidth, halfHeight],
    [-halfWidth, halfHeight],
  ]
  return corners.map(([x, y]) => [x * cos - y * sin, x * sin + y * cos])
}

interface Slot1 {
  offsetX: number
  offsetY: number
  width: number
  height: number
  /** The four rotated corners, as offsets from the content rect's centre. */
  corners: Array<[number, number]>
}

/** One slot's geometry before the global "keep everything in frame" shrink. */
function slotAt1(design: SlotDesign, rect: Rect, base: number, deviceAspect: number): Slot1 {
  const height = design.scale * base
  const width = height * deviceAspect
  const offsetX = (design.cx - 0.5) * rect.width
  const offsetY = (design.cy - 0.5) * rect.height
  const rotated = rotatedCornerOffsets(width / 2, height / 2, design.rotationDeg)
  const corners: Array<[number, number]> = rotated.map(([dx, dy]) => [offsetX + dx, offsetY + dy])
  return { offsetX, offsetY, width, height, corners }
}

/** Largest uniform scale (never above 1) that keeps every corner in bounds. */
function fitFactorFor(slot: Slot1, halfWidth: number, halfHeight: number): number {
  let factor = 1
  for (const [x, y] of slot.corners) {
    if (Math.abs(x) > 1e-6) factor = Math.min(factor, halfWidth / Math.abs(x))
    if (Math.abs(y) > 1e-6) factor = Math.min(factor, halfHeight / Math.abs(y))
  }
  return factor
}

/**
 * Places every device for `layout` inside `rect`, then uniformly shrinks the
 * whole arrangement — position and size together, never independently — just
 * enough that every rotated device corner stays within `rect`. A composition
 * can therefore never crop a device: worst case, a very wide or very narrow
 * canvas just renders the devices smaller. See `composeShowcase.ts` for how
 * `rect` and `deviceAspect` are chosen.
 */
export function layoutSlots(
  layout: ShowcaseLayoutId,
  rect: Rect,
  deviceAspect: number,
): SlotRect[] {
  const designs = LAYOUT_DESIGNS[layout]
  const base = Math.min(rect.width, rect.height)
  const centerX = rect.x + rect.width / 2
  const centerY = rect.y + rect.height / 2
  const halfWidth = (rect.width / 2) * (1 - FIT_MARGIN)
  const halfHeight = (rect.height / 2) * (1 - FIT_MARGIN)

  const slots1 = designs.map((design) => slotAt1(design, rect, base, deviceAspect))
  const fit = Math.min(1, ...slots1.map((slot) => fitFactorFor(slot, halfWidth, halfHeight)))

  return slots1.map((slot, index) => {
    const design = designs[index]
    return {
      cx: centerX + slot.offsetX * fit,
      cy: centerY + slot.offsetY * fit,
      width: slot.width * fit,
      height: slot.height * fit,
      rotationDeg: design ? design.rotationDeg : 0,
      z: design ? design.z : 0,
    }
  })
}
