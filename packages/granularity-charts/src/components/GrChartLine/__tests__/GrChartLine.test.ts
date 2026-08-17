import { announced, granularityGlobal, i18nAdapter, keydown, mockRect } from '@feugene/granularity/testing'
import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import { nextTick } from 'vue'

import GrChartLine from '../GrChartLine.vue'

const series = [
  { id: 'sales', label: 'Продажи', x: [0, 1, 2, 3], y: [10, 40, 20, 50] },
  { id: 'returns', label: 'Возвраты', x: [0, 1, 2, 3], y: [5, 8, 6, 9] },
]

function factory(props: Record<string, unknown> = {}, options: Record<string, unknown> = {}) {
  const wrapper = mount(GrChartLine, {
    props: { series, ...props },
    global: granularityGlobal(options),
    attachTo: document.body,
  })

  // Раскладки в jsdom нет: без прямоугольника поверхности координата указателя
  // не превращается ни во что осмысленное.
  const surface = wrapper.find('[data-gr-chart-surface]')

  if (surface.exists())
    mockRect(surface.element, { left: 0, top: 0, width: 640, height: 256 })

  return wrapper
}

describe('GrChartLine', () => {
  it('рисует по пути на видимую серию', () => {
    const wrapper = factory()

    expect(wrapper.findAll('[data-gr-chart-series]')).toHaveLength(2)
    expect(wrapper.find('[data-gr-chart-series="sales"]').attributes('d')).toContain('M ')
  })

  it('пропуск рвёт линию на два подпути', () => {
    const wrapper = factory({ series: [{ id: 'a', x: [0, 1, 2, 3, 4], y: [1, 2, null, 4, 5] }] })
    const d = wrapper.find('[data-gr-chart-series="a"]').attributes('d')!

    expect(d.match(/M /g)).toHaveLength(2)
  })

  describe('перемычки через разрыв', () => {
    const gapped = [{ id: 'a', x: [0, 1, 2, 3, 4], y: [1, 2, null, 4, 5] }]

    it('по умолчанию линия рвётся и ничем не закрывается', () => {
      expect(factory({ series: gapped }).findAll('[data-gr-chart-gap]')).toHaveLength(0)
    })

    it('тень — приглушением, штрих — узором, и это разные вещи', () => {
      const shadow = factory({ series: gapped, gaps: 'shadow' }).find('[data-gr-chart-gap]')
      const dashed = factory({ series: gapped, gaps: 'dashed' }).find('[data-gr-chart-gap]')

      expect(shadow.attributes('stroke-opacity')).toContain('--gr-chart-line-gap-opacity')
      expect(shadow.attributes('stroke-dasharray')).toBeUndefined()

      expect(dashed.attributes('stroke-dasharray')).toBeTruthy()
      expect(dashed.attributes('stroke-opacity')).toBeUndefined()
    })

    it('перемычка соединяет края разрыва и рисуется под линией', () => {
      const wrapper = factory({ series: gapped, gaps: 'dashed' })
      const body = wrapper.find('[data-gr-chart-line-body]')
      const paths = body.findAll('path')

      expect(paths[0]!.attributes('data-gr-chart-gap')).toBe('a')
      expect(paths[1]!.attributes('data-gr-chart-series')).toBe('a')
      expect(paths[0]!.attributes('d')).toMatch(/^M [\d.]+ [\d.]+ L [\d.]+ [\d.]+$/)
    })

    it('ряд без разрывов перемычек не даёт', () => {
      const wrapper = factory({ series: [{ id: 'a', y: [1, 2, 3] }], gaps: 'dashed' })

      expect(wrapper.find('[data-gr-chart-gap]').attributes('d')).toBe('')
    })

    it('перемычка не меняет данные: в таблице по-прежнему «нет значения»', () => {
      // Она дорисовывает картинку, а не ряд. Появись пропуск в таблице
      // значением — график начал бы врать тому, кто читает его без зрения.
      const rows = factory({ series: gapped, gaps: 'shadow' })
        .find('[data-gr-chart-table]')
        .findAll('tbody tr')

      expect(rows[2]!.text()).toContain('no value')
    })

    it('режим приезжает из GrConfigProvider', () => {
      const wrapper = factory(
        { series: gapped },
        { componentDefaults: { GrChartLine: { gaps: 'dashed' } } },
      )

      expect(wrapper.find('[data-gr-chart-gap]').attributes('stroke-dasharray')).toBeTruthy()
    })
  })

  it('ряд, начинающийся с пропуска, остаётся рядом чисел, а не списком серий', () => {
    expect(() => factory({ series: [{ id: 'a', y: [null, null, 5, 7] }] })).not.toThrow()
  })

  it('серии различаются не только цветом', () => {
    const wrapper = factory({ showPoints: 'always' })
    const markers = wrapper.findAll('[data-gr-chart-line-body] path').map(node => node.attributes('d'))

    // Формы маркеров двух серий не совпадают: цикл различителей разведён.
    expect(new Set(markers).size).toBeGreaterThan(2)
  })

  it('маркеры не рисуются на плотном ряде', () => {
    const dense = { id: 'a', y: Array.from({ length: 400 }, (_, i) => i) }
    const wrapper = factory({ series: [dense] })

    expect(wrapper.findAll('[data-gr-chart-line-body] path')).toHaveLength(1)
  })

  it('стрелки двигают активную точку и объявляют её', async () => {
    const wrapper = factory({}, { i18n: i18nAdapter({}) })
    const surface = wrapper.find('[data-gr-chart-surface]')

    keydown(surface.element, 'ArrowRight')
    await nextTick()

    expect(wrapper.emitted('update:activeIndex')?.at(-1)).toEqual([0])
    await expect(announced()).resolves.toContain('Продажи')
  })

  it('Escape снимает активную точку', async () => {
    const wrapper = factory()
    const surface = wrapper.find('[data-gr-chart-surface]')

    keydown(surface.element, 'ArrowRight')
    await nextTick()
    keydown(surface.element, 'Escape')
    await nextTick()

    expect(wrapper.emitted('update:activeIndex')?.at(-1)).toEqual([null])
  })

  it('первое нажатие заходит с того края, куда ведёт клавиша', async () => {
    // Иначе первое движение с клавиатуры не даёт ничего, и пользователь решает,
    // что график клавиатуру не понимает (`docs/keyboard.md`).
    const right = factory()

    keydown(right.find('[data-gr-chart-surface]').element, 'ArrowRight')
    await nextTick()
    expect(right.emitted('update:activeIndex')?.at(-1)).toEqual([0])

    const left = factory()

    keydown(left.find('[data-gr-chart-surface]').element, 'ArrowLeft')
    await nextTick()
    expect(left.emitted('update:activeIndex')?.at(-1)).toEqual([3])
  })

  it('движение по ряду не кольцуется: на краю курсор остаётся на месте', async () => {
    const wrapper = factory()
    const surface = wrapper.find('[data-gr-chart-surface]').element

    keydown(surface, 'End')
    keydown(surface, 'ArrowRight')
    await nextTick()

    expect(wrapper.emitted('update:activeIndex')?.at(-1)).toEqual([3])
  })

  it('PageDown шагает десятой частью ряда, но не меньше точки', async () => {
    const dense = { id: 'a', y: Array.from({ length: 50 }, (_, index) => index) }
    const wrapper = factory({ series: [dense] })

    keydown(wrapper.find('[data-gr-chart-surface]').element, 'PageDown')
    await nextTick()

    expect(wrapper.emitted('update:activeIndex')?.at(-1)).toEqual([5])
  })

  /**
   * Клавиша, которой нечего делать, не съедается. Иначе `Esc` не закрыл бы
   * модалку, в которой стоит график, а `Space` перестал бы прокручивать
   * страницу — обе потери тихие.
   */
  it.each([
    ['Escape'],
    [' '],
    ['ArrowUp'],
  ])('%s без работы не перехватывается', (key) => {
    const wrapper = factory({ series: [{ id: 'a', y: [1, 2, 3] }] })
    const event = new KeyboardEvent('keydown', { key, cancelable: true, bubbles: true })

    wrapper.find('[data-gr-chart-surface]').element.dispatchEvent(event)

    expect(event.defaultPrevented).toBe(false)
  })

  it('стрелки вверх и вниз меняют читаемую серию и кольцуются', async () => {
    const wrapper = factory({}, { i18n: i18nAdapter({}) })
    const surface = wrapper.find('[data-gr-chart-surface]').element

    keydown(surface, 'ArrowRight')
    await nextTick()
    await expect(announced()).resolves.toContain('Продажи')

    keydown(surface, 'ArrowDown')
    await nextTick()
    await expect(announced()).resolves.toContain('Возвраты')

    // Серий две — второй шаг возвращает к первой.
    keydown(surface, 'ArrowDown')
    await nextTick()
    await expect(announced()).resolves.toContain('Продажи')
  })

  it('Tab не перехватывается — фокус обязан уходить дальше', () => {
    const wrapper = factory()
    const event = new KeyboardEvent('keydown', { key: 'Tab', cancelable: true, bubbles: true })

    wrapper.find('[data-gr-chart-surface]').element.dispatchEvent(event)

    expect(event.defaultPrevented).toBe(false)
  })

  it('у графика ровно одна остановка Tab', () => {
    const wrapper = factory()

    expect(wrapper.findAll('[tabindex="0"]')).toHaveLength(1)
  })

  it('легенда переключает серию через v-model:hiddenSeries', async () => {
    const wrapper = factory({ showLegend: true, hiddenSeries: [] })

    await wrapper.find('[data-gr-chart-legend-item="returns"]').trigger('click')

    expect(wrapper.emitted('legendToggle')?.at(-1)).toEqual([{ seriesId: 'returns', hidden: true }])
    expect(wrapper.emitted('update:hiddenSeries')?.at(-1)).toEqual([['returns']])
  })

  it('скрытая серия не рисуется', () => {
    const wrapper = factory({ hiddenSeries: ['returns'] })

    expect(wrapper.findAll('[data-gr-chart-series]')).toHaveLength(1)
  })

  it('загрузка помечает корень aria-busy и показывает скелет с призраком графика', () => {
    const wrapper = factory({ loading: true })

    expect(wrapper.find('[data-gr-chart-frame]').attributes('aria-busy')).toBe('true')
    expect(wrapper.find('[role="status"]').exists()).toBe(true)
    // Призрак — не данные: он скрыт от скринридера, за него говорит `role="status"`.
    expect(wrapper.find('[data-gr-chart-ghost]').attributes('aria-hidden')).toBe('true')
  })

  it('на время загрузки место под оси зарезервировано — данные придут без перекладки', () => {
    // Иначе область построения переезжает на ширину оси в момент прихода данных.
    const plotOf = (wrapper: ReturnType<typeof factory>) =>
      wrapper.find('[role="status"]').attributes('style')

    const loading = plotOf(factory({ loading: true }))

    expect(loading).toContain('left:')
    // Гуттер под ось значений заметно больше нуля.
    expect(Number(/left:\s*([\d.]+)px/.exec(loading!)![1])).toBeGreaterThan(20)
  })

  it('пустые данные дают пустое состояние и не дают поверхности', () => {
    const wrapper = factory({ series: [] })

    expect(wrapper.find('[data-gr-chart-surface]').exists()).toBe(false)
    expect(wrapper.text()).toContain('No data')
  })

  it('скрытая таблица повторяет данные графика', () => {
    const wrapper = factory()
    const table = wrapper.find('[data-gr-chart-table]')
    const rows = table.findAll('tbody tr')

    // `sr-only` висит на обёртке, а не на самой таблице: у табличных боксов
    // `height: 1px` работает как минимум, и скрытая таблица сохраняла бы полную
    // высоту, раздувая прокрутку контейнера вокруг графика.
    expect(table.classes()).not.toContain('sr-only')
    expect(table.element.parentElement?.className).toContain('sr-only')
    expect(rows).toHaveLength(4)
    expect(rows[1]!.text()).toContain('40')
    expect(table.findAll('thead th')).toHaveLength(3)
  })

  it('панель тултипа не перехватывает указатель — иначе она моргает под курсором', () => {
    // Обёртка панели позиционируется `fixed` и ложится поверх области
    // построения. Перехвати она указатель — поверхность получила бы
    // `pointerleave`, тултип закрылся бы, курсор снова оказался бы над графиком
    // и открыл его заново. Инвариант рамы, а не линии: у столбцов панель садится
    // прямо на верх полосы, и там это заметнее всего.
    const wrapper = factory()
    const panel = wrapper.findAll('div').find(node => node.attributes('style')?.includes('position: fixed'))

    expect(panel).toBeDefined()
    expect(panel!.classes()).toContain('pointer-events-none')
  })

  it('видимая таблица не повторяет дату в каждой строке, а скрытая повторяет', () => {
    // Скринридер читает строку вне соседей — там дата обязана быть. Глазами тот
    // же повтор двадцать четыре раза мешает сравнивать значения
    // (`docs/model.md`, «Подписи времени в таблице»).
    const hourly = [{
      id: 'temp',
      data: Array.from({ length: 6 }, (_, hour) => ({ x: new Date(2026, 6, 12, hour), y: 20 + hour })),
    }]

    const rowsOf = (dataTable: string) => factory({ series: hourly, dataTable, locale: 'en-US' })
      .find('[data-gr-chart-table]')
      .findAll('tbody th')
      .map(node => node.text())

    const visible = rowsOf('visible')
    const hidden = rowsOf('hidden')

    expect(visible[0]).toMatch(/Jul/)
    expect(visible.slice(1).some(row => row.includes('Jul'))).toBe(false)
    expect(hidden.every(row => row.includes('Jul'))).toBe(true)
  })

  it('категориальной оси сокращать нечего: подписи остаются как есть', () => {
    const rows = factory({
      series: [{ id: 'a', x: ['Q1', 'Q2', 'Q3'], y: [1, 2, 3] }],
      dataTable: 'visible',
    }).find('[data-gr-chart-table]').findAll('tbody th').map(node => node.text())

    expect(rows).toEqual(['Q1', 'Q2', 'Q3'])
  })

  it('dataTable=off убирает таблицу целиком', () => {
    expect(factory({ dataTable: 'off' }).find('[data-gr-chart-table]').exists()).toBe(false)
  })

  it('неинтерактивный режим отдаёт картинку с именем, а не приложение', () => {
    const wrapper = factory({ interactive: false, ariaLabel: 'Выручка за неделю' })
    const svg = wrapper.find('svg')

    expect(wrapper.find('[data-gr-chart-surface]').exists()).toBe(false)
    expect(svg.attributes('role')).toBe('img')
    expect(svg.attributes('aria-label')).toBe('Выручка за неделю')
    expect(svg.attributes('aria-hidden')).toBeUndefined()
  })

  it('в интерактивном режиме рисунок скрыт от скринридера, а смысл несёт оверлей', () => {
    const wrapper = factory()

    expect(wrapper.find('svg').attributes('aria-hidden')).toBe('true')
    expect(wrapper.find('[data-gr-chart-surface]').attributes('role')).toBe('application')
  })

  it('размер приезжает из GrConfigProvider и различает края шкалы', () => {
    // Гейт от **отрендеренного DOM**, а не от факта вызова композабла: проп
    // `size` с дефолтом `undefined` в `withDefaults` — единственный способ
    // отличить «пользователь передал» от «сработал дефолт», и ошибка здесь
    // тихая — конфиг просто перестаёт применяться (`docs/sizes.md`).
    const label = (size: string) => factory({}, { componentDefaults: { GrChartLine: { size } } })
      .find('[data-gr-chart-axis="y"] text')
      .classes()
      .find(name => name.includes('control-text'))

    expect(label('xs')).toContain('3xs')
    expect(label('lg')).toContain('md')
    expect(label('xs')).not.toBe(label('lg'))
  })

  it('кегль подписи и арифметика раскладки не расходятся', () => {
    // Класс рисует один кегль, а `chartLayout` резервирует место под число —
    // разойдись они, и на `lg` рама считала бы 14px, рисуя 12px.
    const gutters = (size: string) => {
      const wrapper = factory({}, { componentDefaults: { GrChartLine: { size } } })

      return Number(wrapper.find('[data-gr-chart-axis="y"] line').attributes('x1'))
    }

    expect(gutters('lg')).toBeGreaterThan(gutters('xs'))
  })

  it('высота холста берётся из пропа', () => {
    const wrapper = factory({ height: 120 })

    expect(wrapper.find('svg').attributes('height')).toBe('120')
  })
})

