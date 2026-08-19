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
  /** Подписи правой оси. Место под неё резервируется, только когда она есть. */
  yTickLabelsRight?: readonly string[]
  xTickLabels: readonly string[]
  fontSizePx: number
  showYAxis: boolean
  showYAxisRight?: boolean
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

const NARROW = new Set([...'.,:;\'`|!ift1'])
const WIDE = new Set([...'ABCDEFGHKLMNOPQRSTUVXYZmw@%'])

/**
 * Пробел любого вида — узкий, и проверяется он классом, а не перечислением.
 *
 * Разделитель разрядов у `Intl` — пробел далеко не всегда обычный: русский и
 * финский ставят неразрывный `U+00A0`, французский — узкий неразрывный
 * `U+202F`. По коду с `' '` они не совпадают, и в перечислении их не было —
 * значит, «1 000» оценивалось шире, чем «1,000», хотя рисуется той же
 * шириной. Отступ оси от этого гулял на смене локали, и вместе с ним
 * переезжала вся область построения.
 */
const SPACE = /\s/u

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
    if (NARROW.has(char) || SPACE.test(char))
      units += 0.32
    else if (WIDE.has(char))
      units += 0.68
    else
      units += 0.55
  }

  return units * fontSizePx
}

export interface LabelGuttersInput {
  /** Подписи слева от области: строки матрицы, категории горизонтальной раскладки. */
  leftLabels?: readonly string[]
  /** Подписи под областью: колонки матрицы, деления значений при горизонтали. */
  bottomLabels?: readonly string[]
  fontSizePx: number
  maxLabelWidth?: number
}

export interface LabelGutters {
  left: number
  bottom: number
  /** Ширина, отведённая под текст подписи, — без зазора до марок. */
  labelWidth: number
  /** Подпись не влезла в потолок: рисующий обязан дать ей `<title>`. */
  truncated: boolean
}

/**
 * Подпись, укороченная до отведённой ширины.
 *
 * SVG не знает `text-overflow`: текст, которому не хватило места, просто уезжает
 * за холст и обрезается его краем — читатель видит хвост слова без всякого
 * признака, что начало отрезано. Многоточие этот признак возвращает, а полный
 * текст рисующий кладёт в `<title>`.
 */
export function fitLabel(label: string, fontSizePx: number, maxWidth: number): string {
  if (maxWidth <= 0 || estimateTextWidth(label, fontSizePx) <= maxWidth)
    return label

  const ellipsisWidth = estimateTextWidth('…', fontSizePx)
  let cut = label.length

  while (cut > 0 && estimateTextWidth(label.slice(0, cut), fontSizePx) + ellipsisWidth > maxWidth)
    cut -= 1

  return cut > 0 ? `${label.slice(0, cut).trimEnd()}…` : '…'
}

/**
 * Место под собственные подписи компонента — для тех, кто идёт с `axes: false`.
 *
 * Теплокарта, воронка и горизонтальный мост подписывают не деления числовой
 * оси, а сами марки, и `chartLayout` про эти подписи ничего не знает: он
 * считает гуттеры рамы, а рама их осей у таких графиков не рисует. Гуттер
 * поэтому считается внутри области построения и ужимает марки — тот же приём,
 * что у круга под выносными подписями.
 *
 * Ширина по-прежнему оценивается, а не измеряется: причина в докблоке модуля.
 */
export function labelGutters(input: LabelGuttersInput): LabelGutters {
  const maxLabelWidth = input.maxLabelWidth ?? DEFAULT_MAX_AXIS_WIDTH
  const widest = Math.max(0, ...(input.leftLabels ?? []).map(label => estimateTextWidth(label, input.fontSizePx)))
  const capped = Math.min(widest, maxLabelWidth)

  return {
    left: widest > 0 ? capped + TICK_GAP : 0,
    bottom: (input.bottomLabels?.length ?? 0) > 0 ? input.fontSizePx * LINE_HEIGHT_RATIO + TICK_GAP : 0,
    labelWidth: widest > 0 ? capped : 0,
    truncated: widest > capped,
  }
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

  if (input.showYAxisRight && (input.yTickLabelsRight?.length ?? 0) > 0) {
    const widest = Math.max(...input.yTickLabelsRight!.map(label => estimateTextWidth(label, input.fontSizePx)))
    const capped = Math.min(widest, maxAxisWidth)

    truncated ||= widest > capped
    right += capped + TICK_GAP
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
