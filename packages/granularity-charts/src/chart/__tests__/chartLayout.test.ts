import { describe, expect, it } from 'vitest'

import { chartLayout, estimateTextWidth, fitLabel, labelGutters, placeRowLabels, thinTicksToFit } from '../chartLayout'

const base = {
  width: 600,
  height: 300,
  yTickLabels: ['0', '50', '100'],
  xTickLabels: ['янв', 'фев', 'мар'],
  fontSizePx: 12,
  showYAxis: true,
  showXAxis: true,
}

/**
 * Настоящая ширина строк в долях кегля: максимум по шрифтам стека `--gr-font-ui` —
 * Inter 4, системному шрифту macOS и Arial/Helvetica, — замер `measureText` в
 * Chromium. Оценка обязана быть не уже: недооценка срезает начало подписи
 * оси краем холста, и «100%» читается как «l00%».
 */
const MEASURED_EM: Record<string, number> = {
  '100%': 2.65,
  '−20%': 2.851,
  '+12%': 2.66,
  '100.0%': 3.519,
  '1 000': 2.581,
  '1 234 567': 4.622,
  '4444': 2.584,
  '1.5M': 2.223,
  '12k': 1.612,
  '€1,200': 3.247,
  '$1,200': 3.208,
  '1 200 ₽': 3.542,
  '250 ms': 3.519,
  '1.2 s': 2.168,
  '12:00': 2.566,
  'Jan 2026': 4.475,
  'Wed': 2.13,
  'W12': 2.056,
  'WWW': 3.005,
  'MMM': 2.71,
  'Mississippi': 5.208,
  'ЖЩШЮ': 3.904,
  'Санкт-Петербург': 8.523,
  'Зарегистрировались': 10.309,
  'Customer changed their mind': 14.011,
  'Colour differs from the photo': 13.706,
  'Delivered after the promised date': 15.758,
  'Доставили позже обещанного срока': 18.093,
}

describe('estimateTextWidth', () => {
  it.each(Object.entries(MEASURED_EM))('«%s» не уже, чем в шрифтах стека', (text, em) => {
    expect(estimateTextWidth(text, 100)).toBeGreaterThanOrEqual(em * 100)
  })

  it('растёт с длиной строки и кеглем', () => {
    expect(estimateTextWidth('1234', 12)).toBeGreaterThan(estimateTextWidth('12', 12))
    expect(estimateTextWidth('1234', 24)).toBeGreaterThan(estimateTextWidth('1234', 12))
  })

  it('пустая строка не занимает места', () => {
    expect(estimateTextWidth('', 12)).toBe(0)
  })
})

