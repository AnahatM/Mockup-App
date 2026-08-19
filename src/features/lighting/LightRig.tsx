import { useMemo } from 'react'
import { Environment, Lightformer } from '@react-three/drei'
import { useAppStore } from '@/state/store'
import { EnvironmentDome } from './EnvironmentDome'
import type { LightConfig } from './schema'

/**
 * The studio environment, built from parametric area lights rather than an HDRI.
 *
 * `frames={1}` bakes the cubemap once for performance, so the Environment must be
 * remounted when the rig changes — hence the config hash used as its key.
 *
 * Resolution matters more than it looks. A polished surface reflects a small
 * bright panel across only a few texels, so at a low cubemap resolution the
 * highlight crawls from texel to texel as the camera moves and reads as a
 * sparkle. 512 is the default for that reason rather than for sharpness.
 */
export function LightRig() {
  const lighting = useAppStore((state) => state.lighting)
  const active = lighting.lights.filter((light) => light.enabled)
  const bakeKey = useMemo(
    () => `${hashRig(active)}#${JSON.stringify(lighting.room)}`,
    [active, lighting.room],
  )

  return (
    <>
      <ambientLight intensity={lighting.ambient} />
      <Environment
        key={bakeKey}
        frames={1}
        resolution={lighting.resolution}
        environmentIntensity={lighting.environmentIntensity}
      >
        {/* The room first: it sets the base luminance every other reflection
            sits on top of. */}
        <EnvironmentDome room={lighting.room} />
        {active.map((light) => (
          <StudioLight key={light.id} light={light} />
        ))}
      </Environment>
    </>
  )
}

function StudioLight({ light }: { light: LightConfig }) {
  // A light with no explicit rotation should face the product; one the user has
  // rotated should keep that rotation, so `target` is turned off in that case.
  const aimed = light.rotation.every((angle) => angle === 0)

  return (
    <Lightformer
      form={light.form}
      position={light.position}
      rotation={light.rotation}
      scale={light.scale}
      color={light.color}
      intensity={light.intensity}
      target={aimed}
    />
  )
}

function hashRig(lights: readonly LightConfig[]): string {
  return lights
    .map((l) =>
      [
        l.id,
        l.form,
        l.color,
        l.intensity,
        ...l.position,
        ...l.rotation,
        ...l.scale,
      ].join(','),
    )
    .join('|')
}
