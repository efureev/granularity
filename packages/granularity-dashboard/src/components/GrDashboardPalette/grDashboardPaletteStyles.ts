// Только тип: `import type` стирается на сборке и ребра графа компонентов не создаёт.
import type { GrComponentSize } from '@feugene/granularity/components/GrConfigProvider'

export type GrDashboardPaletteSize = GrComponentSize

/** Один виджет каталога: что добавится в сетку и с каким размером. */
export interface GrDashboardPaletteItem {
  id: string
  title: string
  description?: string
  /** Размер, с которым виджет встаёт в сетку. */
  defaultSize?: { w: number, h: number }
  minW?: number
  minH?: number
  maxW?: number
  maxH?: number
  disabled?: boolean
}

export const listClass = 'flex flex-col gap-2 m-0 p-0 list-none'

export const rowClass = 'flex items-center gap-3 min-w-0'

export const textClass = 'flex-1 min-w-0'

export const titleClass = 'block truncate font-medium text-[var(--gr-fg)]'

export const descriptionClass = 'block truncate text-[var(--gr-muted-fg)]'

export const emptyClass = 'text-[var(--gr-muted-fg)]'

export const paletteSizes: Record<GrDashboardPaletteSize, string> = {
  xs: 'text-[length:var(--gr-text-xs)] leading-[var(--gr-leading-xs)]',
  sm: 'text-[length:var(--gr-text-sm)] leading-[var(--gr-leading-sm)]',
  md: 'text-[length:var(--gr-text-base)] leading-[var(--gr-leading-base)]',
  lg: 'text-[length:var(--gr-text-xl)] leading-[var(--gr-leading-xl)]',
}
