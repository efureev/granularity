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
