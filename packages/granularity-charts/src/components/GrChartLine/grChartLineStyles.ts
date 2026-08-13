import type { GrChartDashPattern } from '../../chart/chartPath'
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
 * Приглушение перемычки через разрыв.
 *
 * Перемычка — **не данные**, и выглядеть данными не должна: за ней нет ни
 * одного замера. Отсюда и два режима вместо одного сплошного: тень говорит
 * «здесь ничего не мерили» яркостью, штрих — рисунком. Сплошная линия того же
 * цвета сказала бы «мерили и вот столько», что неправда.
 */
export const gapStrokeOpacity = 'var(--gr-chart-line-gap-opacity,0.3)'

/** Узор перемычки в режиме `dashed`. Считается от толщины линии, как и у серий. */
export const GAP_DASH: GrChartDashPattern = 'dash'
