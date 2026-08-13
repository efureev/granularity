export type { GrChartSize as GrChartAreaSize } from '../GrChartFrame/chartFrameStyles'

/**
 * Оформление площади — токенами через атрибуты SVG.
 *
 * Именно атрибутами: `<path>` красится `fill`/`stroke`, а не `color`, поэтому
 * утилита вида `text-[var(--x)]` на нём не даёт ничего. Гейт `svgPaint.test.ts`
 * держит это правило.
 */

export const areaStrokeWidth = 'var(--gr-chart-area-line-width,2px)'

/** Обводка марки цветом фона: без неё точка теряется на собственной заливке. */
export const areaPointHalo = 'var(--gr-chart-area-point-halo,var(--gr-bg))'

/**
 * Две непрозрачности, а не одна, потому что задачи у заливки разные.
 *
 * Наложенные площади обязаны просвечивать: там, где ряды пересекаются, читатель
 * должен видеть оба. Полосы стека не пересекаются вовсе — им нужна плотность,
 * иначе стек выглядит выцветшим и его полосы не отличить от фона сетки.
 */
export const areaFillOpacity = 'var(--gr-chart-area-fill-opacity,0.28)'
export const areaStackOpacity = 'var(--gr-chart-area-stack-opacity,0.85)'

/**
 * Низ градиента.
 *
 * Заливка гаснет к базовой линии, а не обрывается ровным краем: сплошная
 * плашка спорит с сеткой и утяжеляет низ графика, где смотреть не на что.
 */
export const areaFillFade = 'var(--gr-chart-area-fill-fade,0.02)'
