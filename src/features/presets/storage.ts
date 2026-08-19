import { err, ok, type Result } from '@/lib/result'
import { parseManifest } from './migrate'
import type { MockupManifest } from './manifest'

const KEY = 'mockup-studio:presets'

/**
 * Saved presets, in localStorage.
 *
 * Media is deliberately stripped before saving. Embedding a screenshot as a data
 * URL would fill the ~5MB quota after a handful of presets, and a saved preset
 * is a *look* to apply to whatever you have open — file export is where the
 * self-contained, media-embedded version lives.
 *
 * Every entry is re-validated on read, because localStorage survives across app
 * versions and can be edited by hand.
 */

export function loadPresets(): MockupManifest[] {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return []

    const parsed: unknown = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []

    return parsed
      .map((entry) => parseManifest(entry))
      .filter((result) => result.ok)
      .map((result) => result.value)
  } catch {
    // Corrupt storage should mean "no presets", never a blank app.
    return []
  }
}

export function savePresets(presets: readonly MockupManifest[]): Result<null> {
  try {
    const lightweight = presets.map((preset) => ({
      ...preset,
      media: stripMedia(preset),
    }))
    localStorage.setItem(KEY, JSON.stringify(lightweight))
    return ok(null)
  } catch {
    return err(
      'There is no room left to save presets. Try deleting one, or export to a file instead.',
    )
  }
}

/** Keeps the media's name for display, but drops the bytes. */
function stripMedia(preset: MockupManifest): MockupManifest['media'] {
  if (preset.media.kind === 'none') return { kind: 'none' }
  return { kind: 'external', name: preset.media.name }
}
