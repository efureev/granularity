import type { ChartData, NormalizedPoint } from './chartModel'

/**
 * Модель скрытой таблицы данных.
 *
 * Отдельным чистым модулем, потому что один и тот же текст идёт в три места:
 * в таблицу под графиком, в тултип и в объявление активной точки для
 * скринридера. Одна функция — три потребителя — ноль расхождений между тем,
 * что видно, и тем, что слышно.
 */

export interface ChartTableColumn {
  key: string
  label: string
}

export interface ChartTableRow {
  /** Значение по оси X — заголовок строки. */
  header: string
  cells: string[]
}

export interface ChartTableModel {
  columns: ChartTableColumn[]
  rows: ChartTableRow[]
  caption: string
}

export interface ChartTableOptions {
  xLabel: string
  caption: string
  formatX: (point: NormalizedPoint) => string
  formatY: (value: number | null) => string
}

/**
 * Скрытые серии в таблицу не попадают: она обязана совпадать с рисунком, иначе
 * читающий её без зрения получит другой график, чем видит зрячий сосед.
 */
export function chartTableModel(data: ChartData, options: ChartTableOptions): ChartTableModel {
  const visible = data.series.filter(series => !series.hidden)
  const byPosition = visible.map(series => new Map(series.points.map(point => [point.x, point])))
  const anyPoint = new Map<number, NormalizedPoint>()

  for (const series of visible) {
    for (const point of series.points) {
      if (!anyPoint.has(point.x))
        anyPoint.set(point.x, point)
    }
  }

  return {
    caption: options.caption,
    columns: [
      { key: 'x', label: options.xLabel },
      ...visible.map(series => ({ key: series.id, label: series.label })),
    ],
    rows: data.positions.map((x) => {
      const sample = anyPoint.get(x)

      return {
        header: sample ? options.formatX(sample) : String(x),
        cells: byPosition.map(index => options.formatY(index.get(x)?.y ?? null)),
      }
    }),
  }
}
