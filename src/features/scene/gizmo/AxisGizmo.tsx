import { useLayoutEffect, useRef } from 'react'
import { GizmoHelper, GizmoViewport } from '@react-three/drei'
import type { Group } from 'three'
import { Vector3 } from 'three'
import { registerAxisGizmoGroup } from '@/features/capture'
import { useAppStore } from '@/state/store'

/** Unity's scene-view convention: X red, Y green, Z blue. A named constant
 *  rather than a literal on the JSX below, per the project's colour rule. */
const AXIS_COLORS: [string, string, string] = ['#e6493f', '#5cc24a', '#3d8ef8']

/** Space from the corner, in pixels — enough to clear the export toolbar
 *  chrome that can sit over the viewport edges. */
const MARGIN: [number, number] = [64, 64]

/** Label text drawn onto each axis head's own canvas sprite. */
const LABEL_COLOR = '#000000'

/**
 * Orientation gizmo, bottom-right of the viewport — the three axes rotating
 * to mirror the camera, so "which way is up" and "which way am I facing"
 * stay legible at a glance. The same job Unity's scene-view gizmo does.
 *
 * Built on drei's `GizmoHelper`/`GizmoViewport`: both draw with canvas
 * sprites and three.js primitives only — no textures, no network fetch,
 * which matters here since the app makes no runtime requests at all.
 * Clicking an axis head already tweens the main camera to look straight
 * down it, via `GizmoHelper`'s own `tweenCamera` — snap-to-axis for free.
 * `onTarget` gives that tween the product's actual look-at point instead of
 * always assuming the world origin, so it stays accurate in fly mode too,
 * where there is no orbit target to read.
 *
 * `renderPriority={2}` is deliberate: `PostFx`'s `EffectComposer` renders
 * the main scene at priority 1, and drei's `Hud` (which `GizmoHelper` sits
 * on) treats priority 1 as "nothing else is rendering the default scene, so
 * I will" — which would skip post-processing entirely for that extra pass.
 * A higher priority tells `Hud` the scene was already drawn, so it only
 * clears depth and draws the gizmo on top of it.
 *
 * Like the light gizmos, this is an editing aid: `axisGizmoGuard` publishes
 * the group so `capturePng`/`recordWebm` can force it invisible for the
 * duration of an export — see that module for why it lives in
 * `features/capture` rather than beside this component.
 */
export function AxisGizmo() {
  const target = useAppStore((state) => state.camera.target)
  const groupRef = useRef<Group>(null)

  useLayoutEffect(() => {
    registerAxisGizmoGroup(groupRef.current)
    return () => registerAxisGizmoGroup(null)
  }, [])

  return (
    <GizmoHelper
      alignment="bottom-right"
      margin={MARGIN}
      renderPriority={2}
      onTarget={() => new Vector3(...target)}
    >
      <group ref={groupRef}>
        <GizmoViewport axisColors={AXIS_COLORS} labelColor={LABEL_COLOR} />
      </group>
    </GizmoHelper>
  )
}
