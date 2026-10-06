import { granularityGlobal } from '@feugene/granularity/testing'
import { mount } from '@vue/test-utils'
import { describe, expect, it, vi } from 'vitest'
import { createSSRApp, h } from 'vue'
import { renderToString } from 'vue/server-renderer'

import { estimateTextWidth } from '../../../chart/chartLayout'
import GrChartPie from '../../GrChartPie/GrChartPie.vue'
import GrChartRadar from '../GrChartRadar.vue'

/**
 * Паутина не отдаёт радиус подписям.
 *
 * Отступ под самую длинную подпись резервировался с каждой стороны, и в узком
 * контейнере от паутины оставалось 25px под наползающим текстом.
 */
function radar(props: Record<string, unknown>) {
  return mount(GrChartRadar, { props: { ariaLabel: 'Навыки', series: [], ...props }, global: granularityGlobal(), attachTo: document.body })
}

function webDiameter(wrapper: ReturnType<typeof radar>): number {
  const ys = wrapper.findAll('[data-gr-chart-radar-axis]').map(node => Number(node.attributes('y2')))
  const xs = wrapper.findAll('[data-gr-chart-radar-axis]').map(node => Number(node.attributes('x2')))
  const cx = Number(wrapper.get('[data-gr-chart-radar-axis]').attributes('x1'))
  const cy = Number(wrapper.get('[data-gr-chart-radar-axis]').attributes('y1'))

  return 2 * Math.max(...xs.map((x, index) => Math.hypot(x - cx, ys[index]! - cy)))
}

interface Box { left: number, right: number, top: number, bottom: number }

function labelBoxes(wrapper: ReturnType<typeof radar>): Box[] {
  return wrapper.findAll('[data-gr-chart-radar-label]').map((node) => {
    const anchor = node.attributes('text-anchor')
    const x = Number(node.attributes('x'))
    const lines = node.findAll('tspan').map(line => ({
      width: estimateTextWidth(line.text(), Number(line.attributes('font-size'))),
      y: Number(line.attributes('y')),
      size: Number(line.attributes('font-size')),
    }))
    const width = Math.max(...lines.map(line => line.width))
    const left = anchor === 'start' ? x : anchor === 'end' ? x - width : x - width / 2

    return {
      left,
      right: left + width,
      top: Math.min(...lines.map(line => line.y - line.size * 0.6)),
      bottom: Math.max(...lines.map(line => line.y + line.size * 0.6)),
    }
  })
}

function overlaps(boxes: Box[]): string[] {
  const found: string[] = []

  boxes.forEach((first, i) => boxes.slice(i + 1).forEach((second, offset) => {
    if (first.left < second.right && second.left < first.right && first.top < second.bottom && second.top < first.bottom)
      found.push(`${i} и ${i + offset + 1}`)
  }))

  return found
}

const skills = ['System design', 'Go', 'SQL', 'On-call', 'Mentoring']

describe('GrChartRadar: раскладка в узком контейнере', () => {
  it('213×260: паутина не уже 70px, подписи не налезают и не выходят за холст', () => {
    const wrapper = radar({ width: 213, height: 260, series: [{ id: 'me', label: 'Я', x: skills, y: [4, 5, 3, 2, 4] }] })
    const boxes = labelBoxes(wrapper)

    expect(webDiameter(wrapper)).toBeGreaterThanOrEqual(70)
    expect(overlaps(boxes)).toEqual([])
    boxes.forEach((box) => {
      expect(box.left).toBeGreaterThanOrEqual(0)
      expect(box.right).toBeLessThanOrEqual(213)
    })
    wrapper.unmount()
  })

  it('потолок оси при нормировке — второй строкой, а не в ширину подписи', () => {
    const axes = ['Orders a day', 'Revenue', 'Returns', 'Rating', 'Delivery']
    const wrapper = radar({
      width: 213,
      height: 260,
      axisScale: 'per-axis',
      axisMax: { 'Orders a day': 200, 'Revenue': 5000, 'Returns': 40, 'Rating': 5, 'Delivery': 72 },
      series: [{ id: 'a', label: 'A', x: axes, y: [120, 3200, 12, 4, 30] }],
    })
    const first = wrapper.get('[data-gr-chart-radar-label="0"]')

    // «Orders a day» ещё и переносится: узкой паутине шире четверти холста не по карману.
    expect(first.findAll('tspan').map(line => line.text())).toEqual(['Orders', 'a day', 'max 200'])
    expect(first.get('title').text()).toBe('Orders a day · 200')
    // Имя может уступить многоточию, число потолка — нет: «max 5,…» соврал бы.
    const notes = wrapper.findAll('[data-gr-chart-radar-label]').map(node => node.findAll('tspan').at(-1)!.text())

    expect(notes).toEqual(['max 200', 'max 5,000', 'max 40', 'max 5', 'max 72'])
    expect(webDiameter(wrapper)).toBeGreaterThanOrEqual(70)
    expect(overlaps(labelBoxes(wrapper))).toEqual([])
    wrapper.unmount()
  })

  it('336×300 и шесть коротких подписей: паутина не уже 160px', () => {
    const axes = ['Speed', 'Price', 'Support', 'Docs', 'API', 'Uptime']
    const wrapper = radar({ width: 336, height: 300, series: [{ id: 'a', label: 'A', x: axes, y: [3, 4, 5, 2, 4, 5] }] })

    expect(webDiameter(wrapper)).toBeGreaterThanOrEqual(160)
    wrapper.unmount()
  })

  it('подпись кольца не стоит на первой спице', () => {
    const wrapper = radar({ shape: 'circle', series: [{ id: 'a', label: 'A', x: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'], y: [200, 400, 600, 300, 500] }] })
    const spoke = wrapper.get('[data-gr-chart-radar-axis="0"]')
    const ringLabels = wrapper.findAll('[data-gr-chart-radar-ring-label]')

    expect(ringLabels.length).toBeGreaterThan(0)
    for (const label of ringLabels)
      expect(Number(label.attributes('x'))).toBeGreaterThan(Number(spoke.attributes('x2')) + 5)
    wrapper.unmount()
  })
})

describe('полярная геометрия одинакова на сервере и в браузере', () => {
  const numeric = /\s(?:[xyr]|x1|y1|x2|y2|cx|cy)="(-?\d+(?:\.\d+)?)"/g

  it.each([
    ['GrChartRadar', () => h(GrChartRadar, { axisScale: 'per-axis', width: 400, height: 300, series: [{ id: 'a', label: 'A', x: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'], y: [3, 7, 2, 9, 4, 6, 5] }] })],
    ['GrChartPie', () => h(GrChartPie, { variant: 'donut', labels: 'share', width: 400, height: 300, data: [{ label: 'A', value: 37 }, { label: 'B', value: 23 }, { label: 'C', value: 11 }] })],
  ])('%s: координаты — не больше двух знаков, гидрация без расхождений', async (_name, render) => {
    const html = await renderToString(createSSRApp({ render }))

    for (const [, value] of html.matchAll(numeric))
      expect((value!.split('.')[1] ?? '').length, value).toBeLessThanOrEqual(2)

    const container = document.createElement('div')
    container.innerHTML = html
    document.body.append(container)
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    const error = vi.spyOn(console, 'error').mockImplementation(() => {})

    createSSRApp({ render }).mount(container)

    const mismatches = [...warn.mock.calls, ...error.mock.calls].map(call => String(call[0])).filter(message => /hydration/i.test(message))

    warn.mockRestore()
    error.mockRestore()
    container.remove()
    expect(mismatches).toEqual([])
  })
})
