import importingModels from '../articles/importing-models.md?raw'
import addingADevice from '../articles/adding-a-device.md?raw'
import manifestFormat from '../articles/manifest-format.md?raw'
import type { DocArticle } from '../types'

export const ADVANCED_ARTICLES: readonly DocArticle[] = [
  {
    slug: 'importing-models',
    section: 'advanced',
    title: 'Importing 3D models',
    summary: 'Bringing in your own .glb, and where to find models.',
    keywords: ['glb', 'gltf', 'model', 'import', '3d', 'sketchfab', 'blender'],
    related: ['devices', 'adding-a-device'],
    order: 1,
    body: importingModels,
  },
  {
    slug: 'adding-a-device',
    section: 'advanced',
    title: 'Adding a device',
    summary: 'Contributing a new device to the catalogue — usually one data file.',
    keywords: ['contribute', 'spec', 'catalogue', 'new device', 'open source'],
    related: ['importing-models', 'manifest-format'],
    order: 2,
    body: addingADevice,
  },
  {
    slug: 'manifest-format',
    section: 'advanced',
    title: 'Preset file format',
    summary: 'The JSON a preset serialises to, for generating or editing one by hand.',
    keywords: ['json', 'manifest', 'schema', 'format', 'version', 'migration'],
    related: ['presets'],
    order: 3,
    body: manifestFormat,
  },
]
