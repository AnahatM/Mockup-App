import { TEXT_ALIGNMENTS, TEXT_POSITIONS, TEXT_WEIGHTS } from '@/features/showcase'
import { choice, color, segmented, slider, text, toggle } from '@/ui/controls'
import type { Control } from '@/ui/controls'
import type { AppState } from '@/state/types'

const capitalize = (value: string): string => value.charAt(0).toUpperCase() + value.slice(1)

const POSITION_OPTIONS = TEXT_POSITIONS.map((value) => ({ value, label: capitalize(value) }))

const ALIGN_OPTIONS = TEXT_ALIGNMENTS.map((value) => ({ value, label: capitalize(value) }))

const WEIGHT_OPTIONS = TEXT_WEIGHTS.map((value) => ({
  value,
  label: value === 'bold' ? 'Bold' : 'Regular',
}))

export const modeControls: readonly Control<AppState>[] = [
  toggle({
    label: 'Showcase mode',
    hint: 'A multi-device App Store composition, exported from the button below.',
    select: (s) => s.showcase.enabled,
    update: (d, v) => {
      d.showcase.enabled = v
    },
  }),
  color({
    label: 'Background',
    visible: (s) => s.showcase.enabled,
    select: (s) => s.showcase.backgroundColor,
    update: (d, v) => {
      d.showcase.backgroundColor = v
    },
  }),
]

const whenEnabled = (s: AppState) => s.showcase.enabled

export const textControls: readonly Control<AppState>[] = [
  text({
    label: 'Headline',
    placeholder: 'Your app, reimagined',
    maxLength: 80,
    visible: whenEnabled,
    select: (s) => s.showcase.text.headline,
    update: (d, v) => {
      d.showcase.text.headline = v
    },
  }),
  text({
    label: 'Subheading',
    placeholder: 'Optional supporting line',
    maxLength: 120,
    visible: whenEnabled,
    select: (s) => s.showcase.text.subheading,
    update: (d, v) => {
      d.showcase.text.subheading = v
    },
  }),
  segmented({
    label: 'Position',
    options: POSITION_OPTIONS,
    visible: whenEnabled,
    select: (s) => s.showcase.text.position,
    update: (d, v) => {
      d.showcase.text.position = v
    },
  }),
  segmented({
    label: 'Align',
    options: ALIGN_OPTIONS,
    visible: whenEnabled,
    select: (s) => s.showcase.text.align,
    update: (d, v) => {
      d.showcase.text.align = v
    },
  }),
  slider({
    label: 'Size',
    min: 20,
    max: 140,
    step: 1,
    unit: 'px',
    visible: whenEnabled,
    select: (s) => s.showcase.text.size,
    update: (d, v) => {
      d.showcase.text.size = Math.round(v)
    },
  }),
  choice({
    label: 'Weight',
    options: WEIGHT_OPTIONS,
    visible: whenEnabled,
    select: (s) => s.showcase.text.weight,
    update: (d, v) => {
      d.showcase.text.weight = v
    },
  }),
  color({
    label: 'Colour',
    visible: whenEnabled,
    select: (s) => s.showcase.text.color,
    update: (d, v) => {
      d.showcase.text.color = v
    },
  }),
]
