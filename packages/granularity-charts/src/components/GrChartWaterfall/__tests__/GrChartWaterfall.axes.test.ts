import { granularityGlobal } from '@feugene/granularity/testing'
import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'

import { estimateTextWidth } from '../../../chart/chartLayout'
import GrChartWaterfall from '../GrChartWaterfall.vue'

function waterfall(props: Record<string, unknown>) {
  return mount(GrChartWaterfall, { props: { steps: [], locale: 'en', ...props }, global: granularityGlobal(), attachTo: document.body })
}

const pnl = [
  { label: 'Revenue', value: 1240, kind: 'total' as const },
  { label: 'Cost of sales', value: -410 },
  { label: 'Gross profit', value: 830, kind: 'total' as const },
  { label: 'Salaries', value: -390 },
  { label: 'Marketing', value: -120 },
  { label: 'Office', value: -60 },
  { label: 'Operating profit', value: 260, kind: 'total' as const },
  { label: 'Taxes', value: -65 },
]

/** Ординаты пути столбца: `M x y`, `V y`, `A … x y`; `H` ординату не меняет. */
function ordinatesOf(d: string): number[] {
  const ys: number[] = []

  for (const [, command, args] of d.matchAll(/([MLHVAZ])([^MLHVAZ]*)/g)) {
    const numbers = args!.trim().split(/\s+/).filter(Boolean).map(Number)

    if (command === 'M' || command === 'L')
      ys.push(numbers[1]!)
    else if (command === 'V')
      ys.push(numbers[0]!)
    else if (command === 'A')
      ys.push(numbers[6]!)
  }

  return ys
}

describe('GrChartWaterfall: оси', () => {
  it('ось значений — по накоплениям: отрицательные шаги не тянут её в минус', () => {
    // Накопление нигде не уходит ниже нуля, а дельта −410 растягивала ось до −500.
    const wrapper = waterfall({ steps: pnl })
    const values = wrapper.findAll('[data-gr-chart-axis="y"] text').map(node => Number(node.text().replace(/,/g, '')))

    expect(Math.min(...values)).toBe(0)
    wrapper.unmount()
  })

  it('горизонталь: ось значений тоже от нуля', () => {
    const stock = [
      { label: 'Opening', value: 1200, kind: 'total' as const },
      { label: 'Received', value: 480 },
      { label: 'Shipped', value: -910 },
      { label: 'Returned', value: 36 },
      { label: 'Written off', value: -14 },
      { label: 'Recount', value: 0 },
      { label: 'Closing', value: 760, kind: 'total' as const },
    ]
    const wrapper = waterfall({ steps: stock, orientation: 'horizontal' })
    const values = wrapper.findAll('[data-gr-chart-axis="x"] text').map(node => Number(node.text().replace(/,/g, '')))

    expect(Math.min(...values)).toBe(0)
    wrapper.unmount()
  })

  it('`yDomain` с низом выше нуля: столбцы не выходят за область построения', () => {
    const wrapper = waterfall({
      yDomain: [150, null],
      steps: [
        { label: 'Start of Sep', value: 184, kind: 'total' },
        { label: 'New', value: 30 },
        { label: 'Churn', value: -9 },
        { label: 'End of Sep', value: 205, kind: 'total' },
      ],
    })
    // Ось значений проходит от верха до низа области построения.
    const axis = wrapper.get('[data-gr-chart-axis="y"] line')
    const top = Number(axis.attributes('y1'))
    const bottom = Number(axis.attributes('y2'))

    for (const bar of wrapper.findAll('[data-gr-chart-waterfall-step]')) {
      for (const y of ordinatesOf(bar.attributes('d')!)) {
        expect(y).toBeGreaterThanOrEqual(top - 0.01)
        expect(y).toBeLessThanOrEqual(bottom + 0.01)
      }
    }
    wrapper.unmount()
  })

  it.each([
    [510, pnl.map(step => step.label)],
    [210, ['Start', 'Price', 'Volume', 'Mix', 'FX']],
  ])('%ipx: каждый шаг назван, подписи не налезают', (width, labels) => {
    const wrapper = waterfall({ width, steps: labels.map((label, index) => ({ label, value: index === 0 ? 100 : 10 * (index % 2 === 0 ? 1 : -1) })) })
    const ticks = wrapper.findAll('[data-gr-chart-axis="x"] text').map((node) => {
      const lines = node.findAll('tspan').map(line => line.text())
      const text = lines.length > 0 ? lines : [node.element.childNodes[0]!.textContent!.trim()]
      const half = Math.max(...text.map(line => estimateTextWidth(line, 12))) / 2
      const x = Number(node.attributes('x'))

      return { text, left: x - half, right: x + half }
    })

    expect(ticks).toHaveLength(labels.length)
    ticks.forEach((tick, index) => {
      if (index > 0)
        expect(tick.left, `${ticks[index - 1]!.text.join(' ')} / ${tick.text.join(' ')}`).toBeGreaterThanOrEqual(ticks[index - 1]!.right)
    })
    wrapper.unmount()
  })

  it('горизонталь: последняя подпись оси значений помещается в холст', () => {
    const wrapper = waterfall({
      orientation: 'horizontal',
      steps: [{ label: 'Opening', value: 1200, kind: 'total' }, { label: 'Received', value: 480 }, { label: 'Closing', value: 1680, kind: 'total' }],
    })
    const width = Number(wrapper.get('svg').attributes('width'))
    const last = wrapper.findAll('[data-gr-chart-axis="x"] text').at(-1)!

    expect(Number(last.attributes('x')) + estimateTextWidth(last.text(), 12) / 2).toBeLessThanOrEqual(width)
    wrapper.unmount()
  })
})
