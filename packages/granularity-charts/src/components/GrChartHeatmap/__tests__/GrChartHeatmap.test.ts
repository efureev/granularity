import { announced, granularityGlobal, keydown, mockRect } from '@feugene/granularity/testing'
import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import { nextTick } from 'vue'

import GrChartHeatmap from '../GrChartHeatmap.vue'

const xLabels = ['M0', 'M1', 'M2', 'M3']
const yLabels = ['Январь', 'Февраль', 'Март']

/** Матрица когорт разрежена по построению: у свежей когорты будущих месяцев нет. */
const values = [
  [100, 62, 41, 28],
  [100, 58, 39],
  [100, 55],
]

function factory(props: Record<string, unknown> = {}, options: Record<string, unknown> = {}) {
  const wrapper = mount(GrChartHeatmap, {
    props: { values, xLabels, yLabels, ...props },
    global: granularityGlobal(options),
    attachTo: document.body,
  })

  const surface = wrapper.find('[data-gr-chart-surface]')

  if (surface.exists())
    mockRect(surface.element, { left: 0, top: 0, width: 640, height: 256 })

  return wrapper
}

function cell(wrapper: ReturnType<typeof factory>, y: number, x: number) {
  return wrapper.find(`[data-gr-chart-heatmap-cell="${y}-${x}"]`)
}

function surface(wrapper: ReturnType<typeof factory>) {
  return wrapper.find('[data-gr-chart-surface]')
}

describe('GrChartHeatmap', () => {
  it('рисует ячейку на каждое пересечение строки и колонки', () => {
    expect(factory().findAll('[data-gr-chart-heatmap-cell]')).toHaveLength(12)
  })

  it('отсутствующая ячейка не заливается: «ещё не наступило» — не «ноль»', () => {
    const wrapper = factory()

    expect(cell(wrapper, 2, 3).attributes('fill')).toContain('--gr-chart-heatmap-empty')
    expect(cell(wrapper, 2, 0).attributes('fill')).toContain('color-mix')
  })

  it('цвет — примесь роли темы, а не литерал из палитры', () => {
    // Пять литералов пришлось бы подбирать заново под тёмную тему.
    expect(cell(factory(), 0, 0).attributes('fill')).toContain('var(--gr-chart-1)')
  })

  it('подписи строк и колонок рисует сам компонент: обе оси категориальные', () => {
    const wrapper = factory()

    expect(wrapper.findAll('[data-gr-chart-heatmap-row-label]').map(node => node.text())).toEqual(yLabels)
    expect(wrapper.findAll('[data-gr-chart-heatmap-column-label]').map(node => node.text())).toEqual(xLabels)
    expect(wrapper.findAll('[data-gr-chart-axis]')).toHaveLength(0)
  })

  it('скрытая таблица — настоящая таблица с заголовками строк и колонок', () => {
    // Без неё визуальная теплокарта нечитаема вовсе, а не менее удобна.
    const wrapper = factory()
    const head = wrapper.findAll('[data-gr-chart-table] thead th').map(node => node.text())
    const row = wrapper.findAll('[data-gr-chart-table] tbody tr')[2]!

    expect(head).toEqual(['Row', ...xLabels])
    expect(row.find('th').attributes('scope')).toBe('row')
    expect(row.findAll('td').map(node => node.text())).toEqual(['100', '55', '—', '—'])
  })

  it('одинаковые подписи колонок не схлопываются в одну позицию', () => {
    // Категориальная ось дедуплицирует их по имени, и курсор поехал бы по чужим
    // ячейкам — поэтому внутрь рамы уходят индексы.
    const wrapper = factory({ xLabels: ['Q1', 'Q1'], values: [[1, 2]], yLabels: ['2025'] })

    expect(wrapper.findAll('[data-gr-chart-heatmap-cell]')).toHaveLength(2)
  })

  it('легенда — шкала с границами домена, а не список категорий', () => {
    const legend = factory().find('[data-gr-chart-heatmap-legend]')

    expect(legend.exists()).toBe(true)
    expect(legend.text()).toContain('28')
    expect(legend.text()).toContain('100')
  })

  it('`steps: 0` даёт непрерывную легенду, `steps: 5` — ступенчатую', () => {
    const swatches = (steps: number) => factory({ steps })
      .findAll('[data-gr-chart-heatmap-legend] rect').length

    expect(swatches(5)).toBe(5)
    expect(swatches(0)).toBeGreaterThan(5)
  })

  it('расходящаяся шкала берёт разные роли по сторонам от середины', () => {
    const wrapper = factory({
      values: [[-10, 10]],
      xLabels: ['А', 'Б'],
      yLabels: ['Дельта'],
      scale: 'diverging',
      midpoint: 0,
    })

    expect(cell(wrapper, 0, 0).attributes('fill')).toContain('--gr-danger')
    expect(cell(wrapper, 0, 1).attributes('fill')).toContain('--gr-chart-1')
  })
})

