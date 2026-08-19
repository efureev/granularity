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
/**
 * Модель, усечённая до потолка строк.
 *
 * Страховочный слой, общий на все типы графиков. Декартовы типы до него обычно
 * не доходят: их таблица сужается раньше, на уровне `ChartData`, и печатает
 * ровно те точки, что нарисованы (`decimateChartData`). Но у категориальной оси
 * бюджета рисунка нет вовсе, а круг, радар, воронка, буллет, мост и теплокарта
 * строят модель сами и мимо него проходят — им остаётся равномерная выборка.
 *
 * Концы ряда сохраняются всегда: таблица без первой и последней строки врёт о
 * границах данных. Та же ссылка, если усекать нечего.
 */
export function trimTableModel(model: ChartTableModel, maxRows: number): ChartTableModel {
  const total = model.rows.length

  if (!Number.isFinite(maxRows) || maxRows < 2 || total <= maxRows)
    return model

  const keep = Math.floor(maxRows)
  const rows: ChartTableRow[] = []
  let previous = -1

  for (let i = 0; i < keep; i++) {
    const index = Math.round((i * (total - 1)) / (keep - 1))

    if (index === previous)
      continue

    previous = index
    rows.push(model.rows[index]!)
  }

  return { ...model, rows }
}

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
