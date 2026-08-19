import lighting from '../articles/lighting.md?raw'
import materials from '../articles/materials.md?raw'
import camera from '../articles/camera.md?raw'
import backdrops from '../articles/backdrops.md?raw'
import type { DocArticle } from '../types'

export const STUDIO_ARTICLES: readonly DocArticle[] = [
  {
    slug: 'lighting',
    section: 'studio',
    title: 'Lighting and the room',
    summary: 'Rigs, individual lights, the enclosing room, and loading an HDRI.',
    keywords: ['light', 'hdri', 'environment', 'rim', 'glow', 'reflection', 'shadow'],
    related: ['materials', 'backdrops'],
    order: 1,
    body: lighting,
  },
  {
    slug: 'materials',
    section: 'studio',
    title: 'Materials and finishes',
    summary: 'Brushed metal, glass, plastic — and glossy versus matte screens.',
    keywords: ['metal', 'glass', 'plastic', 'brushed', 'matte', 'glossy', 'texture', 'finish'],
    related: ['devices', 'lighting'],
    order: 2,
    body: materials,
  },
  {
    slug: 'camera',
    section: 'studio',
    title: 'Camera',
    summary: 'Angle presets, field of view, and orbit versus fly navigation.',
    keywords: ['angle', 'fov', 'orbit', 'fly', 'perspective', 'framing', 'zoom'],
    related: ['shortcuts', 'recording-video'],
    order: 3,
    body: camera,
  },
  {
    slug: 'backdrops',
    section: 'studio',
    title: 'Backdrops and the plinth',
    summary: 'Six backdrop modes, the plinth, and the contact shadow.',
    keywords: ['background', 'cyclorama', 'gradient', 'grid', 'transparent', 'pedestal'],
    related: ['lighting', 'exporting-images'],
    order: 4,
    body: backdrops,
  },
]
