import type { GrComponentSize } from '../shared/sizes'
import type { GrTone } from '../shared/tones'

export type GrProgressCircleTone = GrTone
export type GrProgressCircleSize = GrComponentSize

/**
 * Диаметр кольца по ступеням. Значение уезжает в `var(--gr-progress-circle-size, …)`,
 * то есть остаётся точкой кастомизации: геометрия дуги считается в единицах
 * `viewBox` и от диаметра не зависит.
 */
export const diameterBySize: Record<GrProgressCircleSize, string> = {
  xs: '2rem',
  sm: '3rem',
  md: '4rem',
  lg: '6rem',
}

/**
 * Толщина обводки в единицах `viewBox`, то есть в процентах диаметра. Мелкое
 * кольцо с той же долей выглядело бы ниткой, поэтому доля растёт вниз по шкале.
 */
export const thicknessBySize: Record<GrProgressCircleSize, number> = {
  xs: 12,
  sm: 11,
  md: 10,
  lg: 9,
}

/** Кегль значения в центре. Тоже с фолбэком: подпись может не влезть под свой формат. */
export const valueTextSizeBySize: Record<GrProgressCircleSize, string> = {
  xs: 'var(--gr-text-2xs)',
  sm: 'var(--gr-text-xs)',
  md: 'var(--gr-text-sm)',
  lg: 'var(--gr-text-lg)',
}

export const statusIconSizeBySize: Record<GrProgressCircleSize, string> = {
  xs: 'h-3 w-3',
  sm: 'h-4 w-4',
  md: 'h-5 w-5',
  lg: 'h-7 w-7',
}

/**
 * Тона берутся из темы **линейного** индикатора: слой темизации у прогресса
 * один, и потребитель, перекрасивший `--gr-progress-bg`, ждёт, что круг и
 * полоса сойдутся. Фолбэк на роль обязателен — при гранулярном импорте одного
 * круга `GrProgressBar/themes/*.css` не подключается.
 */
export const arcColorByTone: Record<GrProgressCircleTone, string> = {
  primary: 'var(--gr-progress-bg,var(--gr-primary))',
  neutral: 'var(--gr-progress-neutral-bg,var(--gr-secondary))',
  success: 'var(--gr-progress-success-bg,var(--gr-success))',
  warning: 'var(--gr-progress-warning-bg,var(--gr-warning))',
  danger: 'var(--gr-progress-danger-bg,var(--gr-danger))',
  info: 'var(--gr-progress-info-bg,var(--gr-info))',
  slate: 'var(--gr-progress-slate-bg,var(--gr-slate))',
  azure: 'var(--gr-progress-azure-bg,var(--gr-azure))',
}

export const rootClass = 'relative inline-flex shrink-0 items-center justify-center'

export const svgClass = 'block h-full w-full'

/**
 * Центр — сосед виджета, а не его потомок, поэтому позиционируется абсолютно и
 * сам по себе кликов не ловит: интерактив в слоте включает их себе обратно.
 */
export const centerClass = 'pointer-events-none absolute inset-0 flex flex-col items-center justify-center gap-0.5 text-center'

export const valueClass = 'font-600 text-[var(--gr-fg)] [font-variant-numeric:tabular-nums]'

export function grProgressCircleArcColor(tone: GrProgressCircleTone): string {
  return arcColorByTone[tone]
}
