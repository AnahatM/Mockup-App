import { z } from 'zod'
import { animationSchema } from '@/features/animation/schema'
import { cameraSchema } from '@/features/camera/schema'
import { exportSchema } from '@/features/capture/schema'
import { deviceConfigSchema } from '@/features/devices/schema'
import { flatSchema } from '@/features/flat/schema'
import { lightingSchema } from '@/features/lighting/schema'
import { screenSchema } from '@/features/media/schema'
import { sceneSchema } from '@/features/scene/schema'
import { overlaysSchema } from '@/features/screen/schema'

/**
 * The shareable mockup file.
 *
 * Composed from the feature schemas rather than redeclaring the shape, which is
 * the whole point of Zod being the single source of truth: the file format and
 * the running store cannot drift apart, because they are the same definitions.
 *
 * These import `<feature>/schema` directly rather than the feature barrels. A
 * barrel also exports components, which import the store, which composes slices
 * from the features again — importing barrels here closes that loop and leaves
 * half the schemas undefined at module-init time. Schema modules are pure Zod
 * with no React and no store, so depending on them directly is safe by
 * construction. ESLint permits this one path shape.
 *
 * See docs/preset-manifest.md.
 */

export const MANIFEST_KIND = 'mockup-studio'
export const MANIFEST_VERSION = 1

/**
 * Media is separable from the scene.
 *
 * `none` keeps a preset tiny and shareable — it is a *look*, applied to whatever
 * screenshot you have. `embedded` makes it a complete, self-contained
 * reproduction at the cost of size, which is why saved presets never embed:
 * localStorage would fill after a handful of them.
 */
export const manifestMediaSchema = z.discriminatedUnion('kind', [
  z.object({ kind: z.literal('none') }),
  z.object({
    kind: z.literal('embedded'),
    name: z.string().max(200).default('screenshot'),
    dataUrl: z.string().max(40_000_000),
    width: z.number().int().positive(),
    height: z.number().int().positive(),
  }),
  z.object({
    kind: z.literal('external'),
    name: z.string().max(200),
  }),
])

export type ManifestMedia = z.infer<typeof manifestMediaSchema>

/** Everything that makes up a scene. Each field is a feature's own schema. */
export const sceneStateSchema = z.object({
  device: deviceConfigSchema.prefault({}),
  screen: screenSchema.prefault({}),
  overlays: overlaysSchema.prefault({}),
  flat: flatSchema.prefault({}),
  camera: cameraSchema.prefault({}),
  lighting: lightingSchema.prefault({}),
  scene: sceneSchema.prefault({}),
  animation: animationSchema.prefault({}),
  exportConfig: exportSchema.prefault({}),
})

export type SceneState = z.infer<typeof sceneStateSchema>

export const manifestSchema = z.object({
  kind: z.literal(MANIFEST_KIND),
  version: z.number().int().min(1),
  id: z.string().min(1).max(64),
  name: z.string().min(1).max(120),
  /** ISO 8601. Stamped by the caller, so the schema stays pure. */
  createdAt: z.string().max(40),
  scene: sceneStateSchema,
  media: manifestMediaSchema.prefault({ kind: 'none' }),
})

export type MockupManifest = z.infer<typeof manifestSchema>

export const defaultSceneState = (): SceneState => sceneStateSchema.parse({})
