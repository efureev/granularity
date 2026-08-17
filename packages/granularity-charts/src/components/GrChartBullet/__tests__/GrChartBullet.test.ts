import { announced, granularityGlobal, keydown, mockRect } from '@feugene/granularity/testing'
import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import { nextTick } from 'vue'

import GrChartBullet from '../GrChartBullet.vue'

function factory(props: Record<string, unknown> = {}, options: Record<string, unknown> = {}) {
  const wrapper = mount(GrChartBullet, {
    props: { value: 0.031, target: 0.04, ranges: [0.03, 0.035], max: 0.05, label: 'Себестоимость', ...props },
    global: granularityGlobal(options),
    attachTo: document.body,
  })

  const surface = wrapper.find('[data-gr-chart-surface]')

  if (surface.exists())
    mockRect(surface.element, { left: 0, top: 0, width: 640, height: 48 })

  return wrapper
}

function surface(wrapper: ReturnType<typeof factory>) {
  return wrapper.find('[data-gr-chart-surface]')
}

describe('GrChartBullet', () => {
  it('рисует дорожку, полосы диапазонов, значение и цель', () => {
    const wrapper = factory()

    expect(wrapper.find('[data-gr-chart-bullet-track]').exists()).toBe(true)
    expect(wrapper.findAll('[data-gr-chart-bullet-band]')).toHaveLength(3)
    expect(wrapper.find('[data-gr-chart-bullet-value]').exists()).toBe(true)
    expect(wrapper.find('[data-gr-chart-bullet-target]').exists()).toBe(true)
  })

  it('толщина полосы значения идёт токеном, а не числом', () => {
    // Полоса рисуется `<line>` именно ради этого: `stroke-width` принимает
    // CSS-переменную, и тема настраивает вес, не трогая геометрию дорожки.
    expect(factory().find('[data-gr-chart-bullet-value]').attributes('stroke-width'))
      .toContain('--gr-chart-bullet-value-width')
  })

  it('роль оверлея — `meter`, с величиной, границами и человеческой формулировкой', () => {
    const attributes = surface(factory()).attributes()

    expect(attributes.role).toBe('meter')
    expect(attributes['aria-valuenow']).toBe('0.031')
    expect(attributes['aria-valuemin']).toBe('0')
    expect(attributes['aria-valuemax']).toBe('0.05')
    expect(attributes['aria-valuetext']).toContain('0.031')
    expect(attributes['aria-valuetext']).toContain('0.04')
  })

  it('`value: null` снимает роль `meter`: без `aria-valuenow` она невалидна', () => {
    const attributes = surface(factory({ value: null })).attributes()

    expect(attributes.role).toBe('application')
    expect(attributes['aria-valuenow']).toBeUndefined()
  })

  it('`value: null` не рисует полосу значения, но оставляет цель', () => {
    // Нет managed-списаний — нет себестоимости; это не «себестоимость ноль».
    const wrapper = factory({ value: null })

    expect(wrapper.find('[data-gr-chart-bullet-value]').exists()).toBe(false)
    expect(wrapper.find('[data-gr-chart-bullet-target]').exists()).toBe(true)
  })

  it('`value: null` даёт в таблице прочерк, а не ноль', () => {
    const cells = factory({ value: null }).findAll('[data-gr-chart-table] tbody td').map(node => node.text())

    expect(cells[0]).toBe('no value')
  })

  it('значение за верхом шкалы получает маркер переполнения', () => {
    const wrapper = factory({ value: 0.2, max: 0.05 })

    expect(wrapper.find('[data-gr-chart-bullet-overflow]').exists()).toBe(true)
  })

  it('в таблице стоит настоящая величина, а не обрезанная по шкале', () => {
    const cells = factory({ value: 0.2, max: 0.05 }).findAll('[data-gr-chart-table] tbody td').map(node => node.text())

    expect(cells[0]).toBe('0.2')
  })

  it('переполнение объявляется словами', () => {
    expect(surface(factory({ value: 0.2, max: 0.05 })).attributes('aria-description'))
      .toContain('outside the scale')
  })

  it('диапазоны объявляются: цветные зоны иначе существуют только для зрячих', () => {
    const description = surface(factory()).attributes('aria-description')

    expect(description).toContain('Ranges')
    expect(factory({ ranges: undefined }).find('[data-gr-chart-surface]').attributes('aria-description'))
      .toBeUndefined()
  })

  it('диапазоны уходят в таблицу примечанием', () => {
    expect(factory().find('[data-gr-chart-table] tfoot th').text()).toContain('Ranges')
  })

  it('`rangeColors` красит полосы по порядку от «хорошо» к «плохо»', () => {
    const wrapper = factory({ rangeColors: ['var(--gr-success)', 'var(--gr-warning)', 'var(--gr-danger)'] })

    expect(wrapper.findAll('[data-gr-chart-bullet-band]').map(node => node.attributes('fill')))
      .toEqual(['var(--gr-success)', 'var(--gr-warning)', 'var(--gr-danger)'])
  })

  it('граница за краем шкалы не сдвигает цвета соседних полос', () => {
    // Она зажимается в ноль ширины и выпадает из рисунка, но индекс держит.
    const wrapper = factory({
      ranges: [0.03, 99],
      rangeColors: ['var(--gr-success)', 'var(--gr-warning)', 'var(--gr-danger)'],
    })

    expect(wrapper.findAll('[data-gr-chart-bullet-band]').map(node => node.attributes('fill')))
      .toEqual(['var(--gr-success)', 'var(--gr-warning)'])
  })

  it('цель за пределами шкалы засечки не даёт', () => {
    expect(factory({ target: 99 }).find('[data-gr-chart-bullet-target]').exists()).toBe(false)
  })

  it('клавиатура объявляет ту же формулировку, что и `aria-valuetext`', async () => {
    const wrapper = factory()

    keydown(surface(wrapper).element, 'ArrowRight')
    await nextTick()

    await expect(announced()).resolves.toBe(surface(wrapper).attributes('aria-valuetext'))
  })

  it('ни величины, ни цели, ни диапазонов — пустое состояние', () => {
    const wrapper = factory({ value: null, target: undefined, ranges: undefined })

    expect(surface(wrapper).exists()).toBe(false)
  })

  it('вертикальная раскладка меняет направление полосы', () => {
    const horizontal = factory().find('[data-gr-chart-bullet-value]').attributes()
    const vertical = factory({ orientation: 'vertical' }).find('[data-gr-chart-bullet-value]').attributes()

    expect(horizontal.y1).toBe(horizontal.y2)
    expect(vertical.x1).toBe(vertical.x2)
  })

  it('`interactive: false` убирает оверлей и оставляет картинку с именем', () => {
    const wrapper = factory({ interactive: false })

    expect(surface(wrapper).exists()).toBe(false)
    expect(wrapper.find('svg').attributes('role')).toBe('img')
  })
})
