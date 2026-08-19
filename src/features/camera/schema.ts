import { z } from 'zod'
import { vec3Schema } from '@/lib/schema/primitives'

/**
 * Camera configuration.
 *
 * Scene units: 1 unit = 100mm, so a 146mm phone is ~1.47 units tall. That keeps
 * device specs writable in real millimetres while leaving camera and light
 * distances in comfortable single digits.
 */
export const cameraSchema = z.object({
  preset: z.string().default('hero'),
  position: vec3Schema.default([1.9, 1.45, 4.1]),
  target: vec3Schema.default([0, 0.7, 0]),
  fov: z.number().min(8).max(90).default(30),
  autoRotate: z.boolean().default(false),
  autoRotateSpeed: z.number().min(-8).max(8).default(0.6),
  /** Orbit damping — higher is snappier. */
  damping: z.number().min(0.01).max(1).default(0.08),
  enablePan: z.boolean().default(true),
  minDistance: z.number().min(0.2).max(20).default(0.8),
  maxDistance: z.number().min(1).max(60).default(14),
})

export type CameraConfig = z.infer<typeof cameraSchema>

export const defaultCamera = (): CameraConfig => cameraSchema.parse({})
