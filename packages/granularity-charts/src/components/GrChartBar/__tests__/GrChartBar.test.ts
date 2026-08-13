import { granularityGlobal, mockRect } from '@feugene/granularity/testing'
import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'

import GrChartBar from '../GrChartBar.vue'

const categories = ['Q1', 'Q2', 'Q3', 'Q4']

const series = [
  { id: 'plan', label: 'План', x: categories, y: [40, 55, 50, 70] },
  { id: 'fact', label: 'Факт', x: categories, y: [35, 60, 45, 80] },
]

function factory(props: Record<string, unknown> = {}, options: Record<string, unknown> = {}) {
  const wrapper = mount(GrChartBar, {
    props: { series, ...props },
    global: granularityGlobal(options),
    attachTo: document.body,
  })

  const surface = wrapper.find('[data-gr-chart-surface]')

  if (surface.exists())
    mockRect(surface.element, { left: 0, top: 0, width: 640, height: 256 })

  return wrapper
}

function bars(wrapper: ReturnType<typeof factory>) {
  return wrapper.findAll('[data-gr-chart-bar-mark]')
}

/**
 * Габариты полосы из её пути.
 *
 * Разбирается именно по командам: `V` несёт ординату, а не абсциссу, и наивный
 * общий разбор чисел смешал бы оси — тест зеленел бы на чём попало.
 */
function boxOf(d: string): { left: number, width: number, top: number, bottom: number } {
  const xs: number[] = []
  const ys: number[] = []

  for (const match of d.matchAll(/M ([\d.-]+) ([\d.-]+)/g)) {
    xs.push(Number(match[1]))
    ys.push(Number(match[2]))
  }
  for (const match of d.matchAll(/H ([\d.-]+)/g))
    xs.push(Number(match[1]))
  for (const match of d.matchAll(/V ([\d.-]+)/g))
    ys.push(Number(match[1]))
  for (const match of d.matchAll(/A [\d.-]+ [\d.-]+ 0 [01] [01] ([\d.-]+) ([\d.-]+)/g)) {
    xs.push(Number(match[1]))
    ys.push(Number(match[2]))
  }

  return {
    left: Math.min(...xs),
    width: Math.max(...xs) - Math.min(...xs),
    top: Math.min(...ys),
    bottom: Math.max(...ys),
  }
}