describe('GrChartHeatmap: клавиатура', () => {
  it('`←→` ведут по колонкам, `↑↓` — по строкам', async () => {
    const wrapper = factory()
    const element = surface(wrapper).element

    keydown(element, 'ArrowRight')
    await nextTick()
    await expect(announced()).resolves.toContain('Январь')
    await expect(announced()).resolves.toContain('M0')

    keydown(element, 'ArrowDown')
    await nextTick()
    await expect(announced()).resolves.toContain('Февраль')

    keydown(element, 'ArrowRight')
    await nextTick()
    await expect(announced()).resolves.toContain('M1')
  })

  it('переход по строкам не кольцуется: перескок с последней на первую дезориентирует', async () => {
    const wrapper = factory()
    const element = surface(wrapper).element

    keydown(element, 'ArrowRight')
    for (let step = 0; step < 5; step++)
      keydown(element, 'ArrowUp')

    await nextTick()

    await expect(announced()).resolves.toContain('Январь')
  })

  it('`PageUp` и `PageDown` уводят в край колонки, а не на десятую часть ряда', async () => {
    const wrapper = factory()
    const element = surface(wrapper).element

    keydown(element, 'ArrowRight')
    keydown(element, 'PageDown')
    await nextTick()
    await expect(announced()).resolves.toContain('Март')

    keydown(element, 'PageUp')
    await nextTick()
    await expect(announced()).resolves.toContain('Январь')
  })

  it('`Home` и `End` остаются краем строки', async () => {
    const wrapper = factory()
    const element = surface(wrapper).element

    keydown(element, 'End')
    await nextTick()
    await expect(announced()).resolves.toContain('M3')

    keydown(element, 'Home')
    await nextTick()
    await expect(announced()).resolves.toContain('M0')
  })

  it('активная ячейка получает обводку', async () => {
    const wrapper = factory()

    expect(wrapper.find('[data-gr-chart-heatmap-outline]').exists()).toBe(false)

    keydown(surface(wrapper).element, 'ArrowRight')
    await nextTick()

    expect(wrapper.find('[data-gr-chart-heatmap-outline]').exists()).toBe(true)
  })

  it('движение курсора отдаётся наружу обеими координатами', async () => {
    const wrapper = factory()
    const element = surface(wrapper).element

    keydown(element, 'ArrowRight')
    keydown(element, 'ArrowDown')
    await nextTick()

    expect(wrapper.emitted('update:activeCell')?.at(-1)).toEqual([{ x: 0, y: 1 }])
  })

  it('пустая матрица клавиатуры не имеет вовсе', () => {
    expect(surface(factory({ values: [], xLabels: [], yLabels: [] })).exists()).toBe(false)
  })
})

describe('потолок строк таблицы', () => {
  // Теплокарта строит модель таблицы сама и мимо сужения по `ChartData`
  // проходит — её страхует общий потолок на уровне готовой модели.
  const big = {
    values: Array.from({ length: 800 }, (_, row) => Array.from({ length: 3 }, (_, col) => row + col)),
    xLabels: ['A', 'B', 'C'],
    yLabels: Array.from({ length: 800 }, (_, row) => `R${row}`),
  }

  it('усекает длинную матрицу и говорит об этом', () => {
    const wrapper = factory({ ...big, dataTable: 'visible' })
    const rows = wrapper.findAll('[data-gr-chart-table] tbody tr').length

    expect(rows).toBeGreaterThan(0)
    expect(rows).toBeLessThanOrEqual(500)
    expect(wrapper.find('[data-gr-chart-table] tfoot th').text()).toContain('800')
  })

  it('`Infinity` снимает потолок — решает приложение', () => {
    const wrapper = factory({ ...big, dataTable: 'visible', dataTableMaxRows: Number.POSITIVE_INFINITY })

    expect(wrapper.findAll('[data-gr-chart-table] tbody tr')).toHaveLength(800)
    expect(wrapper.find('[data-gr-chart-table] tfoot').exists()).toBe(false)
  })

  it('короткая матрица потолком не трогается', () => {
    const wrapper = factory({ values: [[1, 2], [3, 4]], xLabels: ['A', 'B'], yLabels: ['R0', 'R1'], dataTable: 'visible' })

    expect(wrapper.findAll('[data-gr-chart-table] tbody tr')).toHaveLength(2)
  })
})
