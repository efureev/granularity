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

/**
 * Строка каталога — плитка, а не строка текста.
 *
 * Человек выбирает, что поставить на дашборд, и решение это не текстовое:
 * рамка отделяет варианты друг от друга, а подсветка при наведении показывает,
 * с чем он сейчас имеет дело. Кликабельной плитку не делаем — интерактив в ней
 * ровно один, кнопка: вложенный в неё второй потерял бы виджет для скринридера.
 */
export const rowClass = [
  'flex items-start gap-3 min-w-0',
  'p-3',
  'rounded-[var(--gr-radius-md)]',
  'bg-[var(--gr-dashboard-palette-item-bg,transparent)]',
  'border border-solid border-[var(--gr-dashboard-palette-item-brd,var(--gr-brd))]',
  'transition-colors duration-[var(--gr-duration-fast)] ease-[var(--gr-ease-out)]',
  'hover:bg-[var(--gr-dashboard-palette-item-bg-hover,var(--gr-muted))]',
].join(' ')

/**
 * Уже добавленный виджет гасится фоном, а не прозрачностью: `opacity`
 * разбавляет выверенные на AA цвета текста и роняет контраст.
 */
export const rowDisabledClass = 'bg-[var(--gr-muted)] hover:bg-[var(--gr-muted)]'

export const textClass = 'flex-1 min-w-0'

export const headingClass = 'flex items-center gap-2 min-w-0'

export const titleClass = 'flex-1 min-w-0 truncate font-medium text-[var(--gr-fg)]'

export const descriptionClass = 'mt-0.5 block text-[var(--gr-muted-fg)]'

/** Размер в ячейках: выбирают не только «что», но и «сколько места это займёт». */
export const measureClass = [
  'shrink-0 whitespace-nowrap',
  'text-[length:var(--gr-control-text-2xs)] leading-[var(--gr-control-leading-2xs)]',
  'text-[var(--gr-muted-fg)]',
  '[font-variant-numeric:tabular-nums]',
].join(' ')

export const actionClass = 'shrink-0 self-center'

export const emptyClass = 'text-[var(--gr-muted-fg)]'

export const paletteSizes: Record<GrDashboardPaletteSize, string> = {
  xs: 'text-[length:var(--gr-text-xs)] leading-[var(--gr-leading-xs)]',
  sm: 'text-[length:var(--gr-text-sm)] leading-[var(--gr-leading-sm)]',
  md: 'text-[length:var(--gr-text-base)] leading-[var(--gr-leading-base)]',
  lg: 'text-[length:var(--gr-text-xl)] leading-[var(--gr-leading-xl)]',
}
