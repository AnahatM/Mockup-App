import type { Draft } from 'immer'
import type { ControlBinding } from '@/ui/controls'
import { useAppStore } from './store'
import type { AppState } from './types'

/**
 * Adapts the app store to the framework-agnostic control binding that `ui/`
 * expects. This module is the only seam between the design system and the store,
 * which is what keeps `ui/` free of domain knowledge.
 */
function useValue<V>(select: (state: AppState) => V): V {
  return useAppStore(select)
}

function update(recipe: (draft: Draft<AppState>) => void): void {
  useAppStore.setState(recipe)
}

export const appControlBinding: ControlBinding<AppState> = { useValue, update }
