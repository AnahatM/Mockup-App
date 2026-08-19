import { Suspense } from 'react'
import { CameraRig } from '@/features/camera'
import { Device } from '@/features/devices'
import { LightRig } from '@/features/lighting'
import { Backdrop } from './backdrop/Backdrop'
import { ContactShadow } from './ContactShadow'
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
      <LightRig />
      <Backdrop />
      <Pedestal />
      <Device />
      <ContactShadow />
      <CameraRig />
      <PostFx />
    </Suspense>
  )
}
