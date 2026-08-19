import { EmptyState, type IconName } from '@/ui'

export interface PlaceholderPanelProps {
  icon: IconName
  title: string
  description: string
}

/**
 * Stands in for a panel whose feature has not landed yet. It names the phase that
 * will fill it rather than showing an unexplained blank region.
 */
export function PlaceholderPanel({ icon, title, description }: PlaceholderPanelProps) {
  return <EmptyState icon={icon} title={title} description={description} />
}
