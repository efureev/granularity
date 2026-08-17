export type { GrChartSize as GrChartFunnelSize } from '../GrChartFrame/chartFrameStyles'

/**
 * Оформление воронки — токенами через атрибуты SVG.
 *
 * Именно атрибутами: `<path>` красится `fill`/`stroke`, а не `color`. Гейт
 * `svgPaint.test.ts` держит это правило.
 */

/** Подпись поверх ступени: она ложится на заливку, а не рядом с ней. */
export const funnelLabelFill = 'var(--gr-chart-funnel-label,var(--gr-bg))'

/** Приглушение неактивных ступеней, пока одна выделена. */
export const funnelDimOpacity = 'var(--gr-chart-funnel-dim,0.45)'

/** Зазор между ступенями. Числом: он идёт в геометрию, а не в CSS. */
export const DEFAULT_FUNNEL_GAP = 4

/** Кегль подписи в ступени: от её толщины, иначе на узкой воронке он вылезет. */
export const STAGE_LABEL_RATIO = 0.3
export const STAGE_LABEL_MIN = 9
export const STAGE_LABEL_MAX = 15
