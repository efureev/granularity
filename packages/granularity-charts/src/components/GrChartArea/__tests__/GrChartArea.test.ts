import { granularityGlobal, mockRect } from '@feugene/granularity/testing'
import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'

import GrChartArea from '../GrChartArea.vue'

const series = [
  { id: 'direct', label: 'Прямые', x: [0, 1, 2, 3], y: [10, 40, 20, 50] },
  { id: 'search', label: 'Поиск', x: [0, 1, 2, 3], y: [5, 8, 6, 9] },
]

function factory(props: Record<string, unknown> = {}, options: Record<string, unknown> = {}) {
  const wrapper = mount(GrChartArea, {
    props: { series, ...props },
    global: granularityGlobal(options),
    attachTo: document.body,
  })

  const surface = wrapper.find('[data-gr-chart-surface]')

  if (surface.exists())
    mockRect(surface.element, { left: 0, top: 0, width: 640, height: 256 })

  return wrapper
}

function fills(wrapper: ReturnType<typeof factory>) {
  return wrapper.findAll('[data-gr-chart-area-fill]')
}

describe('GrChartArea', () => {
  it('на серию приходится заливка и линия по её верхнему краю', () => {
    const wrapper = factory()

    expect(fills(wrapper)).toHaveLength(2)
    expect(wrapper.findAll('[data-gr-chart-series]')).toHaveLength(2)
    expect(fills(wrapper)[0]!.attributes('d')).toContain('Z')
  })

  it('пропуск рвёт заливку на две фигуры: одна закрасила бы и разрыв', () => {
    const wrapper = factory({ series: [{ id: 'a', x: [0, 1, 2, 3, 4], y: [1, 2, null, 4, 5] }] })

    expect(fills(wrapper)[0]!.attributes('d')!.match(/M /g)).toHaveLength(2)
  })

  it('наложение просвечивает градиентом, стек — плотной заливкой', () => {
    const overlay = factory()
    const stacked = factory({ stacked: true })

    expect(overlay.findAll('linearGradient')).toHaveLength(2)
    expect(fills(overlay)[0]!.attributes('fill')).toContain('url(#')

    expect(stacked.findAll('linearGradient')).toHaveLength(0)
    expect(fills(stacked)[0]!.attributes('fill')).toBe('var(--gr-chart-1)')
    expect(fills(stacked)[0]!.attributes('fill-opacity')).toContain('--gr-chart-area-stack-opacity')
  })

  it('заливка задаётся пропом сильнее, чем режимом стека', () => {
    const wrapper = factory({ stacked: true, fill: 'gradient' })

    expect(wrapper.findAll('linearGradient')).toHaveLength(2)
  })

  it('градиенты двух графиков на одной странице не делят имена', () => {
    // Именно в одном приложении: у каждого `mount` свой счётчик `useId`, и два
    // отдельных монтирования это столкновение как раз спрятали бы.
    const wrapper = mount({
      components: { GrChartArea },
      setup: () => ({ series }),
      template: '<div><GrChartArea :series="series" /><GrChartArea :series="series" /></div>',
    }, { global: granularityGlobal({}) })

    const ids = wrapper.findAll('linearGradient').map(node => node.attributes('id'))

    expect(ids).toHaveLength(4)
    expect(new Set(ids).size).toBe(4)
  })

  it('в стеке полоса замкнута одной фигурой, а не двумя лентами', () => {
    const wrapper = factory({ stacked: true })
    const d = fills(wrapper)[1]!.attributes('d')!

    expect(d.match(/M /g)).toHaveLength(1)
    expect(d.endsWith('Z')).toBe(true)
  })

  it('в стеке линия идёт по верху полосы, а не по своему значению', () => {
    const plain = factory().find('[data-gr-chart-series="search"]').attributes('d')
    const stacked = factory({ stacked: true }).find('[data-gr-chart-series="search"]').attributes('d')

    expect(stacked).not.toBe(plain)
  })

  it('ось стека дотягивается до суммы: верхняя серия не уходит за край', () => {
    const stacked = factory({ stacked: true })
    const labels = stacked.findAll('[data-gr-chart-axis="y"] text').map(node => node.text())

    // Сумма первой позиции — 59, и деление под неё обязано существовать.
    expect(Math.max(...labels.map(Number))).toBeGreaterThanOrEqual(59)
  })

  it('скрытая серия из стека выпадает, а не остаётся дыркой', () => {
    const wrapper = factory({ stacked: true, hiddenSeries: ['direct'] })

    expect(fills(wrapper)).toHaveLength(1)
  })

  it('таблица и тултип показывают своё значение серии, а не сумму стека', () => {
    const rows = factory({ stacked: true }).find('[data-gr-chart-table]').findAll('tbody tr')

    expect(rows[0]!.text()).toContain('10')
    expect(rows[0]!.text()).toContain('5')
    expect(rows[0]!.text()).not.toContain('15')
  })

  it('заливка отсчитывается от нуля, а не от низа холста', () => {
    // При отрицательных значениях площадь обязана уходить вниз от нуля, иначе
    // минус рисуется той же высотой, что и плюс.
    const positive = factory({ series: [{ id: 'a', y: [10, 20, 30] }], includeZero: true })
    const mixed = factory({ series: [{ id: 'a', y: [-10, 20, 30] }] })

    const baselineOf = (wrapper: ReturnType<typeof factory>) => {
      const d = wrapper.find('[data-gr-chart-area-fill]').attributes('d')!

      return Number(/L [\d.-]+ ([\d.-]+) L/.exec(d)![1])
    }

    expect(baselineOf(mixed)).toBeLessThan(baselineOf(positive))
  })

  it('легенда переключает серию через v-model:hiddenSeries', async () => {
    const wrapper = factory({ showLegend: true, hiddenSeries: [] })

    await wrapper.find('[data-gr-chart-legend-item="search"]').trigger('click')

    expect(wrapper.emitted('update:hiddenSeries')?.at(-1)).toEqual([['search']])
  })

  it('заливка красится своим цветом, линия — своим', () => {
    const wrapper = factory({
      series: [{ id: 'a', y: [1, 2, 3], color: 'var(--gr-danger)', fillColor: 'var(--gr-warning)' }],
      fill: 'solid',
    })

    expect(wrapper.find('[data-gr-chart-series="a"]').attributes('stroke')).toBe('var(--gr-danger)')
    expect(fills(wrapper)[0]!.attributes('fill')).toBe('var(--gr-warning)')
  })

  it('свой цвет заливки доезжает и до градиента', () => {
    const wrapper = factory({
      series: [{ id: 'a', y: [1, 2, 3], color: 'var(--gr-danger)', fillColor: 'var(--gr-warning)' }],
    })

    expect(wrapper.find('stop').attributes('stop-color')).toBe('var(--gr-warning)')
  })

  it('на стеке auto означает «без марок»: марка на стыке полос читается дыркой', () => {
    const auto = factory({ stacked: true })
    const forced = factory({ stacked: true, showPoints: 'always' })

    expect(auto.findAll('[data-gr-chart-area-body] path')).toHaveLength(4)
    expect(forced.findAll('[data-gr-chart-area-body] path').length).toBeGreaterThan(4)
  })

  it('марки не рисуются на плотном ряде', () => {
    const dense = { id: 'a', y: Array.from({ length: 400 }, (_, i) => i) }
    const wrapper = factory({ series: [dense] })

    expect(wrapper.findAll('[data-gr-chart-area-body] path')).toHaveLength(2)
  })

  it('пустые данные дают пустое состояние и не дают поверхности', () => {
    const wrapper = factory({ series: [] })

    expect(wrapper.find('[data-gr-chart-surface]').exists()).toBe(false)
    expect(wrapper.text()).toContain('No data')
  })

  it('неинтерактивный режим отдаёт картинку с именем, а не приложение', () => {
    const wrapper = factory({ interactive: false, ariaLabel: 'Трафик за неделю' })

    expect(wrapper.find('svg').attributes('role')).toBe('img')
    expect(wrapper.find('svg').attributes('aria-label')).toBe('Трафик за неделю')
  })

  it('оформление приезжает из GrConfigProvider', () => {
    const wrapper = factory({}, { componentDefaults: { GrChartArea: { fill: 'solid' } } })

    expect(wrapper.findAll('linearGradient')).toHaveLength(0)
  })
})
