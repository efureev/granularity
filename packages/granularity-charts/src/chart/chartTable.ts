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
  /** Ось колонки. `undefined` — ось одна, и уточнять нечего. */
  axis?: 'left' | 'right'
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
  /**
   * Пояснения к таблице: опорная линия, единица оси у колонки.
   *
   * Не строки данных, и потому не `rows`: строка утверждала бы позицию по X,
   * которой у порога нет, а читающий без зрения услышал бы «Порог:
   * критический, пусто, пусто» — три лжи на одно пояснение. Рисуются в
   * `<tfoot>` одной ячейкой на всю ширину.
   */
  notes?: readonly string[]
}

export interface ChartTableOptions {
  xLabel: string
  caption: string
  formatX: (point: NormalizedPoint) => string
  /** Формат значения. Ось приходит вторым аргументом: у правой свои единицы. */
  formatY: (value: number | null, axis: 'left' | 'right') => string
  /**
   * Подпись оси у колонки: «MRR (правая ось)».
   *
   * Вызывается **только** когда среди видимых серий есть обе оси. У графика с
   * одной осью «(левая ось)» это шум, а значения из разных шкал, стоящие рядом
   * без пояснения, — уже дезинформация.
   */
  axisLabel?: (axis: 'left' | 'right') => string
}

/**
 * Скрытые серии в таблицу не попадают: она обязана совпадать с рисунком, иначе
 * читающий её без зрения получит другой график, чем видит зрячий сосед.
 */
export function chartTableModel(data: ChartData, options: ChartTableOptions): ChartTableModel {
  const visible = data.series.filter(series => !series.hidden)
  const byPosition = visible.map(series => series.byX)
  const anyPoint = new Map<number, NormalizedPoint>()

  for (const series of visible) {
    for (const point of series.points) {
      if (!anyPoint.has(point.x))
        anyPoint.set(point.x, point)
    }
  }

  const mixedAxes = options.axisLabel !== undefined
    && visible.some(series => series.axis === 'right')
    && visible.some(series => series.axis === 'left')

  return {
    caption: options.caption,
    columns: [
      { key: 'x', label: options.xLabel },
      ...visible.map(series => ({
        key: series.id,
        label: mixedAxes ? `${series.label} (${options.axisLabel!(series.axis)})` : series.label,
        // Поле остаётся машиночитаемым и тогда, когда подписи нет: потребитель,
        // строящий свою таблицу, различит оси без разбора строки.
        axis: series.axis,
      })),
    ],
    rows: data.positions.map((x) => {
      const sample = anyPoint.get(x)

      return {
        header: sample ? options.formatX(sample) : String(x),
        cells: byPosition.map((index, column) => options.formatY(index.get(x)?.y ?? null, visible[column]!.axis)),
      }
    }),
  }
}
