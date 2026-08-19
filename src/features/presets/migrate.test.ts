import { describe, expect, it } from 'vitest'
import { MANIFEST_KIND, MANIFEST_VERSION, defaultSceneState } from './manifest'
import { parseManifest } from './migrate'

const valid = () => ({
  kind: MANIFEST_KIND,
  version: MANIFEST_VERSION,
  id: 'preset-1',
  name: 'Hero shot',
  createdAt: '2026-08-19T00:00:00.000Z',
  scene: defaultSceneState(),
  media: { kind: 'none' as const },
})

describe('parseManifest — valid input', () => {
  it('accepts a complete manifest', () => {
    const result = parseManifest(valid())
    expect(result.ok).toBe(true)
    if (result.ok) expect(result.value.name).toBe('Hero shot')
  })

  it('fills in a scene section that predates a feature', () => {
    // The single most common real-world case: a preset saved before a feature
    // existed. Every schema field carries a default, so it must still load.
    const old = { ...valid(), scene: {} }
    const result = parseManifest(old)
    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(result.value.scene.lighting.lights.length).toBeGreaterThanOrEqual(0)
      expect(result.value.scene.camera.fov).toBeGreaterThan(0)
      expect(result.value.scene.flat.style).toBe('none')
    }
  })

  it('fills in individual fields added after the preset was written', () => {
    const partial = {
      ...valid(),
      scene: { ...defaultSceneState(), camera: { fov: 42 } },
    }
    const result = parseManifest(partial)
    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(result.value.scene.camera.fov).toBe(42)
      // Not present in the input, so it comes from the schema default.
      expect(result.value.scene.camera.damping).toBeGreaterThan(0)
    }
  })

  it('defaults media to none when the key is absent', () => {
    const { media: _media, ...withoutMedia } = valid()
    const result = parseManifest(withoutMedia)
    expect(result.ok).toBe(true)
    if (result.ok) expect(result.value.media.kind).toBe('none')
  })

  it('accepts an embedded media payload', () => {
    const result = parseManifest({
      ...valid(),
      media: {
        kind: 'embedded',
        name: 'shot.png',
        dataUrl: 'data:image/png;base64,AAAA',
        width: 100,
        height: 200,
      },
    })
    expect(result.ok).toBe(true)
  })
})

describe('parseManifest — hostile and malformed input', () => {
  const rejected = (input: unknown) => {
    const result = parseManifest(input)
    expect(result.ok).toBe(false)
    return result.ok ? '' : result.error
  }

  it('rejects non-objects without throwing', () => {
    for (const input of [null, undefined, 42, 'hello', true, [], [1, 2]]) {
      expect(rejected(input)).toBeTruthy()
    }
  })

  it('rejects a file that is valid JSON but not a preset', () => {
    expect(rejected({ hello: 'world' })).toContain('not a Mockup Studio preset')
  })

  it('rejects a manifest with no version', () => {
    const { version: _version, ...noVersion } = valid()
    expect(rejected(noVersion)).toContain('version')
  })

  it('rejects a non-integer or nonsensical version', () => {
    expect(rejected({ ...valid(), version: 1.5 })).toBeTruthy()
    expect(rejected({ ...valid(), version: 0 })).toBeTruthy()
    expect(rejected({ ...valid(), version: '1' })).toBeTruthy()
  })

  it('explains rather than fails silently when the format is from the future', () => {
    const error = rejected({ ...valid(), version: MANIFEST_VERSION + 5 })
    expect(error).toContain('newer version')
  })

  it('names the offending field when a value is out of range', () => {
    const error = rejected({
      ...valid(),
      scene: { ...defaultSceneState(), camera: { fov: 9999 } },
    })
    expect(error).toContain('camera.fov')
  })

  it('rejects a wrong-typed value rather than coercing it', () => {
    const error = rejected({
      ...valid(),
      scene: { ...defaultSceneState(), device: { bodyColor: 'not-a-colour' } },
    })
    expect(error).toContain('device.bodyColor')
  })

  it('rejects a hand-edited colour that is not hex', () => {
    expect(
      rejected({
        ...valid(),
        scene: { ...defaultSceneState(), scene: { backdrop: { color: 'red' } } },
      }),
    ).toBeTruthy()
  })

  it('rejects an unknown media kind', () => {
    expect(
      rejected({ ...valid(), media: { kind: 'remote', url: 'http://x' } }),
    ).toBeTruthy()
  })

  it('never returns a thrown error for any of a range of junk inputs', () => {
    const junk = [
      { kind: MANIFEST_KIND, version: 1 },
      { kind: MANIFEST_KIND, version: 1, id: '', name: '', createdAt: '' },
      { kind: MANIFEST_KIND, version: 1, scene: 'not-an-object' },
      { kind: MANIFEST_KIND, version: 1, scene: { camera: null } },
      { kind: MANIFEST_KIND, version: 1, scene: { lighting: { lights: 'nope' } } },
    ]
    for (const input of junk) {
      expect(() => parseManifest(input)).not.toThrow()
      expect(parseManifest(input).ok).toBe(false)
    }
  })

  it('rejects a light array beyond the supported maximum', () => {
    const lights = Array.from({ length: 40 }, (_, i) => ({
      id: `light-${i}`,
      name: 'L',
      enabled: true,
      form: 'rect',
      position: [0, 0, 0],
      rotation: [0, 0, 0],
      scale: [1, 1, 1],
      color: '#ffffff',
      intensity: 1,
      visibleInBackground: false,
    }))
    expect(
      rejected({
        ...valid(),
        scene: { ...defaultSceneState(), lighting: { lights } },
      }),
    ).toBeTruthy()
  })
})

describe('round trip', () => {
  it('survives JSON stringify and parse unchanged', () => {
    const original = parseManifest(valid())
    expect(original.ok).toBe(true)
    if (!original.ok) return

    const round = parseManifest(JSON.parse(JSON.stringify(original.value)))
    expect(round.ok).toBe(true)
    if (round.ok) expect(round.value).toEqual(original.value)
  })
})