describe('GrChartLine: опоры', () => {
  const threshold = [{ axis: 'y' as const, value: 30, label: 'Порог' }]

  it('опора рисуется линией с подписью', () => {
    const wrapper = factory({ references: threshold })

    expect(wrapper.findAll('[data-gr-chart-reference]')).toHaveLength(1)
    expect(wrapper.find('[data-gr-chart-reference-label]').text()).toBe('Порог')
  })

  it('пара значений даёт полосу, одно — только линию', () => {
    const band = factory({ references: [{ axis: 'y', value: [20, 40] }] })
    const line = factory({ references: threshold })

    expect(band.findAll('[data-gr-chart-reference-band]')).toHaveLength(1)
    expect(line.findAll('[data-gr-chart-reference-band]')).toHaveLength(0)
  })

  it('опора не тратит индекс палитры и не попадает в легенду', () => {
    // Серия-константа делала ровно это: читатель искал в легенде порог, а
    // нашёл бы ряд, которого в данных нет.
    const withReference = factory({ references: threshold, showLegend: true })
    const without = factory({ showLegend: true })

    expect(withReference.findAll('[data-gr-chart-legend] li'))
      .toHaveLength(without.findAll('[data-gr-chart-legend] li').length)
    expect(withReference.find('[data-gr-chart-series="sales"]').attributes('stroke'))
      .toBe(without.find('[data-gr-chart-series="sales"]').attributes('stroke'))
  })

  /** Подписи делений форматированы (разделитель разрядов) — сравнивать надо числа. */
  function topTick(wrapper: ReturnType<typeof factory>): number {
    const values = wrapper.findAll('[data-gr-chart-axis="y"] text')
      .map(node => Number(node.text().replace(/[^\d.-]/gu, '')))

    return Math.max(...values)
  }

  it('домен по умолчанию опора не растягивает', () => {
    // Порог 1000 при данных до 50 схлопнул бы сами данные в линию у оси.
    expect(topTick(factory({ references: [{ axis: 'y', value: 1000 }] }))).toBeLessThan(100)
  })

  it('`includeReferencesInDomain` растягивает домен осознанно', () => {
    const wrapper = factory({ references: [{ axis: 'y', value: 1000 }], includeReferencesInDomain: true })

    expect(topTick(wrapper)).toBe(1000)
  })

  it('опора за пределами домена не рисуется, но остаётся в описании', () => {
    // «Порог не виден» и «порога нет» — разные утверждения.
    const wrapper = factory({ references: [{ axis: 'y', value: 1000, label: 'Критический' }] })

    expect(wrapper.findAll('[data-gr-chart-reference]')).toHaveLength(0)
    expect(wrapper.find('[data-gr-chart-surface]').attributes('aria-description')).toContain('Критический')
  })

  it('опора уходит в скрытую таблицу примечанием, а не строкой данных', () => {
    const wrapper = factory({ references: threshold })
    const table = wrapper.find('[data-gr-chart-table]')

    expect(table.find('tfoot th').text()).toBe('Порог: 30')
    expect(table.findAll('tbody tr')).toHaveLength(4)
  })

  it('описание графика не затирает собственное `ariaDescription`', () => {
    const wrapper = factory({ references: threshold, ariaDescription: 'Выручка по неделям' })

    expect(wrapper.find('[data-gr-chart-surface]').attributes('aria-description'))
      .toBe('Выручка по неделям. Порог: 30')
  })

  it('без опор описание остаётся прежним', () => {
    expect(factory({ ariaDescription: 'Выручка' }).find('[data-gr-chart-surface]').attributes('aria-description'))
      .toBe('Выручка')
    expect(factory().find('[data-gr-chart-surface]').attributes('aria-description')).toBeUndefined()
  })
})

