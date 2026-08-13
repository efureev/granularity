export type { GrChartSize as GrChartBarSize } from '../GrChartFrame/chartFrameStyles'

/**
 * Оформление столбцов — токенами через атрибуты SVG.
 *
 * Именно атрибутами: `<path>` красится `fill`/`stroke`, а не `color`, поэтому
 * утилита вида `text-[var(--x)]` на нём не даёт ничего. Гейт `svgPaint.test.ts`
 * держит это правило.
 */

/**
 * Подсветка активной категории.
 *
 * У столбцов вертикаль под точкой не работает: она проходит сквозь полосу и
 * читается как её граница. Подсвечивается вся категория целиком — то же, что
 * человек и так считает наведённым.
 */
export const barHoverFill = 'var(--gr-chart-bar-hover,var(--gr-muted))'

/** Волосяной разделитель между сегментами стека: без него полосы сливаются в одну. */
export const barGapStroke = 'var(--gr-chart-bar-gap-color,var(--gr-bg))'
export const barGapWidth = 'var(--gr-chart-bar-gap,1px)'

/**
 * Скругление дальнего от базовой линии конца полосы.
 *
 * Числом, а не токеном: радиус идёт в геометрию пути, которая считается в JS и
 * CSS-переменную прочитать не может. Поэтому он вынесен в проп `barRadius` —
 * это единственная точка настройки, доступная и потребителю, и теме через
 * `GrConfigProvider`.
 */
export const DEFAULT_BAR_RADIUS = 4
