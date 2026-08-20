import { useMemo } from 'react'
import type { BuiltinPreset } from './builtin'

export interface PresetThumbnailProps {
  preset: BuiltinPreset
  size?: number
}

/**
 * A small preview of what a preset looks like.
 *
 * A preset is a *look* — a backdrop colour, a glow, a device finish — and none
 * of that is conveyable in a name. Rendering a real 3D preview per preset would
 * mean twelve extra scenes, so this draws the same handful of colours the
 * preset actually sets, arranged the way the scene arranges them.
 *
 * Built from the preset's own `build()` output rather than a hand-written
 * swatch table, so a thumbnail cannot describe a preset that has since changed.
 */
export function PresetThumbnail({ preset, size = 34 }: PresetThumbnailProps) {
  const scene = useMemo(() => preset.build(), [preset])
  const { backdrop, pedestal } = scene.scene
  const glowId = `glow-${preset.id}`

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 34 34"
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <radialGradient id={glowId} cx="50%" cy="30%" r="70%">
          <stop offset="0%" stopColor={backdrop.accent} />
          <stop offset="100%" stopColor={backdrop.color} />
        </radialGradient>
      </defs>

      <rect width="34" height="34" rx="6" fill={`url(#${glowId})`} />

      {pedestal.enabled && (
        <ellipse cx="17" cy="27" rx="11" ry="3.4" fill={pedestal.color} opacity="0.9" />
      )}

      <rect
        x="12.5"
        y="8"
        width="9"
        height="17"
        rx="2.2"
        fill={scene.device.bodyColor}
        stroke={scene.device.frameColor}
        strokeWidth="0.7"
      />
    </svg>
  )
}
