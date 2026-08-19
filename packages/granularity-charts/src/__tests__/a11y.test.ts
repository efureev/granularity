import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'

import { axeViolations } from '@feugene/granularity-test-kit/a11y'
import { nextTick } from 'vue'

import GrChartBullet from '../components/GrChartBullet/GrChartBullet.vue'
import GrChartHeatmap from '../components/GrChartHeatmap/GrChartHeatmap.vue'
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
 * `color-contrast` `axeViolations` гасит по умолчанию: в jsdom нет ни раскладки,
 * ни canvas, и правилу нечего мерить. Цвета держат гейты палитры в ядре, а в
 * браузере то же правило включено.
 *
 * Проверяются нарушения уровня serious и critical: часть проверок axe в jsdom
 * честно отдаёт как `incomplete` — это отсутствие раскладки, а не долг.
 */

const series = [
  { id: 'sales', label: 'Sales', x: [0, 1, 2, 3], y: [10, 40, 20, 50] },
  { id: 'returns', label: 'Returns', x: [0, 1, 2, 3], y: [5, 8, 6, 9] },
]

describe('a11y', () => {
  it('GrChartLine — оверлей, легенда и скрытая таблица без нарушений', async () => {
    const wrapper = mount(GrChartLine, {
      props: { series, showLegend: true, ariaLabel: 'Weekly revenue' },
      attachTo: document.body,
    })
    await nextTick()

    expect(await axeViolations(wrapper.element as Element)).toEqual([])
    wrapper.unmount()
  })

  it('GrChartLine — видимая таблица данных без нарушений', async () => {
    const wrapper = mount(GrChartLine, {
      props: { series, dataTable: 'visible' },
      attachTo: document.body,
    })
    await nextTick()

    expect(await axeViolations(wrapper.element as Element)).toEqual([])
    wrapper.unmount()
  })

  it('GrChartLine — пустое состояние и загрузка без нарушений', async () => {
    const empty = mount(GrChartLine, { props: { series: [] }, attachTo: document.body })
    await nextTick()
    expect(await axeViolations(empty.element as Element)).toEqual([])
    empty.unmount()

    const loading = mount(GrChartLine, { props: { series, loading: true }, attachTo: document.body })
    await nextTick()
    expect(await axeViolations(loading.element as Element)).toEqual([])
    loading.unmount()
  })

  it('GrChartLine — неинтерактивный режим без нарушений', async () => {
    const wrapper = mount(GrChartLine, {
      props: { series, interactive: false, ariaLabel: 'Weekly revenue' },
      attachTo: document.body,
    })
    await nextTick()

    expect(await axeViolations(wrapper.element as Element)).toEqual([])
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

    expect(await axeViolations(wrapper.element as Element)).toEqual([])
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

    expect(await axeViolations(wrapper.element as Element)).toEqual([])
    wrapper.unmount()
  })

  it('GrChartLine с опорами и видимой таблицей — примечание в `tfoot`, без нарушений', async () => {
    // Пояснение в `tfoot` — `th` с `colspan`, а не `td`: ячейка без заголовка в
    // таблице от трёх колонок поднимает `td-has-header`.
    const wrapper = mount(GrChartLine, {
      props: {
        series: [
          { id: 'cost', label: 'Cost', x: [0, 1, 2], y: [0.02, 0.03, 0.031] },
          { id: 'plan', label: 'Plan', x: [0, 1, 2], y: [0.025, 0.025, 0.025] },
        ],
        references: [
          { axis: 'y', value: 0.04, label: 'Critical' },
          { axis: 'y', value: [0.03, 0.035], label: 'Warning' },
        ],
        dataTable: 'visible',
      },
      attachTo: document.body,
    })
    await nextTick()

    expect(wrapper.find('[data-gr-chart-table] tfoot th').exists()).toBe(true)
    expect(await axeViolations(wrapper.element as Element)).toEqual([])
    wrapper.unmount()
  })

  it('GrChartBullet — роль `meter` с величиной и границами, без нарушений', async () => {
    const wrapper = mount(GrChartBullet, {
      props: { value: 0.031, target: 0.04, ranges: [0.03, 0.035], max: 0.05, label: 'Cost', dataTable: 'visible' },
      attachTo: document.body,
    })
    await nextTick()

    expect(await axeViolations(wrapper.element as Element)).toEqual([])
    wrapper.unmount()
  })

  it('GrChartBullet без величины — роль `meter` снимается, без нарушений', async () => {
    // `meter` требует `aria-valuenow`; при `value: null` его нет, и оставленная
    // роль дала бы `aria-required-attr` уровня serious.
    const wrapper = mount(GrChartBullet, {
      props: { value: null, target: 0.04, max: 0.05, label: 'Cost' },
      attachTo: document.body,
    })
    await nextTick()

    expect(wrapper.find('[data-gr-chart-surface]').attributes('role')).toBe('application')
    expect(await axeViolations(wrapper.element as Element)).toEqual([])
    wrapper.unmount()
  })

  it('GrChartHeatmap с видимой таблицей — заголовки строк и колонок, без нарушений', async () => {
    const wrapper = mount(GrChartHeatmap, {
      props: {
        values: [[100, 62, 41], [100, 58], [100]],
        xLabels: ['M0', 'M1', 'M2'],
        yLabels: ['Jan', 'Feb', 'Mar'],
        dataTable: 'visible',
      },
      attachTo: document.body,
    })
    await nextTick()

    expect(await axeViolations(wrapper.element as Element)).toEqual([])
    wrapper.unmount()
  })

  it('GrSparkline — картинка с именем, без нарушений', async () => {
    const wrapper = mount(GrSparkline, { props: { data: [1, 5, 3, 9] }, attachTo: document.body })
    await nextTick()

    expect(await axeViolations(wrapper.element as Element)).toEqual([])
    wrapper.unmount()
  })
})