describe('chartLayout', () => {
  it('оставляет место под обе оси', () => {
    const layout = chartLayout(base)

    expect(layout.gutters.left).toBeGreaterThan(10)
    expect(layout.gutters.bottom).toBeGreaterThan(10)
    expect(layout.plot.width).toBeLessThan(base.width)
    expect(layout.plot.height).toBeLessThan(base.height)
  })

  it('без осей отступы равны заданным', () => {
    const layout = chartLayout({ ...base, showXAxis: false, showYAxis: false, padding: { top: 2, right: 2, bottom: 2, left: 2 } })

    expect(layout.gutters).toEqual({ top: 2, right: 2, bottom: 2, left: 2 })
    expect(layout.plot).toEqual({ x: 2, y: 2, width: 596, height: 296 })
  })

  it('длинная подпись расширяет отступ до потолка и помечается усечённой', () => {
    const long = chartLayout({ ...base, yTickLabels: ['1 234 567 890 123'], maxAxisWidth: 40 })

    expect(long.truncated).toBe(true)
    expect(long.gutters.left).toBeLessThanOrEqual(4 + 40 + 6 + 2)
  })

  it('короткие подписи усечения не дают', () => {
    expect(chartLayout(base).truncated).toBe(false)
  })

  it('нулевой холст не даёт отрицательной области построения', () => {
    const layout = chartLayout({ ...base, width: 0, height: 0 })

    expect(layout.plot.width).toBe(0)
    expect(layout.plot.height).toBe(0)
  })

  it('легенда сверху отнимает высоту, но не ширину', () => {
    const withLegend = chartLayout({ ...base, legend: { position: 'top', height: 20 } })
    const without = chartLayout(base)

    expect(withLegend.plot.height).toBeLessThan(without.plot.height)
    expect(withLegend.plot.width).toBe(without.plot.width)
    expect(withLegend.legend?.y).toBe(without.gutters.top)
  })

  it('легенда снизу сдвигает нижний отступ, а не верхний', () => {
    const withLegend = chartLayout({ ...base, legend: { position: 'bottom', height: 20 } })

    expect(withLegend.plot.y).toBe(chartLayout(base).plot.y)
    expect(withLegend.gutters.bottom).toBeGreaterThan(chartLayout(base).gutters.bottom)
  })

  it('отступ оси значений вмещает самую широкую отформатированную подпись', () => {
    // Подпись прижата к области построения (`text-anchor: end`) и растёт к краю
    // холста: всё, что отступ недодал, срезается краем `<svg>`.
    const labels = ['0%', '20%', '40%', '60%', '80%', '100%']
    const layout = chartLayout({ ...base, yTickLabels: labels })
    const room = layout.gutters.left - 6

    expect(room).toBeGreaterThanOrEqual(estimateTextWidth('100%', 12))
    expect(room).toBeGreaterThanOrEqual(MEASURED_EM['100%']! * 12)
    expect(layout.truncated).toBe(false)
  })

  it('правая ось вмещает свою самую широкую подпись так же', () => {
    const layout = chartLayout({ ...base, showYAxisRight: true, yTickLabelsRight: ['250 ms', '1 250 ms'] })

    expect(layout.gutters.right - 6).toBeGreaterThanOrEqual(estimateTextWidth('1 250 ms', 12))
  })

  it('крайняя подпись оси X резервирует половину своей ширины', () => {
    const layout = chartLayout({ ...base, xTickLabels: ['01.01.2026', '01.02.2026', '01.12.2026'] })

    expect(layout.gutters.right).toBeGreaterThan(8)
  })
})

describe('estimateTextWidth: разделители разрядов', () => {
  it('одно и то же число оценивается одинаково в любой локали', () => {
    // `Intl` ставит в группировке неразрывный пробел (ru, fi) или узкий
    // неразрывный (fr). Считай мы их знаками средней ширины — отступ оси гулял
    // бы на смене локали, а вместе с ним переезжала бы область построения.
    const en = estimateTextWidth(new Intl.NumberFormat('en').format(1000), 12)

    for (const locale of ['ru', 'fr', 'fi', 'de-CH'])
      expect(estimateTextWidth(new Intl.NumberFormat(locale).format(1000), 12)).toBe(en)
  })

  it('пробел любого вида — узкий', () => {
    for (const space of [' ', '\u00A0', '\u202F', '\u2009'])
      expect(estimateTextWidth(space, 10)).toBe(estimateTextWidth(' ', 10))
  })
})

describe('fitLabel', () => {
  it('подпись, влезающая в отведённое место, остаётся целой', () => {
    expect(fitLabel('Логистика', 12, 200)).toBe('Логистика')
  })

  it('слишком длинная подпись кончается многоточием и влезает в потолок', () => {
    const fitted = fitLabel('Клиентское обслуживание', 12, 96)

    expect(fitted.endsWith('…')).toBe(true)
    expect(estimateTextWidth(fitted, 12)).toBeLessThanOrEqual(96)
    expect('Клиентское обслуживание'.startsWith(fitted.slice(0, -1))).toBe(true)
  })

  it('места нет вовсе — остаётся признак обрезки, а не хвост слова', () => {
    expect(fitLabel('Клиентское обслуживание', 12, 4)).toBe('…')
  })
})