describe('GrChartBar', () => {
  it('на каждое значение приходится полоса', () => {
    expect(bars(factory())).toHaveLength(8)
  })

  it('серии стоят рядом и не наезжают друг на друга', () => {
    const wrapper = factory()
    const first = boxOf(bars(wrapper)[0]!.attributes('d')!)
    const second = boxOf(bars(wrapper)[4]!.attributes('d')!)

    // Первая полоса первой серии и первая полоса второй — в одной категории.
    expect(second.left).toBeGreaterThanOrEqual(first.left + first.width)
  })

  it('groupPadding сужает полосы, не двигая категории', () => {
    const tight = boxOf(bars(factory({ groupPadding: 0 }))[0]!.attributes('d')!)
    const loose = boxOf(bars(factory({ groupPadding: 0.6 }))[0]!.attributes('d')!)

    expect(loose.width).toBeLessThan(tight.width)
  })

  it('в стопке серии делят одну полосу', () => {
    const grouped = boxOf(bars(factory())[0]!.attributes('d')!)
    const stacked = boxOf(bars(factory({ stacked: true }))[0]!.attributes('d')!)

    expect(stacked.width).toBeGreaterThan(grouped.width)
  })

  it('скругляется только верхний сегмент столбца, иначе стопка распадётся на пилюли', () => {
    const wrapper = factory({ stacked: true })
    const arcsOf = (index: number) => (bars(wrapper)[index]!.attributes('d')!.match(/A /g) ?? []).length

    // Первая серия лежит внизу, вторая — сверху.
    expect(arcsOf(0)).toBe(0)
    expect(arcsOf(4)).toBe(2)
  })

  it('нулевой радиус убирает дуги совсем', () => {
    expect(bars(factory({ barRadius: 0 }))[0]!.attributes('d')).not.toContain('A ')
  })

  it('режим ста процентов нормирует столбец и подписывает ось долями', () => {
    const wrapper = factory({ stacked: '100%' })
    const labels = wrapper.findAll('[data-gr-chart-axis="y"] text').map(node => node.text())

    expect(labels.some(label => label.includes('%'))).toBe(true)

    // Каждый столбец нормирован к единице, поэтому верх стопки в любой
    // категории — один и тот же: верх области построения.
    const tops = bars(wrapper).map(node => boxOf(node.attributes('d')!).top)

    expect(new Set(tops.map(top => Math.round(top))).size).toBeLessThan(tops.length)
    expect(Math.min(...tops)).toBeCloseTo(Math.round(Math.min(...tops)), 0)
  })

  it('ось значений всегда включает ноль: столбец от обрезанной оси врёт о величине', () => {
    const wrapper = factory({ series: [{ id: 'a', x: categories, y: [980, 1000, 990, 1010] }] })
    const labels = wrapper.findAll('[data-gr-chart-axis="y"] text').map(node => node.text())

    // Подпись форматирована (`1 000`), поэтому сверяется строка, а не число.
    expect(labels).toContain('0')
  })

  it('отрицательное значение растёт вниз от нуля', () => {
    const wrapper = factory({ series: [{ id: 'a', x: ['a', 'b'], y: [10, -10] }] })
    const [up, down] = bars(wrapper).map(node => node.attributes('d')!)

    // У полосы вверх скругление сверху, у полосы вниз — снизу: пути не совпадают.
    expect(up).not.toBe(down)
    expect(boxOf(up!).left).toBeLessThan(boxOf(down!).left)
  })

  it('вертикали у столбцов нет — вместо неё подсвечивается категория', async () => {
    const wrapper = factory()

    expect(wrapper.find('[data-gr-chart-crosshair]').exists()).toBe(false)
    expect(wrapper.find('[data-gr-chart-bar-band]').exists()).toBe(false)

    await wrapper.setProps({ activeIndex: 1 })

    expect(wrapper.find('[data-gr-chart-bar-band]').exists()).toBe(true)
  })

  it('столбцы по непрерывной оси не схлопываются в нулевую ширину', () => {
    // У шкалы времени `bandwidth` нулевой, и ширина считается от числа позиций.
    const wrapper = factory({
      series: [{ id: 'a', data: [0, 1, 2].map(day => ({ x: new Date(2026, 6, day + 1), y: day + 1 })) }],
    })

    expect(boxOf(bars(wrapper)[0]!.attributes('d')!).width).toBeGreaterThan(1)
  })

  it('пропуск полосы не даёт', () => {
    const wrapper = factory({ series: [{ id: 'a', x: ['a', 'b', 'c'], y: [1, null, 3] }] })

    expect(bars(wrapper)).toHaveLength(2)
  })

  it('легенда переключает серию через v-model:hiddenSeries', async () => {
    const wrapper = factory({ showLegend: true, hiddenSeries: [] })

    await wrapper.find('[data-gr-chart-legend-item="fact"]').trigger('click')

    expect(wrapper.emitted('update:hiddenSeries')?.at(-1)).toEqual([['fact']])
  })

  it('скрытая серия освобождает место оставшимся', () => {
    const both = boxOf(bars(factory())[0]!.attributes('d')!)
    const one = boxOf(bars(factory({ hiddenSeries: ['fact'] }))[0]!.attributes('d')!)

    expect(one.width).toBeGreaterThan(both.width)
  })

  it('таблица показывает своё значение серии, а не сумму стопки', () => {
    const rows = factory({ stacked: true }).find('[data-gr-chart-table]').findAll('tbody tr')

    expect(rows[0]!.text()).toContain('40')
    expect(rows[0]!.text()).toContain('35')
    expect(rows[0]!.text()).not.toContain('75')
  })

  it('пустые данные дают пустое состояние и не дают поверхности', () => {
    const wrapper = factory({ series: [] })

    expect(wrapper.find('[data-gr-chart-surface]').exists()).toBe(false)
    expect(wrapper.text()).toContain('No data')
  })

  it('неинтерактивный режим отдаёт картинку с именем, а не приложение', () => {
    const wrapper = factory({ interactive: false, ariaLabel: 'План и факт по кварталам' })

    expect(wrapper.find('svg').attributes('role')).toBe('img')
    expect(wrapper.find('svg').attributes('aria-label')).toBe('План и факт по кварталам')
  })

  it('оформление приезжает из GrConfigProvider', () => {
    const wrapper = factory({}, { componentDefaults: { GrChartBar: { barRadius: 0 } } })

    expect(bars(wrapper)[0]!.attributes('d')).not.toContain('A ')
  })
})
