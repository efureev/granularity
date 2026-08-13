import {
  GR_CHART_DASHES,
  type GrChartDashPattern,
  GR_CHART_SHAPES,
  type GrChartPointShape,
  dashArrayFor,
} from './chartPath'

/**
 * Палитра серий — роли ядра, а не свои цвета.
 *
 * Литералами, а не сборкой шаблонной строкой (`var(--gr-chart-${i})`): гейт
 * покомпонентных токенов ищет имена регуляркой по исходникам, и собранное имя
 * он не увидит — как и человек, который будет искать, кто использует роль.
 */
export const GR_CHART_SERIES_COLORS = [
  'var(--gr-chart-1)',
  'var(--gr-chart-2)',
  'var(--gr-chart-3)',
  'var(--gr-chart-4)',
  'var(--gr-chart-5)',
] as const

export interface GrChartSeriesStyle {
  color: string
  /**
   * Цвет заливки. По умолчанию совпадает с цветом линии.
   *
   * Отдельным полем, потому что у площади это две разные роли: линия обязана
   * читаться на фоне, а заливка под ней — не спорить с сеткой и соседями.
   * Совпадение цветов — частый случай, но не закон.
   */
  fill: string
  shape: GrChartPointShape
  dash: GrChartDashPattern
  dashArray: string | undefined
}

const COLOR_COUNT = GR_CHART_SERIES_COLORS.length
const SHAPE_COUNT = GR_CHART_SHAPES.length
const DASH_COUNT = GR_CHART_DASHES.length

/**
 * Стиль серии по её порядковому номеру.
 *
 * Периоды трёх различителей **разведены**: цвет меняется каждую серию, форма —
 * каждые пять, штриховка — каждые двадцать пять. Совпади периоды, шестая серия
 * повторила бы первую целиком — и цветом, и формой; так же выглядел бы график
 * для дальтоника уже на второй серии. Отсюда 125 различимых комбинаций вместо
 * пяти, и гейт `seriesDiscriminators.test.ts`, который это стережёт.
 */
export function seriesStyle(index: number, overrides: Partial<GrChartSeriesStyle> = {}): GrChartSeriesStyle {
  const i = Math.max(0, Math.floor(index))
  const color = overrides.color ?? GR_CHART_SERIES_COLORS[i % COLOR_COUNT]!
  const shape = overrides.shape ?? GR_CHART_SHAPES[Math.floor(i / COLOR_COUNT) % SHAPE_COUNT]!
  const dash = overrides.dash ?? GR_CHART_DASHES[Math.floor(i / (COLOR_COUNT * SHAPE_COUNT)) % DASH_COUNT]!

  return { color, fill: overrides.fill ?? color, shape, dash, dashArray: dashArrayFor(dash, 2) }
}
