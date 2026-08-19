import type { IconName } from '@/ui'
import { DEVICES } from '@/features/devices'

export interface Highlight {
  icon: IconName
  title: string
  body: string
}

export const HIGHLIGHTS: readonly Highlight[] = [
  {
    icon: 'phone',
    title: 'Procedural devices',
    body: 'Phones, folding phones, tablets, laptops, monitors and watches — each a parametric data file, so every dimension and colour is yours to change.',
  },
  {
    icon: 'image',
    title: 'Screenshots or video',
    body: 'Drop in a PNG or an MP4. A screen recording plays on the device and records into your export.',
  },
  {
    icon: 'light',
    title: 'Parametric studio lighting',
    body: 'Rim lights, glows and a soft room you can shape — or load your own HDRI for natural light.',
  },
  {
    icon: 'droplet',
    title: 'Match your brand',
    body: 'The dominant colours of your screenshot become one-click sources for the backdrop, the lights and the device itself.',
  },
  {
    icon: 'window',
    title: '2D window mockups',
    body: 'macOS and browser chrome with traffic lights and a custom title bar — flat, or displayed on a laptop in the 3D scene.',
  },
  {
    icon: 'film',
    title: 'Stills and video',
    body: 'PNG at any resolution with real transparency, plus WebM recording of any motion preset.',
  },
] as const

export interface Stat {
  icon: IconName
  value: string
  label: string
}

export const STATS: readonly Stat[] = [
  { icon: 'phone', value: `${DEVICES.length}`, label: 'devices' },
  { icon: 'sliders', value: '12', label: 'presets' },
  { icon: 'orbit', value: '9', label: 'camera angles' },
  { icon: 'film', value: '9', label: 'motion clips' },
] as const

export interface ShowcaseItem {
  icon: IconName
  caption: string
}

export const SHOWCASE_ITEMS: readonly ShowcaseItem[] = [
  { icon: 'phone', caption: 'A phone mockup, lit and posed on a pedestal' },
  { icon: 'droplet', caption: 'A backdrop matched to your screenshot’s brand colour' },
  { icon: 'film', caption: 'A motion preset, recorded straight to WebM' },
] as const
