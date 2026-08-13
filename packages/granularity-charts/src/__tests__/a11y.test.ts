import { mount } from '@vue/test-utils'
import axe from 'axe-core'
import { describe, expect, it } from 'vitest'
import { nextTick } from 'vue'

import GrChartLine from '../components/GrChartLine/GrChartLine.vue'
import GrChartRadar from '../components/GrChartRadar/GrChartRadar.vue'
import GrSparkline from '../components/GrSparkline/GrSparkline.vue'

/**
 * Гейт axe на самом графике.
 *
 * Витринный a11y-гейт снимает страницу целиком и до раскрытых состояний не
 * дотягивается, а интересное у графика живёт именно в них: оверлей с
 * `role="application"`, скрытая таблица данных, легенда-переключатель.
 *
 * `color-contrast` выключен, как и в витрине: правилу нужен настоящий рендер
 * (в jsdom нет ни раскладки, ни canvas), а цвета держат гейты палитры в ядре.
 *
 * Проверяются нарушения уровня serious и critical: часть проверок axe в jsdom
 * честно отдаёт как `incomplete` — это отсутствие раскладки, а не долг.
 */

const RULES: axe.RunOptions = {
  rules: { 'color-contrast': { enabled: false } },
  resultTypes: ['violations'],
}

const series = [
  { id: 'sales', label: 'Sales', x: [0, 1, 2, 3], y: [10, 40, 20, 50] },
  { id: 'returns', label: 'Returns', x: [0, 1, 2, 3], y: [5, 8, 6, 9] },
]

async function violations(root: Element): Promise<string[]> {
  const result = await axe.run(root, RULES)

  return result.violations
    .filter(violation => violation.impact === 'serious' || violation.impact === 'critical')
    .map(violation => `${violation.id}: ${violation.help} (${violation.nodes.length})`)
}

describe('a11y', () => {
  it('GrChartLine — оверлей, легенда и скрытая таблица без нарушений', async () => {
    const wrapper = mount(GrChartLine, {
      props: { series, showLegend: true, ariaLabel: 'Weekly revenue' },
      attachTo: document.body,
    })
    await nextTick()

    expect(await violations(wrapper.element as Element)).toEqual([])
    wrapper.unmount()
  })

  it('GrChartLine — видимая таблица данных без нарушений', async () => {
    const wrapper = mount(GrChartLine, {
      props: { series, dataTable: 'visible' },
      attachTo: document.body,
    })
    await nextTick()

    expect(await violations(wrapper.element as Element)).toEqual([])
    wrapper.unmount()
  })

  it('GrChartLine — пустое состояние и загрузка без нарушений', async () => {
    const empty = mount(GrChartLine, { props: { series: [] }, attachTo: document.body })
    await nextTick()
    expect(await violations(empty.element as Element)).toEqual([])
    empty.unmount()

    const loading = mount(GrChartLine, { props: { series, loading: true }, attachTo: document.body })
    await nextTick()
    expect(await violations(loading.element as Element)).toEqual([])
    loading.unmount()
  })

  it('GrChartLine — неинтерактивный режим без нарушений', async () => {
    const wrapper = mount(GrChartLine, {
      props: { series, interactive: false, ariaLabel: 'Weekly revenue' },
      attachTo: document.body,
    })
    await nextTick()

    expect(await violations(wrapper.element as Element)).toEqual([])
    wrapper.unmount()
  })

  it('GrChartRadar — паутина с легендой и таблицей, без нарушений', async () => {
    const wrapper = mount(GrChartRadar, {
      props: {
        series: [
          { id: 'a', label: 'A', x: ['Speed', 'Price', 'Support'], y: [8, 6, 9] },
          { id: 'b', label: 'B', x: ['Speed', 'Price', 'Support'], y: [6, 9, 5] },
        ],
        showLegend: true,
        dataTable: 'visible',
      },
      attachTo: document.body,
    })
    await nextTick()

    expect(await violations(wrapper.element as Element)).toEqual([])
    wrapper.unmount()
  })

  it('GrChartRadar с нормировкой на ось — таблица с максимумами, без нарушений', async () => {
    const wrapper = mount(GrChartRadar, {
      props: {
        series: [{ id: 'a', label: 'A', x: ['Revenue', 'NPS'], y: [4.2, 62] }],
        axisScale: 'per-axis',
        dataTable: 'visible',
      },
      attachTo: document.body,
    })
    await nextTick()

    expect(await violations(wrapper.element as Element)).toEqual([])
    wrapper.unmount()
  })

  it('GrSparkline — картинка с именем, без нарушений', async () => {
    const wrapper = mount(GrSparkline, { props: { data: [1, 5, 3, 9] }, attachTo: document.body })
    await nextTick()

    expect(await violations(wrapper.element as Element)).toEqual([])
    wrapper.unmount()
  })
})
