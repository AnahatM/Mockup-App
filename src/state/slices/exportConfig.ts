import { defaultExport, type ExportConfig } from '@/features/capture/schema'
import type { SliceCreator } from '../types'

export interface ExportSlice {
  /** Named `exportConfig` because `export` is a reserved word. */
  exportConfig: ExportConfig
  resetExport: () => void
}

export const createExportSlice: SliceCreator<ExportSlice> = (set) => ({
  exportConfig: defaultExport(),
  resetExport: () =>
    set((draft) => {
      draft.exportConfig = defaultExport()
    }),
})
