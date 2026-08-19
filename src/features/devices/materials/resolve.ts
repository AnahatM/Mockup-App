import { FINISHES, type Finish } from './finishes'
import type { DeviceConfig } from '../schema'
import type { DeviceSpec, FinishKind } from '../spec/types'

/**
 * Resolves which finish a surface actually uses.
 *
 * The spec declares how the real device is built; the config may override it.
 * An unknown override — from a hand-edited preset, or one saved before a finish
 * was renamed — falls back to the spec rather than rendering nothing.
 */
export function resolveFinish(
  override: string | null,
  fallback: FinishKind,
): FinishKind {
  if (override && override in FINISHES) return override as FinishKind
  return fallback
}

export function frameFinishOf(spec: DeviceSpec, config: DeviceConfig): FinishKind {
  return resolveFinish(config.frameFinish, spec.materials.frame)
}

export function backFinishOf(spec: DeviceSpec, config: DeviceConfig): FinishKind {
  return resolveFinish(config.backFinish, spec.materials.back)
}

export function finishParams(kind: FinishKind): Finish {
  return FINISHES[kind]
}
