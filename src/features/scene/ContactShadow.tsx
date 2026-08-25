import { useRef } from 'react'
import { ContactShadows } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import { Mesh, type Group } from 'three'
import { useAppStore } from '@/state/store'
import { shadowFade } from './shadowFade'

/**
 * Grounds the product. Uses a contact shadow rather than a real shadow map: it
 * is far cheaper, reads better for a small object on a plinth, and — importantly
 * for transparent PNG export — composites correctly over an empty background.
 *
 * Two things about drei's implementation drive the shape of this file, and both
 * are worth knowing before changing anything here.
 *
 * **It re-bakes on every render.** `ContactShadows` keeps its frame counter in
 * a plain `let` in the component body, so a re-render resets it and `frames={1}`
 * means "once per render" rather than "once, ever". This component subscribes to
 * whole store slices, so anything that could move the caster re-renders it and
 * therefore re-bakes it. That is why there is no `key` here any more: forcing a
 * remount to trigger a re-bake was redundant, and it was actively harmful —
 * every remount built two fresh 1024px render targets and left the old pair to
 * the garbage collector, so dragging the blur or scale slider (both of which fed
 * the old bake key) churned GPU memory on every pointer move. That churn is what
 * the flicker was.
 *
 * **It bakes the whole scene**, via `scene.overrideMaterial`, from an
 * orthographic camera at the floor looking up. So the bake is bounded by
 * `scale` (the plane's width) and `far` (its depth) — anything outside either
 * is simply absent from the shadow, which reads as a shadow that is not the
 * shape of the thing casting it. Both now scale with the device: `scale` via
 * `shadowScaleFor`, `far` via `shadowFarFor`, both applied when a device is
 * chosen. Backdrop structures stay out of the bake by sitting on their own
 * layer — see `layers.ts`.
 */
export function ContactShadow() {
  const group = useRef<Group>(null)
  const shadow = useAppStore((state) => state.scene.shadow)
  const pedestal = useAppStore((state) => state.scene.pedestal)
  // The whole device slice, not just the fields read below: a re-render is
  // what triggers a re-bake, so anything that can move or reshape the caster
  // — its spec, rotation, orientation, an imported GLB — has to reach this
  // component. Narrowing this selector would bring back the stale shadow.
  const device = useAppStore((state) => state.device)
  const animation = useAppStore((state) => state.animation)

  if (!shadow.enabled) return null

  // Rest the shadow on the pedestal top when there is one, otherwise on the
  // floor. 1mm was too fine a gap for the depth buffer to resolve — see the
  // polygon offset on the plinth's own material, which is the other half of
  // this fix. Both, because either alone leaves it marginal at some camera
  // distance, and the failure is a visible starburst rather than a subtle one.
  const y = pedestal.enabled && pedestal.shape !== 'none' ? 0.004 : 0

  // While a clip is playing the product moves every frame, so re-render-driven
  // baking is not enough — the store does not change between frames.
  const moving = animation.clip !== 'none' && animation.playing

  return (
    <>
      <ContactShadows
        ref={group}
          position={[0, y, 0]}
        opacity={shadow.opacity}
        blur={shadow.blur}
        // A levitating device is lifted clear of the floor, so the depth range
        // has to reach past the lift as well as over the device itself.
        far={shadow.far + device.levitate}
        scale={shadow.scale}
        resolution={1024}
        frames={moving ? Infinity : 1}
      />
      <GrazingFade group={group} opacity={shadow.opacity} planeY={y} />
    </>
  )
}

interface GrazingFadeProps {
  group: React.RefObject<Group | null>
  opacity: number
  planeY: number
}

/**
 * Fades the shadow out as the camera drops towards the floor — see
 * `shadowFade.ts` for why, and `Low hero` for the preset that made it
 * necessary.
 *
 * Its own component because `ContactShadow` returns early when the shadow is
 * switched off, and a `useFrame` above that return would be a conditional
 * hook. It writes the opacity straight onto the material rather than through
 * drei's `opacity` prop: that prop is a React render, and a render of this
 * subtree re-bakes the shadow's two 1024px render targets. Doing that on every
 * frame of an orbit is exactly the churn the flicker fix removed.
 */
function GrazingFade({ group, opacity, planeY }: GrazingFadeProps) {
  useFrame(({ camera }) => {
    const mesh = group.current?.children[0]
    if (!(mesh instanceof Mesh) || Array.isArray(mesh.material)) return

    const horizontal = Math.hypot(camera.position.x, camera.position.z)
    mesh.material.opacity = opacity * shadowFade(camera.position.y - planeY, horizontal)
  })
  return null
}