describe('labelGutters', () => {
  it('под текст отводится место без зазора до марок', () => {
    const gutters = labelGutters({ leftLabels: ['Логистика'], fontSizePx: 12 })

    expect(gutters.labelWidth).toBeGreaterThan(0)
    expect(gutters.labelWidth).toBeLessThan(gutters.left)
  })

  it('подпись шире потолка ужимается до него, и это помечено', () => {
    const gutters = labelGutters({ leftLabels: ['Клиентское обслуживание отделения'], fontSizePx: 12 })

    expect(gutters.truncated).toBe(true)
    expect(fitLabel('Клиентское обслуживание отделения', 12, gutters.labelWidth).endsWith('…')).toBe(true)
  })

  it('слева резервируется самая широкая подпись плюс зазор', () => {
    const narrow = labelGutters({ leftLabels: ['I'], fontSizePx: 12 })
    const wide = labelGutters({ leftLabels: ['I', 'Ноябрь 2026'], fontSizePx: 12 })

    expect(wide.left).toBeGreaterThan(narrow.left)
  })

  it('без подписей гуттера нет — это не то же самое, что подпись нулевой ширины', () => {
    expect(labelGutters({ fontSizePx: 12 })).toEqual({ left: 0, bottom: 0, labelWidth: 0, truncated: false })
  })

  it('снизу резервируется строка текста, а её содержимое ширину не меняет', () => {
    const short = labelGutters({ bottomLabels: ['I'], fontSizePx: 12 })
    const long = labelGutters({ bottomLabels: ['Ноябрь 2026', 'Декабрь 2026'], fontSizePx: 12 })

    expect(short.bottom).toBe(long.bottom)
    expect(short.bottom).toBeGreaterThan(0)
  })

  it('подпись выше потолка усекается и помечается', () => {
    const gutters = labelGutters({ leftLabels: ['A'.repeat(200)], fontSizePx: 12, maxLabelWidth: 40 })

    expect(gutters.left).toBe(48)
    expect(gutters.truncated).toBe(true)
  })

  it('потолок подписи — доля доступной ширины, а не 96px на любом холсте', () => {
    const label = 'Delivered after the promised date'
    const wide = labelGutters({ leftLabels: [label], fontSizePx: 12, availableWidth: 540 })

    expect(wide.truncated).toBe(false)
    expect(wide.labelWidth).toBe(estimateTextWidth(label, 12))
    expect(labelGutters({ leftLabels: [label], fontSizePx: 12 }).truncated).toBe(true)
  })

  it('колонка подписей растёт с длиной подписи до 40% ширины и дальше усекается', () => {
    const availableWidth = 540
    const widths = ['Брак', 'Не подошёл размер', 'Доставили позже срока', 'Не подошёл размер, курьер не позвонил вовремя']
      .map(label => labelGutters({ leftLabels: [label], fontSizePx: 12, availableWidth }))

    expect(widths[1]!.labelWidth).toBeGreaterThan(widths[0]!.labelWidth)
    expect(widths[2]!.labelWidth).toBeGreaterThan(widths[1]!.labelWidth)
    expect(widths[3]!.labelWidth).toBe(availableWidth * 0.4)
    expect(widths[3]!.truncated).toBe(true)
    expect(widths.slice(0, 3).every(gutters => !gutters.truncated)).toBe(true)
  })

  it('на узком холсте потолок не опускается ниже 96px', () => {
    expect(labelGutters({ leftLabels: ['A'.repeat(200)], fontSizePx: 12, availableWidth: 120 }).labelWidth).toBe(96)
  })
})

describe('chartLayout: правая ось', () => {
  it('без второй оси правый отступ остаётся прежним', () => {
    const withFlag = chartLayout({ ...base, showYAxisRight: false, yTickLabelsRight: ['40 000'] })

    expect(withFlag.gutters.right).toBe(chartLayout(base).gutters.right)
  })

  it('вторая ось резервирует место справа', () => {
    const dual = chartLayout({ ...base, showYAxisRight: true, yTickLabelsRight: ['40 000', '42 000'] })

    expect(dual.gutters.right).toBeGreaterThan(chartLayout(base).gutters.right)
    expect(dual.plot.width).toBeLessThan(chartLayout(base).plot.width)
  })

  it('пустой список подписей места не занимает: флага мало, нужны сами подписи', () => {
    const empty = chartLayout({ ...base, showYAxisRight: true, yTickLabelsRight: [] })

    expect(empty.gutters.right).toBe(chartLayout(base).gutters.right)
  })

  it('подпись правой оси выше потолка помечает усечение', () => {
    const long = chartLayout({ ...base, showYAxisRight: true, yTickLabelsRight: ['A'.repeat(200)] })

    expect(long.truncated).toBe(true)
  })

  it('левый отступ вторая ось не трогает', () => {
    const dual = chartLayout({ ...base, showYAxisRight: true, yTickLabelsRight: ['40 000'] })

    expect(dual.gutters.left).toBe(chartLayout(base).gutters.left)
  })
})

