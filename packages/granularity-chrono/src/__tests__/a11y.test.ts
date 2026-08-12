import { mount } from '@vue/test-utils'
import axe from 'axe-core'
import { nextTick } from 'vue'
import { describe, expect, it } from 'vitest'

import GrCalendar from '../components/GrCalendar/GrCalendar.vue'
import GrDatePicker from '../components/GrDatePicker/GrDatePicker.vue'
import GrDateRangePicker from '../components/GrDateRangePicker/GrDateRangePicker.vue'
import GrDateTimePicker from '../components/GrDateTimePicker/GrDateTimePicker.vue'
import GrRelativeTime from '../components/GrRelativeTime/GrRelativeTime.vue'
import GrTimePicker from '../components/GrTimePicker/GrTimePicker.vue'

/**
 * Гейт axe на самой панели.
 *
 * Витринный a11y-гейт (`apps/showcase/e2e/a11y.spec.ts`) сюда не дотягивается
 * дважды: пакет попадёт в витрину только в 1.8, и даже там axe снимает
 * **закрытое** состояние — панель пикера в кадр не попадает. Между тем
 * интересное живёт именно в раскрытой сетке: роли `grid`/`row`/`gridcell`,
 * `aria-selected` на дне, связка панели с полем.
 *
 * `color-contrast` выключен — как и в витрине: правилу нужен настоящий рендер
 * (в jsdom нет ни раскладки, ни canvas), а цвета держат `tonePalette` и
 * `cssContrast` в ядре.
 *
 * Проверяются нарушения уровня serious и critical: axe в jsdom честно отдаёт
 * часть проверок как `incomplete` — это не долг, а отсутствие раскладки.
 */

const RULES: axe.RunOptions = {
  rules: { 'color-contrast': { enabled: false } },
  resultTypes: ['violations'],
}

function iso(value: string) {
  const [y, m, d] = value.split('-').map(Number) as [number, number, number]
  return { y, m: m - 1, d }
}

async function violations(root: Element): Promise<string[]> {
  const result = await axe.run(root, RULES)

  return result.violations
    .filter(violation => violation.impact === 'serious' || violation.impact === 'critical')
    .map(violation => `${violation.id}: ${violation.help} (${violation.nodes.length})`)
}

describe('a11y', () => {
  it('GrCalendar — сетка без нарушений', async () => {
    const wrapper = mount(GrCalendar, {
      props: {
        viewDate: iso('2026-08-01'),
        today: iso('2026-08-12'),
        modelValue: iso('2026-08-20'),
        locale: 'en-US',
        showWeekNumbers: true,
        ariaLabel: 'Departure date',
      },
      attachTo: document.body,
    })
    await nextTick()

    expect(await violations(wrapper.element as Element)).toEqual([])
    wrapper.unmount()
  })

  it('GrDatePicker — поле и раскрытая панель без нарушений', async () => {
    const wrapper = mount(GrDatePicker, {
      props: {
        modelValue: new Date(2026, 7, 20),
        today: new Date(2026, 7, 12),
        locale: 'en-US',
        clearable: true,
        required: true,
        ariaLabel: 'Departure date',
      },
      attachTo: document.body,
    })

    await wrapper.get('[data-gr-date-picker-field]').trigger('click')
    for (let i = 0; i < 4; i += 1) await nextTick()

    // Панель уезжает в портал — проверяем документ целиком, иначе она выпадет
    // из области сканирования вместе со всей своей разметкой.
    expect(wrapper.find('[data-gr-date-picker-panel]').exists() || document.querySelector('[data-gr-date-picker-panel]') !== null).toBe(true)
    expect(await violations(document.body)).toEqual([])

    wrapper.unmount()
  })

  it('GrRelativeTime — метка времени без нарушений', async () => {
    const wrapper = mount(GrRelativeTime, {
      props: {
        value: new Date(2026, 7, 11, 12),
        base: new Date(2026, 7, 12, 12),
        locale: 'en-US',
      },
      attachTo: document.body,
    })

    expect(await violations(document.body)).toEqual([])

    wrapper.unmount()
  })

  it('GrTimePicker — поле и раскрытые колонки без нарушений', async () => {
    const wrapper = mount(GrTimePicker, {
      props: {
        modelValue: new Date(2026, 7, 12, 15, 30),
        today: new Date(2026, 7, 12),
        locale: 'en-US',
        use12Hours: true,
        enableSeconds: true,
        clearable: true,
        required: true,
        ariaLabel: 'Departure time',
      },
      attachTo: document.body,
    })

    await wrapper.get('[data-gr-time-picker-field]').trigger('click')
    for (let i = 0; i < 4; i += 1) await nextTick()

    expect(document.querySelector('[data-gr-time-picker-panel]')).not.toBeNull()
    expect(await violations(document.body)).toEqual([])

    wrapper.unmount()
  })

  it('GrDateTimePicker — сетка, колонки и подвал без нарушений', async () => {
    const wrapper = mount(GrDateTimePicker, {
      props: {
        modelValue: new Date(2026, 7, 12, 15, 30),
        today: new Date(2026, 7, 12),
        locale: 'en-US',
        use12Hours: true,
        autoApply: false,
        clearable: true,
        ariaLabel: 'Meeting start',
      },
      attachTo: document.body,
    })

    await wrapper.get('[data-gr-date-time-picker-field]').trigger('click')
    for (let i = 0; i < 4; i += 1) await nextTick()

    expect(document.querySelector('[data-gr-date-time-picker-footer]')).not.toBeNull()
    expect(await violations(document.body)).toEqual([])

    wrapper.unmount()
  })

  it('GrDateRangePicker — сетка с выбранным периодом без нарушений', async () => {
    const wrapper = mount(GrDateRangePicker, {
      props: {
        modelValue: [new Date(2026, 7, 10), new Date(2026, 7, 14)],
        today: new Date(2026, 7, 12),
        locale: 'en-US',
        showWeekNumbers: true,
        clearable: true,
        ariaLabel: 'Stay',
      },
      attachTo: document.body,
    })

    await wrapper.get('[data-gr-date-range-picker-field]').trigger('click')
    for (let i = 0; i < 4; i += 1) await nextTick()

    expect(document.querySelector('[data-gr-date-range-picker-panel]')).not.toBeNull()
    expect(await violations(document.body)).toEqual([])

    wrapper.unmount()
  })
})
