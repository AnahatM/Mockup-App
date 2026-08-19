/**
 * Probes for a WebGL context without keeping one around.
 *
 * Kept separate from the fallback component so that file exports only a
 * component and stays inside react-refresh's fast-refresh boundary.
 */
export function hasWebGL(): boolean {
  try {
    const canvas = document.createElement('canvas')
    return Boolean(
      canvas.getContext('webgl2') ??
      canvas.getContext('webgl') ??
      canvas.getContext('experimental-webgl'),
    )
  } catch {
    return false
  }
}
