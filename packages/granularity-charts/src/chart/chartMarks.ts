import type { NormalizedSeries } from './chartModel'
import type { PathPoint } from './chartPath'
import { symbolPath } from './chartPath'
import { type GrChartScale, scaleForAxis } from './chartScale'

/**
 * Перевод серий в экранные марки.
 *
 * Отдельным чистым модулем, потому что тело у линии и у площади одно и то же:
 * различаются они заливкой, а не точками. Держать этот расчёт в двух SFC значило
 * бы чинить его дважды — и однажды не заметить, что починил один.
 */

export interface ChartMark {
  key: string
  d: string
  color: string
}

/** Точки серии в пикселях. `null` остаётся `null`: разрыв ряда решает геометрия. */
export function toPixelPoints(
  series: NormalizedSeries,
  xScale: GrChartScale,
  yScale: GrChartScale,
): PathPoint[] {
  return series.points.map(point => ({
    x: xScale.scale(point.x),
    y: point.y === null ? null : yScale.scale(point.y),
  }))
}

/** Верх и низ полосы стека в пикселях. Вне стека — пусто. */
export function toStackBand(
  series: NormalizedSeries,
  xScale: GrChartScale,
  yScale: GrChartScale,
): { top: PathPoint[], base: PathPoint[] } {
  const top: PathPoint[] = []
  const base: PathPoint[] = []

  for (const point of series.points) {
    const x = xScale.scale(point.x)
    const stacked = point.stackTop !== undefined && point.stackBase !== undefined

    top.push({ x, y: stacked ? yScale.scale(point.stackTop!) : null })
    base.push({ x, y: stacked ? yScale.scale(point.stackBase!) : null })
  }

  return { top, base }
}

/** Марки всех видимых серий одним плоским списком — так шаблон остаётся плоским. */
export function symbolMarks(
  series: readonly NormalizedSeries[],
  xScale: GrChartScale,
  yScale: GrChartScale,
  size: number,
  stacked = false,
  yScaleRight: GrChartScale | null = null,
): ChartMark[] {
  return series.flatMap((item) => {
    // Марка садится на **свою** шкалу: у графика с двумя осями значение из
    // правой серии на левой шкале уехало бы в потолок или под пол.
    const scale = scaleForAxis(item.axis, yScale, yScaleRight)

    return item.points
      .filter(point => point.y !== null)
      .map(point => ({
        key: `${item.id}-${point.sourceIndex}`,
        d: symbolPath(
          item.style.shape,
          xScale.scale(point.x),
          scale.scale(stacked ? point.stackTop ?? point.y! : point.y!),
          size,
        ),
        color: item.style.color,
      }))
  })
}

/**
 * Марки активной позиции — крупнее соседних.
 *
 * У линейного графика это второй признак активной точки помимо вертикали, у
 * площади — единственный: вертикаль на заливке читается хуже.
 */
export function activeSymbolMarks(
  series: readonly NormalizedSeries[],
  xScale: GrChartScale,
  yScale: GrChartScale,
  x: number | undefined,
  size: number,
  stacked = false,
  yScaleRight: GrChartScale | null = null,
): ChartMark[] {
  if (x === undefined)
    return []

  return series.flatMap((item) => {
    const point = item.points.find(candidate => candidate.x === x && candidate.y !== null)

    if (!point)
      return []

    return [{
      key: `active-${item.id}`,
      d: symbolPath(
        item.style.shape,
        xScale.scale(point.x),
        scaleForAxis(item.axis, yScale, yScaleRight).scale(stacked ? point.stackTop ?? point.y! : point.y!),
        size,
      ),
      color: item.style.color,
    }]
  })
}
