// Только тип: `import type` стирается на сборке и ребра графа компонентов не создаёт.
import type { GrComponentSize } from '@feugene/granularity/components/GrConfigProvider'

export type GrDashboardItemSize = GrComponentSize

/**
 * Заголовок виджета — контент, а не подпись контрола, поэтому кегль берётся с
 * контентной шкалы и всегда парой с межстрочным: `text-*` в uno задаёт оба, и
 * переведённый в одиночку кегль отдал бы интервал на откуп `body` приложения.
 */
export const headerSizes: Record<GrDashboardItemSize, string> = {
  xs: 'px-2 py-1 text-[length:var(--gr-text-xs)] leading-[var(--gr-leading-xs)]',
  sm: 'px-3 py-1.5 text-[length:var(--gr-text-sm)] leading-[var(--gr-leading-sm)]',
  md: 'px-4 py-2 text-[length:var(--gr-text-base)] leading-[var(--gr-leading-base)]',
  lg: 'px-5 py-3 text-[length:var(--gr-text-xl)] leading-[var(--gr-leading-xl)]',
}

export const bodySizes: Record<GrDashboardItemSize, string> = {
  xs: 'p-2',
  sm: 'p-3',
  md: 'p-4',
  lg: 'p-5',
}

export const rootClass = [
  'relative min-w-0 min-h-0',
  'overflow-hidden',
  'rounded-[var(--gr-dashboard-item-radius,var(--gr-radius-lg))]',
].join(' ')

/** Виджет, который сейчас несут: он один поднят над сеткой. */
export const draggingClass = [
  'z-2',
  'shadow-[var(--gr-dashboard-item-dragging-shadow,var(--gr-shadow-3))]',
].join(' ')

export const headerClass = 'flex items-center gap-2 min-w-0'

export const titleClass = 'flex-1 min-w-0 truncate font-medium text-[var(--gr-fg)]'

export const bodyClass = 'h-full min-h-0 overflow-auto'

export const actionsClass = 'flex items-center gap-1 shrink-0'
