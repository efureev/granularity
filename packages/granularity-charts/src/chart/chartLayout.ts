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
 *
 * Ошибаться оценка обязана **вверх**. Подпись оси рисуется от края области
 * построения к краю холста, и недооценка срезает её начало краем `<svg>` —
 * «100%» читается как «l00%», без всякого признака обрезки. Переоценка стоит
 * пары пикселей отступа.
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
  /** Сколько строк занимают подписи оси X: перенесённые по словам — две. */
  xTickLines?: number
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
/** Запас поверх оценки: кегль после хинтинга и масштаба страницы бывает чуть крупнее заявленного. */
const LABEL_SAFETY = 2
const LEGEND_GAP = 8
const DEFAULT_MAX_AXIS_WIDTH = 96
/**
 * Доля ширины, которую подписи категорий могут забрать у марок. Неподвижный
 * потолок в 96px резал «Доставили позже обещанного срока» до «Доставили по…» и
 * на графике в полэкрана, где места под подпись было вдоволь.
 */
const MAX_LABEL_SHARE = 0.4
const LINE_HEIGHT_RATIO = 1.35
const DEFAULT_PADDING = { top: 8, right: 8, bottom: 4, left: 4 } as const

/**
 * Классы ширины, в долях кегля. Каждый — **потолок** класса по шрифтам стека
 * `--gr-font-ui` (Inter, системный, Arial/Helvetica), замеренным в Chromium;
 * гейт — `chartLayout.test.ts`. Цифры — отдельный класс, а не средний: у Inter
 * они шире строчных, а «1» в моноширинных цифрах Arial не уже нуля.
 */
const THIN = new Set([...'.,:;\'`|!ijlI'])
const SEMI = new Set([...'ftr-()[]{}/\\"'])
const FIGURE = new Set([...'0123456789$£¥₽+−±=<>#~^*'])
const WIDE = new Set([...'w€мжшщюфыД'])
const WIDEST = new Set([...'mMW%@…ЖШЩЮЫФМ'])

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

function charUnits(char: string): number {
  if (THIN.has(char) || SPACE.test(char))
    return 0.3
  if (WIDEST.has(char))
    return 1.02
  if (WIDE.has(char))
    return 0.86
  if (SEMI.has(char))
    return 0.42
  if (FIGURE.has(char))
    return 0.66
  // Заглавная — по регистру, а не перечислением: так же для кириллицы.
  if (char !== char.toLowerCase())
    return 0.76

  return 0.6
}

/**
 * Ширина строки без DOM.
 *
 * Классы символов вместо таблицы метрик: точность до полусимвола здесь
 * лишняя — результат идёт в отступ оси, где её никто не заметит, а таблица
 * метрик расходилась бы с реальным шрифтом потребителя ровно так же.
 */
export function estimateTextWidth(text: string, fontSizePx: number): number {
  let units = 0

  for (const char of text)
    units += charUnits(char)

  return units * fontSizePx
}

