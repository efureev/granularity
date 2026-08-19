import { describe, expect, it } from 'vitest'

import { chartLayout, estimateTextWidth, fitLabel, labelGutters } from '../chartLayout'

const base = {
  width: 600,
  height: 300,
  yTickLabels: ['0', '50', '100'],
  xTickLabels: ['янв', 'фев', 'мар'],
  fontSizePx: 12,
  showYAxis: true,
  showXAxis: true,
}

describe('estimateTextWidth', () => {
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
    expect(long.gutters.left).toBeLessThanOrEqual(4 + 40 + 6)
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

    expect(gutters.left).toBe(46)
    expect(gutters.truncated).toBe(true)
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
