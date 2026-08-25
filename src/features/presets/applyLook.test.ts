import { beforeEach, describe, expect, it } from 'vitest'
import { useAppStore } from '@/state/store'
import { BUILTIN_PRESETS } from './builtin'

/**
 * Picking a MacBook, then clicking a backdrop preset to see how it looks,
 * silently turned the MacBook into a phone — along with the camera framing, the
 * plinth radius and the shadow extent that had been sized for it.
 *
 * Every built-in is built from `defaultSceneState()`, which carries the default
 * device, and applying one assigned the whole scene wholesale. A saved preset
 * restoring everything is right; a *look* doing it is not.
 */
describe('applying a built-in look', () => {
  beforeEach(() => {
    useAppStore.getState().selectDevice('macbook-pro')
  })

  const looks = BUILTIN_PRESETS.filter((preset) => preset.group !== 'Window')

  it.each(looks.map((preset) => ({ name: preset.name, id: preset.id })))(
    '$name keeps the device you are on',
    ({ id }) => {
      useAppStore.getState().applyBuiltinPreset(id)
      expect(useAppStore.getState().device.specId).toBe('macbook-pro')
    },
  )

  it('lets a preset that names a device have it', () => {
    // The window looks put macOS chrome on the screen, which needs a
    // desktop-class body to be on. They are the exception the rule allows for.
    const window = BUILTIN_PRESETS.find((preset) => preset.group === 'Window')
    expect(window).toBeDefined()

    useAppStore.getState().selectDevice('iphone-pro')
    if (window) useAppStore.getState().applyBuiltinPreset(window.id)
    expect(useAppStore.getState().device.specId).not.toBe('iphone-pro')
  })

  it('re-derives the camera and the floor for the device it kept', () => {
    /*
     * The preset's own camera, plinth and shadow were all computed against
     * whatever device it was authored on, and carried over unchanged they frame
     * a 614mm monitor as though it were a 70mm phone.
     *
     * Compared against what `selectDevice` produces for the same monitor,
     * because that is the definition of correct here, and because comparing
     * against a phone's numbers instead let this pass with the re-derivation
     * deleted — the preset's stored defaults happened to be larger than a
     * phone's, which proved nothing at all.
     */
    useAppStore.getState().selectDevice('monitor-27')
    const fresh = useAppStore.getState()
    const expected = {
      shadow: fresh.scene.shadow.scale,
      plinth: fresh.scene.pedestal.radius,
    }

    useAppStore.getState().applyBuiltinPreset('hex-field')
    const after = useAppStore.getState()

    expect(after.scene.shadow.scale).toBe(expected.shadow)
    expect(after.scene.pedestal.radius).toBe(expected.plinth)
    // ...and the camera is far enough out to actually fit a 614mm display.
    expect(Math.hypot(...after.camera.position)).toBeGreaterThan(10)
  })
})