export interface LabelGuttersInput {
  /** Подписи слева от области: строки матрицы, категории горизонтальной раскладки. */
  leftLabels?: readonly string[]
  /** Подписи под областью: колонки матрицы, деления значений при горизонтали. */
  bottomLabels?: readonly string[]
  fontSizePx: number
  /** Явный потолок ширины подписи. Без него потолок — доля `availableWidth`. */
  maxLabelWidth?: number
  /** Ширина, которую делят подписи и марки: потолок подписи — её доля, но не меньше 96px. */
  availableWidth?: number
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

export interface PlacedLabel {
  /** Номер подписи во входном списке. */
  index: number
  /** Центр подписи (`text-anchor: middle`). */
  x: number
  text: string
  /** Полный текст, если подпись усечена, — для `<title>`. */
  full?: string
}

export interface RowLabelsInput {
  labels: readonly string[]
  /** Левый край первой ячейки. */
  start: number
  /** Ширина ячейки. */
  step: number
  /** Куда подписи могут выходить за ряд ячеек: обычно края области построения. */
  bounds: readonly [number, number]
  fontSizePx: number
}

const ROW_LABEL_GAP = 4
/** Короче этого усечённая подпись не читается — ряд прореживается. */
const MIN_VISIBLE_CHARS = 3

/**
 * Подписи под рядом ячеек равной ширины — без наложения.
 *
 * Влезает каждая — стоят все, по центру своих ячеек. Не влезают — сначала
 * усечение многоточием, пока от подписи остаётся хотя бы три знака; дальше ряд
 * прореживается через `k`, с первой и последней подписью. Каждой оставшейся
 * достаётся отрезок до середины пути к соседям, и подпись усекается до него:
 * наложиться им не на чем по построению. У крайних отрезок доходит до `bounds`,
 * а подпись сдвигается внутрь, если по центру не помещается.
 */
export function placeRowLabels(input: RowLabelsInput): PlacedLabel[] {
  const { labels, start, step, bounds, fontSizePx } = input
  const count = labels.length

  if (count === 0 || step <= 0)
    return []

  const widest = Math.max(...labels.map(label => estimateTextWidth(label, fontSizePx)))
  const room = step - ROW_LABEL_GAP
  let every = 1

  if (widest > room) {
    const readable = labels.every((label) => {
      const fitted = fitLabel(label, fontSizePx, room)

      return fitted === label || fitted.length - 1 >= Math.min(MIN_VISIBLE_CHARS, label.length)
    })

    if (!readable)
      every = Math.max(1, Math.min(count - 1, Math.ceil((widest + ROW_LABEL_GAP) / step)))
  }

  const shown = strided(count, every)
  const center = (index: number): number => start + step * (index + 0.5)

  return shown.map((index, position) => {
    const previous = shown[position - 1]
    const next = shown[position + 1]
    const left = previous === undefined ? bounds[0] : (center(previous) + center(index)) / 2 + ROW_LABEL_GAP / 2
    const right = next === undefined ? bounds[1] : (center(index) + center(next)) / 2 - ROW_LABEL_GAP / 2
    const label = labels[index]!
    const text = fitLabel(label, fontSizePx, right - left)
    const half = estimateTextWidth(text, fontSizePx) / 2
    const x = Math.min(Math.max(center(index), left + half), right - half)

    return { index, x, text, full: text === label ? undefined : label }
  })
}

export interface WrappedLabel {
  lines: string[]
  /** Полный текст, если хоть одна строка усечена, — для `<title>`. */
  full?: string
}

/**
 * Подпись в две строки по пробелу, ближайшему к середине по ширине, — для оси,
 * где каждое деление обязано остаться подписанным (шаги моста). Не помещается
 * и так — строки кончаются многоточием.
 */
export function wrapLabel(label: string, fontSizePx: number, maxWidth: number): WrappedLabel {
  if (maxWidth <= 0 || estimateTextWidth(label, fontSizePx) <= maxWidth)
    return { lines: [label] }

  let best: [string, string] | null = null
  let bestWidth = Number.POSITIVE_INFINITY

  for (let index = label.indexOf(' '); index !== -1; index = label.indexOf(' ', index + 1)) {
    const pair: [string, string] = [label.slice(0, index), label.slice(index + 1)]
    const width = Math.max(...pair.map(line => estimateTextWidth(line, fontSizePx)))

    if (width < bestWidth) {
      best = pair
      bestWidth = width
    }
  }

  const lines = (best ?? [label]).map(line => fitLabel(line, fontSizePx, maxWidth))
  const truncated = lines.some((line, index) => line !== (best ?? [label])[index])

  return truncated ? { lines, full: label } : { lines }
}

/** Короче этого усечённая подпись ничего не называет: «Pr…» — не «Price». */
const MIN_LABEL_CHARS = 4

function isStub(label: WrappedLabel): boolean {
  return label.full !== undefined
    && label.lines.some(line => line.endsWith('…') && line.length - 1 < MIN_LABEL_CHARS)
}

/** Сколько места у крайних подписей до края холста — от центра деления. */
export interface LabelEdges {
  left: number
  right: number
}

/**
 * Подписи категорий, где каждая обязана остаться (шаги моста).
 *
 * Сначала перенос на две строки. Если и так от какой-то подписи остаётся огрызок
 * короче четырёх знаков — шахматка: соседние подписи встают в разные ряды, и
 * каждой достаётся ширина двух ячеек; крайним — сколько есть до края холста.
 * Не хватает и этого — подпись держит хотя бы четыре знака: огрызок «C…» не
 * называет ничего, а полный текст остаётся в `<title>`.
 */
export function fitCategoryLabels(
  labels: readonly string[],
  fontSizePx: number,
  step: number,
  gap: number,
  edges: LabelEdges = { left: step * 0.75, right: step * 0.75 },
): WrappedLabel[] {
  const wrapped = labels.map(label => wrapLabel(label, fontSizePx, step - gap))

  if (!wrapped.some(isStub))
    return wrapped

  const last = labels.length - 1

  return labels.map((label, index) => {
    const reachLeft = index === 0 ? edges.left : step
    const reachRight = index === last ? edges.right : step
    const fitted = fitLabel(label, fontSizePx, 2 * Math.min(reachLeft, reachRight) - gap)
    const text = fitted.endsWith('…') && fitted.length - 1 < MIN_LABEL_CHARS && label.length > MIN_LABEL_CHARS
      ? `${label.slice(0, MIN_LABEL_CHARS).trimEnd()}…`
      : fitted
    const lines = index % 2 === 0 ? [text] : ['', text]

    return text === label ? { lines } : { lines, full: label }
  })
}

/** Каждая `every`-я позиция из `count`, первая и последняя — всегда. */
function strided(count: number, every: number): number[] {
  const picked: number[] = []

  for (let index = 0; index < count; index += every)
    picked.push(index)

  const last = count - 1

  // Последняя ближе шага к предыдущей выбранной — та уступает ей место: иначе
  // две подписи у края встали бы впритык.
  if (picked.at(-1) !== last) {
    if (picked.length > 1 && last - picked.at(-1)! < every)
      picked.pop()
    picked.push(last)
  }

  return picked
}

/**
 * Подписи горизонтальной оси, которые встают без наложения.
 *
 * Деления выбирает шкала, а помещаются ли их подписи — решает ширина холста:
 * двадцать пять получасов на карточке в 250px сливались в «00:0030:0001:00…».
 * Берётся каждое `k`-е деление с первым и последним — наименьшее `k`, при
 * котором соседние подписи (по оценке ширины, центрированные на делении)
 * расходятся хотя бы на зазор. Не расходятся даже крайние — остаётся первая.
 */
export function thinTicksToFit<T extends { position: number, label: string }>(
  ticks: readonly T[],
  fontSizePx: number,
): T[] {
  const count = ticks.length

  if (count < 2)
    return [...ticks]

  const half = ticks.map(tick => estimateTextWidth(tick.label, fontSizePx) / 2)
  const fits = (picked: readonly number[]): boolean => picked.every((index, position) => {
    const previous = picked[position - 1]

    return previous === undefined
      || ticks[previous]!.position + half[previous]! + ROW_LABEL_GAP <= ticks[index]!.position - half[index]!
  })

  for (let every = 1; every < count; every++) {
    const picked = strided(count, every)

    if (fits(picked))
      return picked.map(index => ticks[index]!)
  }

  return [ticks[0]!]
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
  const maxLabelWidth = input.maxLabelWidth
    ?? Math.max(DEFAULT_MAX_AXIS_WIDTH, (input.availableWidth ?? 0) * MAX_LABEL_SHARE)
  const widest = Math.max(0, ...(input.leftLabels ?? []).map(label => estimateTextWidth(label, input.fontSizePx)))
  const capped = Math.min(widest, maxLabelWidth)

  return {
    left: widest > 0 ? capped + TICK_GAP + LABEL_SAFETY : 0,
    bottom: (input.bottomLabels?.length ?? 0) > 0 ? input.fontSizePx * LINE_HEIGHT_RATIO + TICK_GAP : 0,
    labelWidth: widest > 0 ? capped : 0,
    truncated: widest > capped,
  }
}

function sameLabels(first: readonly string[] | undefined, second: readonly string[] | undefined): boolean {
  if (first === second)
    return true
  if (!first || !second || first.length !== second.length)
    return false

  return first.every((label, index) => label === second[index])
}

/**
 * `labelGutters` с памятью на последний вход.
 *
 * Гуттер зависит от ширины области, поэтому считается от неё, а не раз на
 * компонент, — и спрашивают его на каждую марку: у теплокарты в восемьсот
 * строк это были бы тысячи проходов по восьмистам подписям за один рендер.
 */
export function memoLabelGutters(): (input: LabelGuttersInput) => LabelGutters {
  let lastInput: LabelGuttersInput | null = null
  let lastResult: LabelGutters | null = null

  return (input) => {
    if (
      lastInput && lastResult
      && lastInput.fontSizePx === input.fontSizePx
      && lastInput.availableWidth === input.availableWidth
      && lastInput.maxLabelWidth === input.maxLabelWidth
      && sameLabels(lastInput.leftLabels, input.leftLabels)
      && sameLabels(lastInput.bottomLabels, input.bottomLabels)
    ) {
      return lastResult
    }

    lastInput = input
    lastResult = labelGutters(input)

    return lastResult
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
    left += capped + TICK_GAP + LABEL_SAFETY
  }

  if (input.showYAxisRight && (input.yTickLabelsRight?.length ?? 0) > 0) {
    const widest = Math.max(...input.yTickLabelsRight!.map(label => estimateTextWidth(label, input.fontSizePx)))
    const capped = Math.min(widest, maxAxisWidth)

    truncated ||= widest > capped
    right += capped + TICK_GAP + LABEL_SAFETY
  }

  if (input.showXAxis && input.xTickLabels.length > 0) {
    bottom += lineHeight * Math.max(1, input.xTickLines ?? 1) + TICK_GAP

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