describe('placeRowLabels', () => {
  /** Отрезки, которые подписи занимают на оси, в порядке слева направо. */
  function boxes(labels: ReturnType<typeof placeRowLabels>): Array<[number, number]> {
    return labels.map((label) => {
      const half = estimateTextWidth(label.text, 12) / 2

      return [label.x - half, label.x + half]
    })
  }

  function overlapping(spans: Array<[number, number]>): boolean {
    return spans.some((span, index) => index > 0 && span[0] < spans[index - 1]![1])
  }

  it('влезающие подписи стоят все и по центру ячеек', () => {
    const placed = placeRowLabels({ labels: ['M0', 'M1', 'M2'], start: 100, step: 60, bounds: [0, 300], fontSizePx: 12 })

    expect(placed.map(label => label.text)).toEqual(['M0', 'M1', 'M2'])
    expect(placed.map(label => label.x)).toEqual([130, 190, 250])
  })

  it('узкие ячейки: подписи не налезают и не выходят за края', () => {
    const labels = ['Starter', 'Team', 'Business']
    const placed = placeRowLabels({ labels, start: 110, step: 31, bounds: [4, 205], fontSizePx: 12 })
    const spans = boxes(placed)

    expect(overlapping(spans)).toBe(false)
    expect(spans[0]![0]).toBeGreaterThanOrEqual(4)
    expect(spans.at(-1)![1]).toBeLessThanOrEqual(205)
    // Прорежено с краёв: первая и последняя колонка подписаны всегда.
    expect(placed[0]!.index).toBe(0)
    expect(placed.at(-1)!.index).toBe(2)
  })

  it('усечение — пока от подписи остаётся хотя бы три знака, и полный текст сохраняется', () => {
    const labels = ['Январь', 'Февраль', 'Март', 'Апрель']
    const placed = placeRowLabels({ labels, start: 0, step: 48, bounds: [0, 192], fontSizePx: 12 })

    expect(placed).toHaveLength(4)
    expect(overlapping(boxes(placed))).toBe(false)
    expect(placed[1]!.text.endsWith('…')).toBe(true)
    expect(placed[1]!.full).toBe('Февраль')
    expect(placed[2]!.full).toBeUndefined()
  })

  it('длинный ряд прореживается, и подписи не налезают', () => {
    const labels = Array.from({ length: 60 }, (_, day) => `${day + 1} сен`)
    const placed = placeRowLabels({ labels, start: 40, step: 9, bounds: [0, 580], fontSizePx: 12 })

    expect(placed.length).toBeLessThan(labels.length)
    expect(placed[0]!.index).toBe(0)
    expect(placed.at(-1)!.index).toBe(59)
    expect(overlapping(boxes(placed))).toBe(false)
  })
})

describe('thinTicksToFit', () => {
  function ticksAt(labels: readonly string[], width: number) {
    const step = width / labels.length

    return labels.map((label, index) => ({ value: index, position: step * (index + 0.5), label }))
  }

  function intersecting(ticks: ReturnType<typeof ticksAt>): boolean {
    return ticks.some((tick, index) => {
      const previous = ticks[index - 1]

      return previous !== undefined
        && previous.position + estimateTextWidth(previous.label, 12) / 2 > tick.position - estimateTextWidth(tick.label, 12) / 2
    })
  }

  it('помещающиеся подписи остаются все', () => {
    const ticks = ticksAt(['Q1', 'Q2', 'Q3', 'Q4'], 600)

    expect(thinTicksToFit(ticks, 12)).toEqual(ticks)
  })

  it('двадцать пять получасов на 250px прореживаются без наложения, с краями', () => {
    const labels = Array.from({ length: 25 }, (_, index) => `${String(Math.floor(index / 2)).padStart(2, '0')}:${index % 2 === 0 ? '00' : '30'}`)
    const thinned = thinTicksToFit(ticksAt(labels, 250), 12)

    expect(intersecting(thinned)).toBe(false)
    expect(thinned.length).toBeGreaterThan(1)
    expect(thinned[0]!.label).toBe('00:00')
    expect(thinned.at(-1)!.label).toBe('12:00')
  })

  it('не помещаются даже крайние — остаётся первая', () => {
    const thinned = thinTicksToFit(ticksAt(['Очень длинная подпись', 'Ещё одна длинная подпись'], 60), 12)

    expect(thinned.map(tick => tick.label)).toEqual(['Очень длинная подпись'])
  })
})
