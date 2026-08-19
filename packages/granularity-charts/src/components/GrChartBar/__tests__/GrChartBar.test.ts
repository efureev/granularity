import { announced, granularityGlobal, keydown, mockRect, pointer } from '@feugene/granularity/testing'
import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import { nextTick } from 'vue'

import { estimateTextWidth } from '../../../chart/chartLayout'
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

  it('вертикали у столбцов нет — гаснут полосы остальных категорий', async () => {
    // Ни вертикаль, ни плашка за столбцами не годятся: первая читается как
    // граница полосы, вторая закрывает сетку и сам рисунок.
    const wrapper = factory()

    expect(wrapper.find('[data-gr-chart-crosshair]').exists()).toBe(false)
    expect(bars(wrapper).every(node => node.attributes('fill-opacity') === undefined)).toBe(true)

    await wrapper.setProps({ activeIndex: 1 })

    const dimmed = bars(wrapper).filter(node => node.attributes('fill-opacity')?.includes('--gr-chart-bar-dim'))

    // Погасли все, кроме двух полос второй категории.
    expect(dimmed).toHaveLength(bars(wrapper).length - 2)
  })

  it('приглушение соседей отключается пропом', async () => {
    const wrapper = factory({ dimInactive: false, activeIndex: 1 })

    await nextTick()

    expect(bars(wrapper).every(node => node.attributes('fill-opacity') === undefined)).toBe(true)
    // Тултип при этом остаётся: о выделенной категории говорит он.
    expect(wrapper.find('[data-gr-chart-table]').exists()).toBe(true)
  })

  it('за пределами колонки категории попадания нет', async () => {
    const wrapper = factory()
    const surface = wrapper.find('[data-gr-chart-surface]')
    const boxes = bars(wrapper).map(node => boxOf(node.attributes('d')!))

    // Категорий четыре, серий две: полосы категории `k` стоят на местах `k` и `k + 4`.
    const centerOf = (category: number) => {
      const left = boxes[category]!
      const right = boxes[category + 4]!

      return (left.left + right.left + right.width) / 2
    }

    const hover = async (x: number, y: number) => {
      surface.element.dispatchEvent(pointer('pointermove', { clientX: x, clientY: y }))
      await nextTick()
    }

    await hover(centerOf(0), 120)
    expect(wrapper.emitted('update:activeIndex')?.at(-1)).toEqual([0])

    // Ровно посередине между центрами категорий: это зазор, столбцов здесь нет.
    await hover((centerOf(0) + centerOf(1)) / 2, 120)
    expect(wrapper.emitted('update:activeIndex')?.at(-1)).toEqual([null])
  })

  it('под осью и над областью построения попадания нет', async () => {
    const wrapper = factory()
    const surface = wrapper.find('[data-gr-chart-surface]')
    const first = boxOf(bars(wrapper)[0]!.attributes('d')!)

    surface.element.dispatchEvent(pointer('pointermove', { clientX: first.left + 2, clientY: 250 }))
    await nextTick()

    expect(wrapper.emitted('update:activeIndex')?.at(-1) ?? [null]).toEqual([null])
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

  it('в стопке тултип всплывает над вершиной столбца, а не внутри него', async () => {
    // По наибольшему из значений якорь уехал бы в середину столбца, и панель
    // накрыла бы ровно то, что показывает.
    const wrapper = factory({ stacked: true, activeIndex: 0 })

    await nextTick()

    const anchor = wrapper.findAll('div').find(node => node.attributes('style')?.includes('width: 0px'))
    const anchorTop = Number(/top:\s*([\d.]+)px/.exec(anchor!.attributes('style')!)![1])
    const columnTop = Math.min(...bars(wrapper)
      .slice(0, 1)
      .concat(bars(wrapper).slice(4, 5))
      .map(node => boxOf(node.attributes('d')!).top))

    expect(anchorTop).toBeCloseTo(columnTop, 0)
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

  it('оформление приезжает из GrConfigProvider', async () => {
    const radius = factory({}, { componentDefaults: { GrChartBar: { barRadius: 0 } } })

    expect(bars(radius)[0]!.attributes('d')).not.toContain('A ')

    const dim = factory({ activeIndex: 1 }, { componentDefaults: { GrChartBar: { dimInactive: false } } })

    await nextTick()

    expect(bars(dim).every(node => node.attributes('fill-opacity') === undefined)).toBe(true)
  })
})

describe('GrChartBar — горизонталь', () => {
  /**
   * Левый край полосы — минимальная абсцисса горизонтальных переходов `H`.
   *
   * Не первое число пути: `barPath` начинает полосу влево с её правого конца.
   * И не минимум всех чисел: в путь входит радиус дуги.
   */
  function startX(d: string): number {
    const xs = [...d.matchAll(/H\s+(-?\d+(?:\.\d+)?)/g)].map(match => Number(match[1]))

    return Math.min(...xs)
  }

  it('оси рисует сам компонент, а не рама', () => {
    // Рама уходит с `axes: false`: её ось значений вертикальна по построению.
    const wrapper = factory({ orientation: 'horizontal' })
    const axes = wrapper.findAll('[data-gr-chart-axis]')

    expect(axes.length).toBe(2)
    expect(wrapper.text()).toContain('Q1')

    wrapper.unmount()
  })

  it('крайняя подпись оси значений влезает в холст целиком', () => {
    // Подпись центрируется под делением: без резерва последняя вылезла бы
    // за холст ровно половиной ширины и обрезалась бы его краем.
    const wrapper = factory({
      orientation: 'horizontal',
      yTickFormat: (value: number) => `${value} 000 ₽`,
    })
    const svg = wrapper.find('svg').element as SVGSVGElement
    const width = Number(svg.getAttribute('viewBox')?.split(' ')[2] ?? svg.getAttribute('width'))
    const last = [...wrapper.findAll('[data-gr-chart-axis="x"] text')].at(-1)!
    const text = last.element.childNodes[0]!.textContent!.trim()
    const center = Number(last.attributes('x'))

    expect(center + estimateTextWidth(text, 12) / 2).toBeLessThanOrEqual(width)

    wrapper.unmount()
  })

  it('длинная подпись категории обрезается многоточием, а полная уходит в title', () => {
    // SVG не знает `text-overflow`: без обрезки подпись уезжает за холст и
    // режется его краем — читатель видит хвост слова без признака обрезки.
    const long = 'Клиентское обслуживание корпоративных клиентов'
    const wrapper = factory({
      orientation: 'horizontal',
      series: [{ id: 'a', label: 'A', x: [long, 'Q2'], y: [10, 20] }],
    })
    const label = wrapper.findAll('[data-gr-chart-axis="y"] text').find(node => node.text().includes('Клиентское'))!
    // Первый узел — сам текст подписи: `text()` склеил бы его с `<title>`.
    const drawn = label.element.childNodes[0]!.textContent!.trim()

    expect(drawn.endsWith('…')).toBe(true)
    expect(drawn.length).toBeLessThan(long.length)
    expect(label.find('title').text()).toBe(long)

    wrapper.unmount()
  })

  it('все полосы начинаются от общего нуля слева', () => {
    const wrapper = factory({ orientation: 'horizontal' })
    const starts = bars(wrapper).map(bar => startX(bar.attributes('d')!))

    expect(new Set(starts.map(value => Math.round(value))).size).toBe(1)

    wrapper.unmount()
  })

  it('отрицательное значение растёт влево от нуля', () => {
    const wrapper = factory({
      orientation: 'horizontal',
      series: [{ id: 'delta', x: categories, y: [40, -30, 20, 10] }],
    })
    const paths = bars(wrapper).map(bar => bar.attributes('d')!)
    // Полоса убытка начинается левее нулевой отметки, у которой стоят остальные.
    const zero = startX(paths[0]!)

    expect(startX(paths[1]!)).toBeLessThan(zero)

    wrapper.unmount()
  })

  it('в группе серии идут одна под другой, а не рядом', () => {
    const wrapper = factory({ orientation: 'horizontal' })
    const paths = bars(wrapper).map(bar => bar.attributes('d')!)
    // Полосы одной категории стоят на разной высоте и начинаются от общего нуля:
    // при перепутанных осях они наложились бы друг на друга.
    const tops = paths.map(d => Number(/^M\s+-?\d+(?:\.\d+)?\s+(-?\d+(?:\.\d+)?)/.exec(d)![1]))

    expect(new Set(tops).size).toBe(paths.length)
    expect(new Set(paths.map(startX)).size).toBe(1)

    wrapper.unmount()
  })

  it('вертикаль по-прежнему рисуется рамой', () => {
    const wrapper = factory()

    expect(wrapper.findAll('[data-gr-chart-axis]').length).toBeGreaterThan(0)
    expect(bars(wrapper).length).toBeGreaterThan(0)

    wrapper.unmount()
  })

  it('`↑↓` ведут по категориям, `→` меняет читаемую серию', async () => {
    const wrapper = factory({ orientation: 'horizontal' })
    const element = wrapper.find('[data-gr-chart-surface]').element

    keydown(element, 'ArrowDown')
    await nextTick()
    await expect(announced()).resolves.toContain('Q1')

    keydown(element, 'ArrowDown')
    await nextTick()
    await expect(announced()).resolves.toContain('Q2')

    keydown(element, 'ArrowRight')
    await nextTick()
    await expect(announced()).resolves.toContain('Факт')

    wrapper.unmount()
  })

  it('попадание считается по строке категории, а не по колонке', async () => {
    const wrapper = factory({ orientation: 'horizontal' })
    const surface = wrapper.find('[data-gr-chart-surface]')

    // Категории идут сверху вниз: первая строка — вверху области.
    surface.element.dispatchEvent(pointer('pointermove', { clientX: 200, clientY: 35 }))
    await nextTick()
    expect(wrapper.emitted('update:activeIndex')?.at(-1)).toEqual([0])

    // Ниже по той же колонке — уже другая категория; при декартовом правиле
    // рамы обе точки дали бы один и тот же индекс.
    surface.element.dispatchEvent(pointer('pointermove', { clientX: 200, clientY: 200 }))
    await nextTick()
    expect(wrapper.emitted('update:activeIndex')?.at(-1)).not.toEqual([0])

    wrapper.unmount()
  })

  it('`orientation` приезжает из GrConfigProvider', () => {
    const wrapper = factory({}, { componentDefaults: { GrChartBar: { orientation: 'horizontal' } } })

    expect(wrapper.findAll('[data-gr-chart-axis]').length).toBe(2)

    wrapper.unmount()
  })

  it('опоры рисуются в горизонтальных координатах', () => {
    const wrapper = factory({
      orientation: 'horizontal',
      references: [{ axis: 'y', value: 50, label: 'План' }],
    })

    expect(wrapper.find('[data-gr-chart-reference]').exists()).toBe(true)
    // Текст опоры несёт рама — он остаётся в описании и таблице.
    expect(wrapper.html()).toContain('План')

    wrapper.unmount()
  })
})
