import { z } from 'zod'
import { hexSchema, vec3Schema } from '@/lib/schema/primitives'
import { surfaceTextureSchema } from '@/features/textures/schema'

/**
 * A user-imported GLB/GLTF, the escape hatch described in
 * docs/adr/0001-procedural-geometry.md.
 *
 * `url` is a session-scoped object URL — like `lighting.hdri`, it is not
 * meaningful across a reload, only the name is. `sizeMm` and `meshNames` are
 * discovered once the model has actually loaded, so they start out empty/null.
 */
export const glbSourceSchema = z.object({
  url: z.string(),
  name: z.string().max(200),
  /** Which mesh receives the screenshot. Null until chosen or auto-detected. */
  screenMesh: z.string().nullable().default(null),
  /** Every mesh name found in the model, for the screen-mesh picker. */
  meshNames: z.array(z.string()).default([]),
  /** The model's own bounding size, converted into the mm convention every
   *  other DeviceSpec uses, so camera framing and ground placement work the
   *  same way regardless of what units the model was authored in. */
  sizeMm: vec3Schema.nullable().default(null),
})

export type GlbSource = z.infer<typeof glbSourceSchema>

/**
 * User-editable device state — the part that ends up in a saved preset, and so
 * the part that is validated by Zod. The specs themselves are authored in-repo
 * and checked by the compiler instead.
 */
export const deviceConfigSchema = z.object({
  specId: z.string().default('iphone-pro'),
  /** Set when the active device is an imported model rather than the catalogue. */
  glb: glbSourceSchema.nullable().default(null),
  colorway: z.string().default('black-titanium'),
  bodyColor: hexSchema.default('#3a3a3d'),
  frameColor: hexSchema.default('#4a4a4f'),
  /**
   * Finish overrides. Null means "use whatever the device spec declares", so a
   * device keeps its real construction until the user deliberately changes it.
   */
  frameFinish: z.string().nullable().default(null),
  backFinish: z.string().nullable().default(null),
  screenFinish: z.enum(['glossy', 'matte']).default('glossy'),
  /**
   * Procedural surface texture, layered over the back/body finish and the
   * frame finish independently. Defaults to `kind: 'none'`, so a preset
   * saved before this existed renders exactly as it did before.
   */
  bodyTexture: surfaceTextureSchema.prefault({}),
  frameTexture: surfaceTextureSchema.prefault({}),

  /** Per-device detail toggles. */
  showCutout: z.boolean().default(true),
  showCameraBump: z.boolean().default(true),
  showButtons: z.boolean().default(true),
  showRails: z.boolean().default(true),
  screenBrightness: z.number().min(0).max(4).default(1.1),
  /** Device orientation in radians. */
  rotation: vec3Schema.default([0, -0.38, 0]),
  landscape: z.boolean().default(false),
  /** Lifts the device off the pedestal, for floating hero shots. */
  levitate: z.number().min(0).max(3).default(0),
})

export type DeviceConfig = z.infer<typeof deviceConfigSchema>
