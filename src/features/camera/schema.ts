import { z } from 'zod'
import { vec3Schema } from '@/lib/schema/primitives'

/**
 * Camera configuration.
 *
 * Scene units: 1 unit = 100mm, so a 146mm phone is ~1.47 units tall. That keeps
 * device specs writable in real millimetres while leaving camera and light
 * distances in comfortable single digits.
 */
/**
 * How the viewport navigates.
 *
 * `orbit` always circles a target, which is right for inspecting a product but
 * cannot get *behind* the camera's own pivot. `fly` releases it: WASD moves,
 * dragging looks, and the camera goes wherever you point it.
 */
export const CAMERA_MODES = ['orbit', 'fly'] as const
export type CameraMode = (typeof CAMERA_MODES)[number]

export const cameraSchema = z.object({
  mode: z.enum(CAMERA_MODES).default('orbit'),
  /** Metres per second in fly mode. */
  flySpeed: z.number().min(0.1).max(20).default(2.4),
  /** Look sensitivity in fly mode. */
  flyLook: z.number().min(0.05).max(4).default(0.9),
  preset: z.string().default('hero'),
  position: vec3Schema.default([1.9, 1.45, 4.1]),
  target: vec3Schema.default([0, 0.7, 0]),
  fov: z.number().min(8).max(90).default(30),
  autoRotate: z.boolean().default(false),
  autoRotateSpeed: z.number().min(-8).max(8).default(0.6),
  /** Orbit damping — higher is snappier. */
  damping: z.number().min(0.01).max(1).default(0.08),
  /* Viewport navigation, in the vein of a 3D editor:
     drag to orbit, right-drag or middle-drag to pan, wheel to zoom. */
  enablePan: z.boolean().default(true),
  enableZoom: z.boolean().default(true),
  enableRotate: z.boolean().default(true),
  rotateSpeed: z.number().min(0.1).max(3).default(1),
  panSpeed: z.number().min(0.1).max(3).default(1),
  zoomSpeed: z.number().min(0.1).max(3).default(1),
  /** Pan across the view plane (editor-style) instead of along the ground. */
  screenSpacePanning: z.boolean().default(true),
  /** Allow orbiting beneath the floor. Off keeps the product the right way up. */
  orbitBelowFloor: z.boolean().default(false),
  minDistance: z.number().min(0.05).max(20).default(0.3),
  maxDistance: z.number().min(1).max(200).default(60),
})

export type CameraConfig = z.infer<typeof cameraSchema>

export const defaultCamera = (): CameraConfig => cameraSchema.parse({})
