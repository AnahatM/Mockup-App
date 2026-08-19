import { err, ok, type Result } from '@/lib/result'
import {
  MANIFEST_KIND,
  MANIFEST_VERSION,
  manifestSchema,
  type MockupManifest,
} from './manifest'

/**
 * Turns untrusted JSON into a valid manifest, or into a readable error.
 *
 * Imported files come from other people, other versions, and hand editing. None
 * of that may be able to crash the app, so nothing here throws: every failure
 * path produces a message a user can act on.
 *
 * Two kinds of change are handled differently:
 *
 * - **Additive** changes need no migration at all. Every field in every feature
 *   schema carries a default, so a manifest written before a field existed
 *   simply gains it on parse. This covers the large majority of real changes.
 * - **Breaking** changes — a renamed or restructured field — need an entry in
 *   `MIGRATIONS`, keyed by the version it upgrades *from*.
 */

type RawManifest = Record<string, unknown>
type Migration = (input: RawManifest) => RawManifest

/**
 * Keyed by the version being upgraded FROM. Empty while the format is at v1;
 * the machinery exists so the first breaking change is a one-line addition
 * rather than a redesign, and so it is already covered by tests.
 */
const MIGRATIONS: Readonly<Record<number, Migration>> = {}

export function parseManifest(raw: unknown): Result<MockupManifest> {
  if (typeof raw !== 'object' || raw === null || Array.isArray(raw)) {
    return err('That file does not look like a mockup preset.')
  }

  const input = raw as RawManifest

  if (input['kind'] !== MANIFEST_KIND) {
    return err('That file is not a Mockup Studio preset.')
  }

  const version = readVersion(input)
  if (version === null) {
    return err('This preset is missing a version number.')
  }
  if (version > MANIFEST_VERSION) {
    return err(
      `This preset was made with a newer version of Mockup Studio (format ${version}).`,
    )
  }

  const upgraded = applyMigrations(input, version)
  const parsed = manifestSchema.safeParse({ ...upgraded, version: MANIFEST_VERSION })

  if (!parsed.success) {
    return err(describe(parsed.error.issues))
  }
  return ok(parsed.data)
}

function readVersion(input: RawManifest): number | null {
  const value = input['version']
  return typeof value === 'number' && Number.isInteger(value) && value >= 1
    ? value
    : null
}

function applyMigrations(input: RawManifest, from: number): RawManifest {
  let current = input
  for (let version = from; version < MANIFEST_VERSION; version += 1) {
    const migration = MIGRATIONS[version]
    if (migration) current = migration(current)
  }
  return current
}

/** Turns Zod issues into one sentence naming the field, not a wall of JSON. */
function describe(issues: readonly { path: PropertyKey[]; message: string }[]): string {
  const first = issues[0]
  if (!first) return 'This preset could not be read.'

  const path = first.path.map(String).join('.')
  return path
    ? `This preset has an invalid value at "${path}": ${first.message.toLowerCase()}.`
    : `This preset could not be read: ${first.message.toLowerCase()}.`
}
