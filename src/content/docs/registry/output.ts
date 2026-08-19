import exportingImages from '../articles/exporting-images.md?raw'
import recordingVideo from '../articles/recording-video.md?raw'
import presets from '../articles/presets.md?raw'
import type { DocArticle } from '../types'

export const OUTPUT_ARTICLES: readonly DocArticle[] = [
  {
    slug: 'exporting-images',
    section: 'output',
    title: 'Exporting images',
    summary: 'Sizes, scale, and genuinely transparent PNGs.',
    keywords: ['export', 'png', 'resolution', 'transparent', 'alpha', 'app store', 'save'],
    related: ['recording-video', 'presets'],
    order: 1,
    body: exportingImages,
  },
  {
    slug: 'recording-video',
    section: 'output',
    title: 'Recording video',
    summary: 'Motion clips, and capturing them to a WebM file.',
    keywords: ['video', 'animation', 'record', 'webm', 'loop', 'motion', 'gif'],
    related: ['camera', 'exporting-images'],
    order: 2,
    body: recordingVideo,
  },
  {
    slug: 'presets',
    section: 'output',
    title: 'Presets and sharing',
    summary: 'Premade looks, saving your own, and sharing a scene as a file.',
    keywords: ['preset', 'save', 'load', 'share', 'import', 'export', 'json'],
    related: ['manifest-format'],
    order: 3,
    body: presets,
  },
]
