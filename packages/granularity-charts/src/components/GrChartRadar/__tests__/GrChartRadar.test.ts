import { announced, granularityGlobal, i18nAdapter, keydown, mockRect, pointer } from '@feugene/granularity/testing'
import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import { nextTick } from 'vue'

import GrChartRadar from '../GrChartRadar.vue'

const axes = ['Скорость', 'Цена', 'Поддержка', 'Надёжность']

const series = [
  { id: 'us', label: 'Мы', x: axes, y: [8, 6, 9, 7] },
  { id: 'them', label: 'Они', x: axes, y: [6, 9, 5, 8] },
]

/**
 * Раскладка при `axes: false`: отступы 4/8/8/4 от объявленных 640×280, то есть
 * центр в (318, 142). Радиус зависит от гуттера под имена осей, поэтому в
 * тестах он берётся из самой разметки, а не считается заново.
 */
const CENTER = { x: 318, y: 142 }

function factory(props: Record<string, unknown> = {}, options: Record<string, unknown> = {}) {
  const wrapper = mount(GrChartRadar, {
    props: { series, ...props },
    global: granularityGlobal(options),
    attachTo: document.body,
  })

  const surface = wrapper.find('[data-gr-chart-surface]')

  if (surface.exists())
    mockRect(surface.element, { left: 0, top: 0, width: 640, height: 280 })

  return wrapper
}

function outlines(wrapper: ReturnType<typeof factory>) {
  return wrapper.findAll('[data-gr-chart-radar-outline]')
}

function areas(wrapper: ReturnType<typeof factory>) {
  return wrapper.findAll('[data-gr-chart-radar-area]')
}

function spokes(wrapper: ReturnType<typeof factory>) {
  return wrapper.findAll('[data-gr-chart-radar-axis]')
}

/** Радиус внешнего кольца — по самой дальней вершине спицы. */
function outerRadius(wrapper: ReturnType<typeof factory>): number {
  const spoke = spokes(wrapper)[0]!

  return Math.hypot(
    Number(spoke.attributes('x2')) - CENTER.x,
    Number(spoke.attributes('y2')) - CENTER.y,
  )
}

async function hover(wrapper: ReturnType<typeof factory>, x: number, y: number): Promise<void> {
  wrapper.find('[data-gr-chart-surface]').element.dispatchEvent(pointer('pointermove', { clientX: x, clientY: y }))

  await nextTick()
}

