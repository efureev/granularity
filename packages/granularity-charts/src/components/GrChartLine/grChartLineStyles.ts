import type { GrChartSize } from '../GrChartFrame/chartFrameStyles'

export type { GrChartSize as GrChartLineSize }

/**
 * Толщина линии и обводка маркера — токенами через атрибуты SVG.
 *
 * Именно атрибутами: `<path>` красится `stroke`, а не `color`, поэтому
 * утилита вида `text-[var(--x)]` на нём не даёт ничего. Гейт
 * `svgPaint.test.ts` держит это правило.
 */
export const lineStrokeWidth = 'var(--gr-chart-line-width,2px)'

/** Обводка маркера цветом фона: без неё точка теряется на собственной линии. */
export const pointHaloStroke = 'var(--gr-chart-line-point-halo,var(--gr-bg))'

/**
 * Размер маркера — число, а не токен: он идёт в геометрию символа
 * (`symbolPath`), которая считается в JS и CSS-переменную прочитать не может.
 */
export const pointSizes: Record<GrChartSize, number> = {
  xs: 5,
  sm: 6,
  md: 7,
  lg: 8,
}

/** Активная точка крупнее соседних — это её единственный признак, кроме вертикали. */
export const ACTIVE_POINT_SCALE = 1.6

/**
 * Порог `showPoints: 'auto'`.
 *
 * Выше него маркеры сливаются в сплошную полосу и только мешают: линия
 * читается лучше без них.
 */
export const AUTO_POINTS_LIMIT = 60
