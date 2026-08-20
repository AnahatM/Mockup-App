import { readFileSync, readdirSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { DEVICES } from './spec/registry'

/**
 * Holds the device catalogue against the files and the claims made about it.
 *
 * Two different drifts are possible. A spec file that is never imported into
 * the registry is dead code the app cannot show. And a count written by hand
 * into prose goes stale the moment a device is added — which had already
 * happened: the README claimed 14 devices while the app shipped 15, and the
 * landing page said 15 because it derives the number instead of stating it.
 */
const catalogFiles = readdirSync('src/features/devices/catalog')
  .filter((name) => name.endsWith('.ts') && name !== 'index.ts')
  .map((name) => name.replace(/\.ts$/, ''))

const registrySource = readFileSync('src/features/devices/spec/registry.ts', 'utf8')

describe('the device catalogue', () => {
  it('imports every catalogue file into the registry', () => {
    const orphans = catalogFiles.filter((name) => !registrySource.includes(name))
    expect(orphans, 'spec files the registry never imports').toEqual([])
  })

  it('registers one device per catalogue file', () => {
    expect(DEVICES).toHaveLength(catalogFiles.length)
  })

  it('uses a unique id and name per device', () => {
    expect(new Set(DEVICES.map((d) => d.id)).size).toBe(DEVICES.length)
    expect(new Set(DEVICES.map((d) => d.name)).size).toBe(DEVICES.length)
  })

  it('gives every device at least one colourway', () => {
    for (const device of DEVICES) {
      expect(device.colorways.length, `colourways for ${device.id}`).toBeGreaterThan(0)
    }
  })

  it('keeps the README device count honest', () => {
    const readme = readFileSync('README.md', 'utf8')
    const claim = /\*\*(\d+) procedural devices\.\*\*/.exec(readme)

    expect(claim, 'README no longer states a device count in the expected form').not.toBeNull()
    expect(Number(claim?.[1]), 'README device count disagrees with the catalogue').toBe(
      DEVICES.length,
    )
  })
})