describe('GrChartRadar', () => {
  it('на каждую ось приходится спица, на каждую серию — контур', () => {
    const wrapper = factory()

    expect(spokes(wrapper)).toHaveLength(4)
    expect(outlines(wrapper)).toHaveLength(2)
    expect(outlines(wrapper)[0]!.attributes('d')).toContain('Z')
  })

  it('первая ось смотрит вверх, стартовый угол её поворачивает', () => {
    const up = spokes(factory())[0]!

    expect(Number(up.attributes('x2'))).toBeCloseTo(CENTER.x, 0)
    expect(Number(up.attributes('y2'))).toBeLessThan(CENTER.y)

    const turned = spokes(factory({ startAngle: 90 }))[0]!

    expect(Number(turned.attributes('x2'))).toBeGreaterThan(CENTER.x)
  })

  it('кольца рисуются многоугольником, а по пропу — окружностями', () => {
    // Число колец следует лестнице «красивых» чисел, а не пропу дословно:
    // кольцо обязано стоять на круглом значении. Поэтому сверяются наборы
    // между собой, а не с ожидаемым числом.
    const polygons = factory().findAll('path[data-gr-chart-radar-ring]')
    const circles = factory({ shape: 'circle' }).findAll('circle[data-gr-chart-radar-ring]')

    expect(factory().findAll('circle')).toHaveLength(0)
    expect(circles.length).toBeGreaterThan(0)
    expect(circles).toHaveLength(polygons.length)
  })

  it('при нормировке на ось колец ровно столько, сколько запрошено', () => {
    // Круглых значений там нет, лестнице следовать нечему.
    expect(factory({ axisScale: 'per-axis', shape: 'circle', rings: 3 }).findAll('[data-gr-chart-radar-ring]')).toHaveLength(3)
  })

  it('заливка отключается пропом', () => {
    expect(areas(factory())[0]!.attributes('d')).toContain('Z')
    expect(areas(factory({ fill: false }))[0]!.attributes('d')).toBe('')
  })

  it('пропуск рвёт контур и отменяет заливку этой серии', () => {
    // Замкнуть контур через пропуск значит нарисовать ребро, которого нет;
    // залить рваный контур — площадь, которой нет.
    const wrapper = factory({ series: [{ id: 'a', x: axes, y: [8, null, 9, 7] }] })

    expect(outlines(wrapper)[0]!.attributes('d')).not.toContain('Z')
    expect(areas(wrapper)[0]!.attributes('d')).toBe('')
  })

  /**
   * Ради этого и заведён `alignSeriesToAxes`. Без него позиции считаются по
   * видимым сериям, и паутина проворачивается, потеряв ориентиры.
   */
  it('скрытие серии не уносит ось, которую знала только она', () => {
    const uneven = [
      { id: 'a', x: ['А', 'Б'], y: [1, 2] },
      { id: 'b', x: ['А', 'Б', 'В'], y: [3, 4, 5] },
    ]

    expect(spokes(factory({ series: uneven }))).toHaveLength(3)
    expect(spokes(factory({ series: uneven, hiddenSeries: ['b'] }))).toHaveLength(3)
  })

  it('общая шкала подписывает кольца значениями', () => {
    const labels = factory().findAll('[data-gr-chart-radar-body] text').map(node => node.text()).filter(Boolean)

    expect(labels.some(label => /^\d/.test(label))).toBe(true)
  })

  it('нормировка на ось убирает подписи колец и уносит максимум в имя оси', () => {
    // Единственного верного числа для кольца там не существует: у каждой оси
    // свой максимум.
    const wrapper = factory({ axisScale: 'per-axis' })
    const axisLabels = wrapper.findAll('[data-gr-chart-radar-label]').map(node => node.text())

    expect(axisLabels[0]).toContain('Скорость')
    expect(axisLabels[0]).toContain('8')

    const ringLabels = wrapper.findAll('[data-gr-chart-radar-body] text')
      .filter(node => !node.attributes('data-gr-chart-radar-label'))
      .map(node => node.text())

    expect(ringLabels.every(label => label === '')).toBe(true)
  })

  it('проп максимума оси сильнее данных', () => {
    const wrapper = factory({ axisScale: 'per-axis', axisMax: { Скорость: 10 } })

    expect(wrapper.findAll('[data-gr-chart-radar-label]')[0]!.text()).toContain('10')
  })

  it('при нормировке на ось лучший результат ложится на внешнее кольцо', () => {
    const wrapper = factory({ axisScale: 'per-axis', series: [{ id: 'a', x: axes, y: [8, 6, 9, 7] }] })
    const d = outlines(wrapper)[0]!.attributes('d')!
    const reach = [...d.matchAll(/[ML] ([\d.-]+) ([\d.-]+)/g)]
      .map(match => Math.hypot(Number(match[1]) - CENTER.x, Number(match[2]) - CENTER.y))

    expect(Math.max(...reach)).toBeCloseTo(outerRadius(wrapper), 0)
  })

  it('значение остаётся исходным: доля живёт только в геометрии', () => {
    // Протеки нормировка в данные — таблица и скринридер начали бы показывать
    // проценты вместо величин.
    const rows = factory({ axisScale: 'per-axis' })
      .find('[data-gr-chart-table]')
      .findAll('tbody tr')

    expect(rows[0]!.text()).toContain('8')
    expect(rows[0]!.text()).toContain('6')
  })

  it('при нормировке на ось таблица несёт ещё и максимум оси', () => {
    // Без него форма фигуры из таблицы не восстанавливается.
    const table = factory({ axisScale: 'per-axis' }).find('[data-gr-chart-table]')

    expect(table.findAll('thead th')).toHaveLength(4)
    expect(table.findAll('thead th').at(-1)!.text()).toBe('Axis maximum')
  })

  it('в общей шкале таблица остаётся дефолтом рамы', () => {
    expect(factory().find('[data-gr-chart-table]').findAll('thead th')).toHaveLength(3)
  })

  it('попадание угловое: ближайшая спица', async () => {
    const wrapper = factory()
    const radius = outerRadius(wrapper)

    await hover(wrapper, CENTER.x, CENTER.y - radius / 2)
    expect(wrapper.emitted('update:activeIndex')?.at(-1)).toEqual([0])

    await hover(wrapper, CENTER.x + radius / 2, CENTER.y)
    expect(wrapper.emitted('update:activeIndex')?.at(-1)).toEqual([1])
  })

  it('снаружи кольца и в мёртвой зоне центра попадания нет', async () => {
    const wrapper = factory()

    await hover(wrapper, CENTER.x, CENTER.y - outerRadius(wrapper) - 60)
    expect(wrapper.emitted('update:activeIndex')?.at(-1) ?? [null]).toEqual([null])

    await hover(wrapper, CENTER.x + 1, CENTER.y + 1)
    expect(wrapper.emitted('update:activeIndex')?.at(-1) ?? [null]).toEqual([null])
  })

  it('вертикали нет — выделяется сама спица и имя оси', async () => {
    const wrapper = factory()

    expect(wrapper.find('[data-gr-chart-crosshair]').exists()).toBe(false)

    await wrapper.setProps({ activeIndex: 2 })
    await nextTick()

    expect(spokes(wrapper)[2]!.attributes('stroke')).toContain('--gr-chart-frame-crosshair')
    expect(spokes(wrapper)[0]!.attributes('stroke')).toContain('--gr-chart-frame-grid')
    expect(wrapper.findAll('[data-gr-chart-radar-label]')[2]!.attributes('fill'))
      .toContain('--gr-chart-radar-axis-active')
  })

  it('стрелки ходят по осям и объявляют ось с рядом', async () => {
    const wrapper = factory({}, { i18n: i18nAdapter({}) })

    keydown(wrapper.find('[data-gr-chart-surface]').element, 'ArrowRight')
    await nextTick()

    expect(wrapper.emitted('update:activeIndex')?.at(-1)).toEqual([0])

    const message = await announced()

    expect(message).toContain('Скорость')
    expect(message).toContain('Мы')
  })

  it('при нормировке на ось объявление несёт предел оси', async () => {
    // «NPS 62» без «из 100» — это другая диаграмма, чем видит зрячий сосед.
    const wrapper = factory({ axisScale: 'per-axis' }, { i18n: i18nAdapter({}) })

    keydown(wrapper.find('[data-gr-chart-surface]').element, 'ArrowRight')
    await nextTick()

    expect(await announced()).toMatch(/8 of 8/)
  })

  it('у радара ровно одна остановка Tab', () => {
    expect(factory().findAll('[tabindex="0"]')).toHaveLength(1)
  })

  it('легенда переключает серию через v-model:hiddenSeries', async () => {
    const wrapper = factory({ showLegend: true, hiddenSeries: [] })

    await wrapper.find('[data-gr-chart-legend-item="them"]').trigger('click')

    expect(wrapper.emitted('update:hiddenSeries')?.at(-1)).toEqual([['them']])
  })

  it('две оси и одна ось рисуются, а не прячутся', () => {
    // Молча не рисовать переданные данные пакет не делает нигде.
    expect(spokes(factory({ series: [{ id: 'a', x: ['А', 'Б'], y: [1, 2] }] }))).toHaveLength(2)
    expect(spokes(factory({ series: [{ id: 'a', x: ['А'], y: [1] }] }))).toHaveLength(1)
  })

  it('ряд из нулей — это картинка, а не пустое состояние', () => {
    const wrapper = factory({ series: [{ id: 'a', x: axes, y: [0, 0, 0, 0] }] })

    expect(wrapper.find('[data-gr-chart-surface]').exists()).toBe(true)
    expect(wrapper.text()).not.toContain('No data')
  })

  it('пустые данные дают пустое состояние', () => {
    expect(factory({ series: [] }).text()).toContain('No data')
  })

  it('неинтерактивный режим отдаёт картинку с именем', () => {
    const wrapper = factory({ interactive: false, ariaLabel: 'Профиль продукта' })

    expect(wrapper.find('svg').attributes('role')).toBe('img')
    expect(wrapper.find('svg').attributes('aria-label')).toBe('Профиль продукта')
  })

  it('оформление приезжает из GrConfigProvider', () => {
    const wrapper = factory({}, { componentDefaults: { GrChartRadar: { shape: 'circle', fill: false } } })

    expect(wrapper.findAll('circle').length).toBeGreaterThan(0)
    expect(areas(wrapper)[0]!.attributes('d')).toBe('')
  })
})
