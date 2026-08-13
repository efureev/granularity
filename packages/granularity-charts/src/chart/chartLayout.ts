/**
 * Раскладка холста: сколько места отнимают оси, легенда и подписи.
 *
 * Ширина подписи **оценивается**, а не измеряется. `getBBox` в jsdom не
 * существует (раскладка стала бы непроверяемой), а в браузере он форсирует
 * reflow и требует второго прохода — то есть прыжок рисунка на первом кадре и
 * расхождение с серверным рендером. Оценка по кеглю даёт одинаковый результат
 * на сервере, на клиенте и в тесте.
 *
 * Цена известна: очень длинная подпись не влезает в потолок и усекается
 * (`truncated`). Это не «до настоящего замера» — возврат к замеру вернёт и
 * прыжок, и расхождение гидрации.
 */

export interface Rect {
  x: number
  y: number
  width: number
  height: number
}

export interface ChartLayoutInput {
  width: number
  height: number
  /** Уже отформатированные подписи: по ним и считается место под ось. */
  yTickLabels: readonly string[]
  xTickLabels: readonly string[]
  fontSizePx: number
  showYAxis: boolean
  showXAxis: boolean
  legend?: { position: 'top' | 'bottom', height: number }
  padding?: Partial<Record<'top' | 'right' | 'bottom' | 'left', number>>
  maxAxisWidth?: number
}

export interface ChartLayout {
  plot: Rect
  gutters: { top: number, right: number, bottom: number, left: number }
  legend: Rect | null
  /** Подписи оси значений не влезли в потолок и будут усечены. */
  truncated: boolean
}

const TICK_GAP = 6
const LEGEND_GAP = 8
const DEFAULT_MAX_AXIS_WIDTH = 96
const LINE_HEIGHT_RATIO = 1.35
const DEFAULT_PADDING = { top: 8, right: 8, bottom: 4, left: 4 } as const

const NARROW = new Set([...'.,:;\'`|!ift1 '])
const WIDE = new Set([...'ABCDEFGHKLMNOPQRSTUVXYZmw@%'])

/**
 * Ширина строки без DOM.
 *
 * Три класса символов вместо таблицы метрик: точность до полусимвола здесь
 * лишняя — результат идёт в отступ оси, где её никто не заметит, а таблица
 * метрик расходилась бы с реальным шрифтом потребителя ровно так же.
 */
export function estimateTextWidth(text: string, fontSizePx: number): number {
  let units = 0

  for (const char of text) {
    if (NARROW.has(char))
      units += 0.32
    else if (WIDE.has(char))
      units += 0.68
    else
      units += 0.55
  }

  return units * fontSizePx
}

export function chartLayout(input: ChartLayoutInput): ChartLayout {
  const padding = { ...DEFAULT_PADDING, ...input.padding }
  const maxAxisWidth = input.maxAxisWidth ?? DEFAULT_MAX_AXIS_WIDTH
  const lineHeight = input.fontSizePx * LINE_HEIGHT_RATIO

  let top = padding.top
  let right = padding.right
  let bottom = padding.bottom
  let left = padding.left
  let truncated = false

  if (input.showYAxis && input.yTickLabels.length > 0) {
    const widest = Math.max(...input.yTickLabels.map(label => estimateTextWidth(label, input.fontSizePx)))
    const capped = Math.min(widest, maxAxisWidth)

    truncated = widest > capped
    left += capped + TICK_GAP
  }

  if (input.showXAxis && input.xTickLabels.length > 0) {
    bottom += lineHeight + TICK_GAP

    // Крайние подписи центрируются под своими делениями и вылезли бы за холст
    // ровно наполовину. Потолок тот же, что у оси значений: без него одна
    // длинная подпись съела бы весь график.
    const first = input.xTickLabels[0]!
    const last = input.xTickLabels[input.xTickLabels.length - 1]!

    left = Math.max(left, padding.left + Math.min(estimateTextWidth(first, input.fontSizePx) / 2, maxAxisWidth / 2))
    right = Math.max(right, padding.right + Math.min(estimateTextWidth(last, input.fontSizePx) / 2, maxAxisWidth / 2))
  }

  let legend: Rect | null = null

  if (input.legend) {
    const height = input.legend.height + LEGEND_GAP

    if (input.legend.position === 'top') {
      legend = { x: padding.left, y: top, width: Math.max(0, input.width - padding.left - padding.right), height: input.legend.height }
      top += height
    }
    else {
      bottom += height
      legend = {
        x: padding.left,
        y: Math.max(0, input.height - padding.bottom - input.legend.height),
        width: Math.max(0, input.width - padding.left - padding.right),
        height: input.legend.height,
      }
    }
  }

  return {
    plot: {
      x: left,
      y: top,
      width: Math.max(0, input.width - left - right),
      height: Math.max(0, input.height - top - bottom),
    },
    gutters: { top, right, bottom, left },
    legend,
    truncated,
  }
}
