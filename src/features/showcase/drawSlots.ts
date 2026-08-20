import type { SlotRect } from './layoutMath'

/**
 * Draws each captured device at its slot, back to front by `z`, so a "hero"
 * device paints over the flanking ones behind it. Each bitmap's aspect ratio
 * already matches its slot's (both were derived from the same
 * `deviceAspect`), so this is a plain scale-and-rotate — no letterboxing.
 */
export function drawSlots(
  ctx: CanvasRenderingContext2D,
  slots: readonly SlotRect[],
  bitmaps: readonly ImageBitmap[],
): void {
  const order = slots
    .map((slot, index) => ({ slot, bitmap: bitmaps[index] }))
    .sort((a, b) => a.slot.z - b.slot.z)

  for (const { slot, bitmap } of order) {
    if (!bitmap) continue
    ctx.save()
    ctx.translate(slot.cx, slot.cy)
    ctx.rotate((slot.rotationDeg * Math.PI) / 180)
    ctx.drawImage(bitmap, -slot.width / 2, -slot.height / 2, slot.width, slot.height)
    ctx.restore()
  }
}
