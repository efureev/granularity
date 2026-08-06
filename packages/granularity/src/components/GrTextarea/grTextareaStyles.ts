import type { GrComponentSize, GrControlState } from '../shared/sizes'

export type GrTextareaState = GrControlState
export type GrTextareaSize = GrComponentSize

export const borderClassByState: Record<GrTextareaState, string> = {
  default: 'border-[var(--gr-brd)]',
  success: 'border-[var(--gr-success)] focus-visible:ring-[var(--gr-success)]',
  warning: 'border-[var(--gr-warning)] focus-visible:ring-[var(--gr-warning)]',
  danger: 'border-[var(--gr-danger)] focus-visible:ring-[var(--gr-danger)]',
}

/**
 * Кегль совпадает с `GrInput` на каждой ступени: поле ввода и текстовая область
 * в одной форме обязаны читаться одинаково. Вертикальный паддинг меньше, чем у
 * `GrInput`: там он центрирует одну строку в фиксированной высоте, здесь высоту
 * задаёт `rows`.
 */
export const sizes: Record<GrTextareaSize, string> = {
  xs: 'px-2.5 py-1 text-[12px]',
  sm: 'px-3 py-1.5 text-[13px]',
  md: 'px-3 py-2 text-[14px]',
  lg: 'px-4 py-2.5 text-[16px]',
}

export type GrTextareaResize = 'none' | 'vertical' | 'both'

export const resizeClass: Record<GrTextareaResize, string> = {
  none: 'resize-none',
  vertical: 'resize-y',
  both: 'resize',
}

export const enabledSurfaceClass = 'bg-[var(--gr-bg)]'

/**
 * Заблокированное поле гасится фоном, а не `opacity`: прозрачность разбавляет
 * выверенные на AA токены текста. Классы взаимоисключающие — два `bg-*` одной
 * специфичности разрулил бы порядок в сгенерированном CSS.
 */
export const disabledSurfaceClass = 'bg-[var(--gr-muted)] text-[var(--gr-muted-fg)] cursor-not-allowed'

export const countClass = 'mt-1 text-right text-xs text-[var(--gr-muted-fg)] [font-variant-numeric:tabular-nums]'

export function grTextareaClass(options: { state: GrTextareaState, invalid: boolean }): string {
  return options.invalid ? borderClassByState.danger : borderClassByState[options.state]
}
