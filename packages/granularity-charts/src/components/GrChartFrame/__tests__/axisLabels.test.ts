import { granularityGlobal } from '@feugene/granularity/testing'
import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'

import { estimateTextWidth } from '../../../chart/chartLayout'
import GrChartLine from '../../GrChartLine/GrChartLine.vue'

/**
 * Подписи оси X не налезают друг на друга ни на какой шкале.
 *
 * Число делений выбирает шкала — по `xTickCount` или по числу категорий, — и
 * ширина подписей в этот выбор не входила: на карточке в 250px двадцать пять
 * получасов сливались в «00:0030:0001:00…», месяцы — в «Jan 2026Apr 2026…».
 */
const WIDTH = 250

function axisLabels(x: readonly (string | Date)[], props: Record<string, unknown> = {}) {
  const wrapper = mount(GrChartLine, {
    props: { width: WIDTH, locale: 'en', series: [{ id: 'a', label: 'A', x, y: x.map((_, index) => index % 7) }], ...props },
    global: granularityGlobal(),
    attachTo: document.body,
  })
  const labels = wrapper.findAll('[data-gr-chart-axis="x"] text').map((node) => {
    const text = node.element.childNodes[0]!.textContent!.trim()
    const center = Number(node.attributes('x'))
    const half = estimateTextWidth(text, 12) / 2

    return { text, left: center - half, right: center + half }
  })

  wrapper.unmount()

  return labels
}

function expectNoOverlap(labels: ReturnType<typeof axisLabels>): void {
  expect(labels.length).toBeGreaterThanOrEqual(2)
  labels.forEach((label, index) => {
    if (index > 0)
      expect(label.left, `${labels[index - 1]!.text} / ${label.text}`).toBeGreaterThanOrEqual(labels[index - 1]!.right)
  })
}

describe('рама графика: подписи оси X без наложения', () => {
  it('двадцать пять получасов категориями', () => {
    const halfHours = Array.from({ length: 25 }, (_, index) => `${String(Math.floor(index / 2)).padStart(2, '0')}:${index % 2 === 0 ? '00' : '30'}`)
    const labels = axisLabels(halfHours)

    expectNoOverlap(labels)
    expect(labels[0]!.text).toBe('00:00')
    expect(labels.at(-1)!.text).toBe('12:00')
  })

  it('двенадцать месяцев категориями', () => {
    expectNoOverlap(axisLabels(['Nov', 'Dec', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct']))
  })

  it('время каждые полчаса на двенадцать часов', () => {
    const start = new Date(2026, 9, 6, 0, 0).getTime()
    const times = Array.from({ length: 25 }, (_, index) => new Date(start + index * 30 * 60 * 1000))

    expectNoOverlap(axisLabels(times))
  })

  it('месяцы датами, ноябрь — октябрь', () => {
    const months = Array.from({ length: 12 }, (_, index) => new Date(2025, 10 + index, 1))

    expectNoOverlap(axisLabels(months))
  })

  it('`xTickCount` у категорий — потолок числа подписей', () => {
    const months = ['Nov', 'Dec', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct']
    const labels = axisLabels(months, { width: 1200, xTickCount: 4 })

    expect(labels.length).toBeLessThanOrEqual(5)
    expect(labels.length).toBeLessThan(months.length)
  })
})
