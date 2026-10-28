import { componentSheet } from '@feugene/granularity-test-kit/vue'
import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'

import type { PlainDate } from '../../../chrono/plainDate'
import GrTimePicker from '../../GrTimePicker/GrTimePicker.vue'
import GrCalendar from '../GrCalendar.vue'

/**
 * Вид календаря — лист по атрибутам: тест читает, что получает ячейка в каждом
 * состоянии, а не какие классы на ней висят. Значения — токены темы и роли, их
 * сверяют гейты тем; здесь — что состояние берёт свой токен.
 */
const sheet = componentSheet('GrCalendar/GrCalendar.vue')
const at = (d: number): PlainDate => ({ y: 2026, m: 9, d })
const TODAY = at(14)

function mountCalendar(props: Record<string, unknown> = {}) {
  return mount(GrCalendar, { props: { today: TODAY, viewDate: at(1), modelValue: null, ...props } })
}

function dayLook(wrapper: ReturnType<typeof mountCalendar>, d: number, state = {}) {
  const key = `2026-10-${String(d).padStart(2, '0')}`
  return sheet.look(wrapper.get(`[data-gr-calendar-day][data-key="${key}"]`).element, state)
}

describe('GrCalendar — лист: день', () => {
  it('наведение — токен подсветки, выбранный на наведение не откликается', () => {
    const wrapper = mountCalendar({ modelValue: at(20) })

    expect(dayLook(wrapper, 13, { hover: true })['background-color']).toBe('var(--gr-calendar-hover-bg)')
    expect(dayLook(wrapper, 20, { hover: true })['background-color']).toBe('var(--gr-calendar-selected-bg, var(--gr-selected))')
  })

  it('«сегодня» — цвет, начертание и обводка темы; на выбранном остаётся начертание', () => {
    const plain = dayLook(mountCalendar(), 14)
    expect(plain.color).toBe('var(--gr-calendar-today-fg)')
    expect(plain['font-weight']).toBe('var(--gr-calendar-today-weight)')
    expect(plain['box-shadow']).toBe('inset 0 0 0 1px var(--gr-calendar-today-ring)')

    const selected = dayLook(mountCalendar({ modelValue: TODAY }), 14)
    expect(selected.color).toBe('var(--gr-calendar-selected-fg, var(--gr-selected-fg))')
    expect(selected['font-weight']).toBe('var(--gr-calendar-today-weight)')
    expect(selected['box-shadow']).toBeUndefined()
  })

  it('запрещённая дата не выглядит выбранной', () => {
    const look = dayLook(mountCalendar({ modelValue: at(22), disabledDates: [at(22)] }), 22)

    expect(look['background-color']).toBe('transparent')
    expect(look.color).toBe('var(--gr-disabled-fg)')
    expect(look.cursor).toBe('not-allowed')
  })

  it('край предпросмотра — свой вид, начало — выбор, полоса — своя заливка', () => {
    const wrapper = mountCalendar({ rangeStart: at(8), rangePreview: at(16) })
    const end = dayLook(wrapper, 16, { hover: true })

    expect(end['background-color']).toBe('var(--gr-calendar-preview-end-bg)')
    expect(end.color).toBe('var(--gr-calendar-preview-end-fg)')
    expect(end['box-shadow']).toBe('inset 0 0 0 1px var(--gr-calendar-preview-end-ring)')
    expect(dayLook(wrapper, 8)['background-color']).toBe('var(--gr-calendar-selected-bg, var(--gr-selected))')

    const band = wrapper.get('[data-gr-calendar-day][data-key="2026-10-12"]').element.parentElement!
    expect(sheet.look(band)['background-color']).toBe('var(--gr-calendar-range-preview-bg)')
  })

  it('закрытый период — полоса выбора и залитые края', () => {
    const wrapper = mountCalendar({ rangeStart: at(8), rangeEnd: at(16) })
    const band = wrapper.get('[data-gr-calendar-day][data-key="2026-10-12"]').element.parentElement!

    expect(sheet.look(band)['background-color']).toBe('var(--gr-calendar-range-bg)')
    expect(dayLook(wrapper, 16)['background-color']).toBe('var(--gr-calendar-selected-bg, var(--gr-selected))')
  })

  it('«только чтение» — без отклика на наведение и без руки курсора', () => {
    const look = dayLook(mountCalendar({ readonly: true, modelValue: at(20) }), 13, { hover: true })

    expect(look['background-color']).toBeUndefined()
    expect(look.cursor).toBe('default')
  })

  it('недоступный календарь гаснет ролями недоступного контрола, выбор остаётся виден', () => {
    const wrapper = mountCalendar({ disabled: true, modelValue: at(20) })

    expect(dayLook(wrapper, 13, { hover: true })['background-color']).toBeUndefined()
    expect(dayLook(wrapper, 13).color).toBe('var(--gr-disabled-fg)')
    expect(dayLook(wrapper, 13).cursor).toBe('not-allowed')
    expect(dayLook(wrapper, 20)['background-color']).toBe('var(--gr-disabled-bg)')
    expect(dayLook(wrapper, 20).color).toBe('var(--gr-disabled-fg)')
    expect(sheet.look(wrapper.get('[data-gr-calendar-title]').element).color).toBe('var(--gr-disabled-fg)')
  })

  it('скругление и кегль — по ступени корня', () => {
    const look = dayLook(mountCalendar({ size: 'lg' }), 13)

    expect(look['border-radius']).toBe('var(--gr-radius-control-lg)')
    expect(look['font-size']).toBe('var(--gr-control-text-lg)')
  })
})

describe('GrCalendar — лист: период', () => {
  it('текущий период — как «сегодня», выбранный — роль выбора', () => {
    const wrapper = mountCalendar({ mode: 'month', modelValue: { y: 2026, m: 1, d: 1 } })
    const look = (n: number) => sheet.look(wrapper.findAll('[data-gr-calendar-period]')[n]!.element)

    expect(look(9).color).toBe('var(--gr-calendar-today-fg)')
    expect(look(9)['font-weight']).toBe('var(--gr-calendar-today-weight)')
    expect(look(9)['box-shadow']).toBe('inset 0 0 0 1px var(--gr-calendar-today-ring)')
    expect(look(1)['background-color']).toBe('var(--gr-calendar-selected-bg, var(--gr-selected))')
    expect(sheet.look(wrapper.findAll('[data-gr-calendar-period]')[2]!.element, { hover: true })['background-color']).toBe('var(--gr-calendar-hover-bg)')
  })
})

describe('GrTimePicker — лист: значение колонки', () => {
  const time = componentSheet('GrTimePicker/GrTimePicker.vue')

  it('наведение — токен подсветки, курсор клавиатуры — кольцо', async () => {
    const wrapper = mount(GrTimePicker, { props: { inline: true, modelValue: new Date(2026, 9, 14, 10, 30), ariaLabel: 'Время' } })
    const options = wrapper.findAll('[data-gr-time-picker-option]')
    const idle = options.find(option => option.attributes('aria-selected') === 'false')!

    expect(time.look(idle.element, { hover: true })['background-color']).toBe('var(--gr-time-picker-hover-bg)')

    await wrapper.get('[role="listbox"]').trigger('keydown', { key: 'ArrowDown' })
    const active = wrapper.get('[data-gr-time-picker-option][data-gr-active]')
    expect(time.look(active.element)['box-shadow']).toBe('inset 0 0 0 1px var(--gr-time-picker-active-ring, var(--gr-ring))')
  })
})
