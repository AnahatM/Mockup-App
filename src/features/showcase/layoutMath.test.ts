import { describe, expect, it } from 'vitest'
import { SHOWCASE_LAYOUTS } from './schema'
import { deviceCountFor, layoutSlots, type Rect, type SlotRect } from './layoutMath'

const DEG_TO_RAD = Math.PI / 180

function corners(slot: SlotRect): Array<[number, number]> {
  const rad = slot.rotationDeg * DEG_TO_RAD
  const cos = Math.cos(rad)
  const sin = Math.sin(rad)
  const halfWidth = slot.width / 2
  const halfHeight = slot.height / 2
  const offsets: Array<[number, number]> = [
    [-halfWidth, -halfHeight],
    [halfWidth, -halfHeight],
    [halfWidth, halfHeight],
    [-halfWidth, halfHeight],
  ]
  return offsets.map(([x, y]) => [slot.cx + x * cos - y * sin, slot.cy + x * sin + y * cos])
}

function withinRect(point: [number, number], rect: Rect, epsilon = 1): boolean {
  const [x, y] = point
  return (
    x >= rect.x - epsilon &&
    x <= rect.x + rect.width + epsilon &&
    y >= rect.y - epsilon &&
    y <= rect.y + rect.height + epsilon
  )
}

const RECTS: Rect[] = [
  { x: 0, y: 0, width: 1290, height: 2796 }, // tall App Store phone
  { x: 0, y: 0, width: 2048, height: 2732 }, // near-square iPad
  { x: 0, y: 0, width: 1600, height: 500 }, // very wide banner
  { x: 40, y: 120, width: 900, height: 900 }, // offset content rect
]

describe('layoutSlots framing', () => {
  for (const layout of SHOWCASE_LAYOUTS) {
    for (const rect of RECTS) {
      it(`keeps every "${layout}" device inside a ${rect.width}x${rect.height} rect`, () => {
        const slots = layoutSlots(layout, rect, 1.4)
        for (const slot of slots) {
          for (const corner of corners(slot)) {
            expect(withinRect(corner, rect)).toBe(true)
          }
        }
      })
    }
  }

  it('produces the expected device count per layout', () => {
    expect(deviceCountFor('single')).toBe(1)
    expect(deviceCountFor('pair')).toBe(2)
    expect(deviceCountFor('hero-flank')).toBe(3)
    expect(deviceCountFor('stagger-row')).toBe(3)
    expect(deviceCountFor('fan-overlay')).toBe(3)
  })
})

describe('layoutSlots distinctness', () => {
  const rect: Rect = { x: 0, y: 0, width: 1200, height: 1200 }
  const arrangements = SHOWCASE_LAYOUTS.map((layout) => layoutSlots(layout, rect, 1))

  it('gives every layout a different arrangement', () => {
    const signatures = arrangements.map((slots) =>
      slots
        .map((slot) => `${slot.cx.toFixed(1)},${slot.cy.toFixed(1)},${slot.rotationDeg}`)
        .join('|'),
    )
    expect(new Set(signatures).size).toBe(signatures.length)
  })

  it('never places two slots exactly on top of each other', () => {
    for (const slots of arrangements) {
      const centers = slots.map((slot) => `${Math.round(slot.cx)},${Math.round(slot.cy)}`)
      expect(new Set(centers).size).toBe(centers.length)
    }
  })
})
