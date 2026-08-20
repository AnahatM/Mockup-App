import { Suspense } from 'react'
import { CameraRig } from '@/features/camera'
import { AnimatedProduct } from '@/features/animation'
import { CaptureBridge } from '@/features/capture'
import { Device } from '@/features/devices'
import { LightGizmos, LightRig } from '@/features/lighting'
import { Backdrop } from './backdrop/Backdrop'
import { ContactShadow } from './ContactShadow'
import { AxisGizmo } from './gizmo/AxisGizmo'
import { Pedestal } from './Pedestal'
import { PostFx } from './PostFx'
import { RendererSettings } from './RendererSettings'

/**
 * Everything inside the canvas, in one place. Composition only — each piece
 * reads its own slice of the store, so adding a scene element never means
 * threading props through here.
 */
export function Stage() {
  return (
    <Suspense fallback={null}>
      <RendererSettings />
      <CaptureBridge />
      <LightRig />
      <LightGizmos />
      <Backdrop />
      <Pedestal />
      <AnimatedProduct>
        <Device />
      </AnimatedProduct>
      <ContactShadow />
      <CameraRig />
      <AxisGizmo />
      <PostFx />
    </Suspense>
  )
}
