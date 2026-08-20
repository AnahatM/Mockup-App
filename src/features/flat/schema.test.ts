import { describe, expect, it } from 'vitest'
import { defaultFlat, flatSchema } from './schema'

describe('flatSchema', () => {
  it('round-trips a fully-specified config through JSON unchanged', () => {
    const config = {
      ...defaultFlat(),
      containerStyle: 'glass-dark' as const,
      borderShape: 'round' as const,
      shadowStyle: 'adaptive' as const,
      hideMockup: true,
    }
    const roundTripped = flatSchema.parse(JSON.parse(JSON.stringify(config)))
    expect(roundTripped).toEqual(config)
  })

  it('fills in the new container/shape/shadow fields for an older saved preset', () => {
    // Simulates a manifest written before this feature existed: it has the
    // original fields but not containerStyle, borderShape, shadowStyle or
    // hideMockup. Additive schema changes must not break it.
    const legacy = {
      style: 'macos',
      title: 'My app',
      titleAlign: 'left',
      url: 'example.com',
      barHeight: 0.05,
      cornerRadius: 0.02,
      trafficLights: true,
      trafficLightsMuted: false,
      tabs: 3,
      dark: true,
      colorMatch: false,
      chrome: '#abcdef',
      margin: 0.08,
      shadow: 0.5,
      background: '#ffffff',
      transparentBackground: false,
    }

    const parsed = flatSchema.parse(legacy)

    expect(parsed.containerStyle).toBe('default')
    expect(parsed.borderShape).toBe('curved')
    expect(parsed.shadowStyle).toBe('spread')
    expect(parsed.hideMockup).toBe(false)
    // Every pre-existing field survives untouched.
    expect(parsed.title).toBe('My app')
    expect(parsed.chrome).toBe('#abcdef')
    expect(parsed.shadow).toBe(0.5)
  })

  it('defaults shadowStyle to "spread", matching the pre-existing shadow geometry', () => {
    expect(defaultFlat().shadowStyle).toBe('spread')
  })

  it('rejects an unknown container style rather than silently accepting it', () => {
    const result = flatSchema.safeParse({ ...defaultFlat(), containerStyle: 'liquid' })
    expect(result.success).toBe(false)
  })
})
