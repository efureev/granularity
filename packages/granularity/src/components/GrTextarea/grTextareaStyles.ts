import type { GrComponentSize, GrControlState } from '../shared/sizes'

export type GrTextareaState = GrControlState
export type GrTextareaSize = GrComponentSize

/**
 * Кегль совпадает с `GrInput` на каждой ступени: поле ввода и текстовая область
 * в одной форме обязаны читаться одинаково. Вертикальный паддинг меньше, чем у
 * `GrInput`: там он центрирует одну строку в фиксированной высоте, здесь высоту
 * задаёт `rows`.
 */
export const sizes: Record<GrTextareaSize, string> = {
  xs: 'px-2.5 py-1 text-[length:var(--gr-control-text-xs)] leading-[var(--gr-control-leading-xs)]',
  sm: 'px-3 py-1.5 text-[length:var(--gr-control-text-sm)] leading-[var(--gr-control-leading-sm)]',
  md: 'px-3 py-2 text-[length:var(--gr-control-text-md)] leading-[var(--gr-control-leading-md)]',
  lg: 'px-4 py-2.5 text-[length:var(--gr-control-text-lg)] leading-[var(--gr-control-leading-lg)]',
}

export type GrTextareaResize = 'none' | 'vertical' | 'both'

export const resizeClass: Record<GrTextareaResize, string> = {
  none: 'resize-none',
  vertical: 'resize-y',
  both: 'resize',
}

/**
 * Ряд счётчиков под полем: слева строки, справа символы. Обе подписи — один
 * визуальный уровень, поэтому кегль и цвет у них общие (`countClass`).
 */
export const countRowClass = 'mt-1 flex items-baseline justify-between gap-3'

/** Счётчик строк. Слева, потому что читается раньше: сначала «сколько строк», потом лимит символов. */
export const lineCountClass = 'text-[length:var(--gr-control-text-xs)] leading-[var(--gr-leading-xs)] text-[var(--gr-muted-fg)] tabular-nums'

export const countClass = 'mt-1 text-right text-[length:var(--gr-control-text-xs)] leading-[var(--gr-leading-xs)] text-[var(--gr-muted-fg)] tabular-nums'