describe('GrChartLine: вторая ось значений', () => {
  const mixed = [
    { id: 'mrr', label: 'MRR', x: [0, 1, 2], y: [40000, 41000, 42000], axis: 'right' as const },
    { id: 'active', label: 'Активные', x: [0, 1, 2], y: [120, 125, 130] },
  ]

  it('без `dualAxis` вторая ось не рисуется, а серия падает на левую', () => {
    const wrapper = factory({ series: mixed })

    expect(wrapper.findAll('[data-gr-chart-axis="y"]')).toHaveLength(1)
  })

  it('`dualAxis` добавляет вторую ось справа', () => {
    const wrapper = factory({ series: mixed, dualAxis: true })
    const axes = wrapper.findAll('[data-gr-chart-axis="y"]')

    expect(axes).toHaveLength(2)
    // Правая ось стоит на дальнем краю области построения.
    const [left, right] = axes.map(node => Number(node.find('line').attributes('x1')))
    expect(right).toBeGreaterThan(left!)
  })

  it('число делений у осей совпадает: иначе сетка двоится', () => {
    const wrapper = factory({ series: mixed, dualAxis: true })
    const counts = wrapper.findAll('[data-gr-chart-axis="y"]').map(node => node.findAll('text').length)

    expect(counts[0]).toBe(counts[1])
  })

  it('оси меряют своё: подписи правой уходят к десяткам тысяч', () => {
    const wrapper = factory({ series: mixed, dualAxis: true })
    const numbers = wrapper.findAll('[data-gr-chart-axis="y"] text')
      .map(node => Number(node.text().replace(/[^\d.-]/gu, '')))

    expect(Math.max(...numbers)).toBeGreaterThan(40000)
    expect(numbers.some(value => value > 0 && value < 200)).toBe(true)
  })

  it('линия правой серии не уезжает за край области', () => {
    // На левой шкале сорок тысяч ушли бы далеко выше потолка холста.
    const wrapper = factory({ series: mixed, dualAxis: true })
    const d = wrapper.find('[data-gr-chart-series="mrr"]').attributes('d')!
    const ys = [...d.matchAll(/[ML] [\d.-]+ ([\d.-]+)/g)].map(match => Number(match[1]))

    expect(Math.min(...ys)).toBeGreaterThanOrEqual(0)
    expect(Math.max(...ys)).toBeLessThanOrEqual(256)
  })

  it('колонка таблицы называет свою ось только при двух осях', () => {
    const dual = factory({ series: mixed, dualAxis: true, dataTable: 'visible' })
    const single = factory({ series: mixed, dataTable: 'visible' })

    expect(dual.findAll('[data-gr-chart-table] thead th').map(node => node.text()))
      .toEqual(['X', 'MRR (right axis)', 'Активные (left axis)'])
    expect(single.findAll('[data-gr-chart-table] thead th').map(node => node.text()))
      .toEqual(['X', 'MRR', 'Активные'])
  })

  it('`valueFormatRight` форматирует только правую серию', () => {
    const wrapper = factory({
      series: mixed,
      dualAxis: true,
      dataTable: 'visible',
      valueFormatRight: { precision: 1 },
    })
    const cells = wrapper.findAll('[data-gr-chart-table] tbody tr')[0]!.findAll('td').map(node => node.text())

    expect(cells[0]).toContain('.0')
    expect(cells[1]).toBe('120')
  })

  it('раскладка резервирует место справа только при двух осях', () => {
    const gutter = (props: Record<string, unknown>) => Number(
      factory(props).find('[data-gr-chart-axis="x"] line').attributes('x2'),
    )

    expect(gutter({ series: mixed, dualAxis: true })).toBeLessThan(gutter({ series: mixed }))
  })
})
