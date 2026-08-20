import { describe, expect, it } from 'vitest'
// Type-only: importing any VALUE from the devices barrel here would eagerly
// load `Device.tsx` -> `@/state/store` -> the device slice -> the devices
// barrel again, mid-evaluation — a pre-existing circular-init hazard in the
// app's module graph that this test would otherwise be the first thing to
// trigger. A hand-built fixture avoids it entirely; `import type` is erased
// at compile time and carries no such risk.
import type { DeviceSpec } from '@/features/devices'
import { cropAspectOptions, deviceScreenAspect } from './deviceAspect'

/** A minimal, valid `DeviceSpec` — only `body`, `screen` and `screenAspect`
 * are exercised by this module, so everything else is a placeholder. */
function fixtureDevice(overrides: Partial<DeviceSpec>): DeviceSpec {
  return {
    id: 'fixture',
    name: 'Fixture',
    category: 'Test',
    kind: 'phone',
    icon: 'phone',
    mesh: { kind: 'procedural' },
    body: { width: 70.6, height: 146.6, depth: 8.25, cornerRadius: 11.8, edgeRadius: 1.5 },
    screen: { inset: 2.1, cornerRadius: 9.7 },
    cutout: { type: 'none' },
    buttons: [],
    materials: { frame: 'aluminium', back: 'matte-glass' },
    colorways: [],
    supportedOverlays: [],
    ...overrides,
  }
}

describe('deviceScreenAspect', () => {
  it('inverts the authored long/short ratio for a portrait phone', () => {
    // Authored as 19.5/9 (long/short); the real screen is taller than wide,
    // so width/height must land below 1 and roughly match 9/19.5.
    const phone = fixtureDevice({ screenAspect: 19.5 / 9 })
    const aspect = deviceScreenAspect(phone)
    expect(aspect).toBeLessThan(1)
    expect(aspect).toBeCloseTo(9 / 19.5, 6)
  })

  it('uses the authored ratio directly for a landscape monitor', () => {
    const monitor = fixtureDevice({
      body: { width: 614, height: 366, depth: 17, cornerRadius: 6, edgeRadius: 1.2 },
      screen: { inset: 9, insetBottom: 16, cornerRadius: 3 },
      screenAspect: 16 / 9,
    })
    const aspect = deviceScreenAspect(monitor)
    expect(aspect).toBeGreaterThan(1)
    expect(aspect).toBeCloseTo(16 / 9, 6)
  })

  it('falls back to computing from body and bezel when unauthored', () => {
    const phone = fixtureDevice({})
    const computed = deviceScreenAspect(phone)
    const expectedWidth = phone.body.width - phone.screen.inset * 2
    const expectedHeight = phone.body.height - phone.screen.inset * 2
    expect(computed).toBeCloseTo(expectedWidth / expectedHeight, 6)
  })

  it('never returns a non-finite ratio for a degenerate spec', () => {
    const degenerate = fixtureDevice({
      body: { width: 10, height: 10, depth: 1, cornerRadius: 0, edgeRadius: 0 },
      screen: { inset: 5, cornerRadius: 0 },
    })
    expect(Number.isFinite(deviceScreenAspect(degenerate))).toBe(true)
  })
})

describe('cropAspectOptions', () => {
  it('includes free-form, the live device ratio, and the common presets', () => {
    const phone = fixtureDevice({ screenAspect: 19.5 / 9 })
    const options = cropAspectOptions(phone)
    const ids = options.map((option) => option.id)
    expect(ids).toEqual(['free', 'device', '16:9', '4:3', '1:1', '9:16'])
    expect(options.find((o) => o.id === 'free')?.ratio).toBeNull()
    expect(options.find((o) => o.id === 'device')?.ratio).toBeCloseTo(
      deviceScreenAspect(phone),
      9,
    )
    expect(options.find((o) => o.id === '1:1')?.ratio).toBe(1)
  })
})
