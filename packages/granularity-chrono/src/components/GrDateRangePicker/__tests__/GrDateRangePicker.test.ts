import { DOMWrapper, mount } from '@vue/test-utils'
import { nextTick } from 'vue'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { announced, resetGranularityDom } from '@feugene/granularity/testing'

import * as calendarGrid from '../../../chrono/calendarGrid'
import * as calendarStyles from '../../GrCalendar/grCalendarStyles'
import GrDateRangePicker from '../GrDateRangePicker.vue'

const TODAY = new Date(2026, 7, 12)

function at(day: number): Date {
  return new Date(2026, 7, day)
}

function mountPicker(props: Record<string, unknown> = {}) {
  return mount(GrDateRangePicker, {
    props: { locale: 'en-US', today: TODAY, ...props },
    attachTo: document.body,
  })
}

type Picker = ReturnType<typeof mountPicker>

function field(wrapper: Picker) {
  return wrapper.get('[data-gr-date-range-picker-field]')
}

/** Панель уезжает в портал, то есть из поддерева обёртки. */
function query(selector: string): DOMWrapper<HTMLElement> {
  const element = document.querySelector<HTMLElement>(selector)
  if (!element) throw new Error(`нет элемента ${selector}`)

  return new DOMWrapper(element)
}

function day(key: string) {
  return query(`[data-gr-calendar-day][data-key="${key}"]`)
}

/** Ячейка таблицы под днём: полосу диапазона рисует она, а не сам день. */
function cell(key: string) {
  const element = document.querySelector(`[data-gr-calendar-day][data-key="${key}"]`)?.closest('td')
  if (!element) throw new Error(`нет ячейки ${key}`)

  return new DOMWrapper(element)
}

function inRange(key: string): boolean {
  return cell(key).attributes('class')?.includes('--gr-calendar-range-bg') ?? false
}

async function openPicker(wrapper: Picker) {
  await field(wrapper).trigger('click')
  for (let i = 0; i < 4; i += 1) await nextTick()
}

function lastModel(wrapper: Picker): unknown {
  return wrapper.emitted('update:modelValue')?.at(-1)?.[0]
}

afterEach(resetGranularityDom)

describe('GrDateRangePicker — выбор периода', () => {
  it('первый клик открывает период, второй закрывает и отдаёт пару', async () => {
    const wrapper = mountPicker()
    await openPicker(wrapper)

    await day('2026-08-10').trigger('click')
    expect(wrapper.emitted('update:modelValue'), 'полупустой период значением не считается').toBeFalsy()

    await day('2026-08-14').trigger('click')

    expect(lastModel(wrapper)).toEqual([at(10), at(14)])
    expect(wrapper.emitted('update:open')?.at(-1)).toEqual([false])
    wrapper.unmount()
  })

  it('границы можно вести назад — порядок нормализуется', async () => {
    const wrapper = mountPicker()
    await openPicker(wrapper)

    await day('2026-08-20').trigger('click')
    await day('2026-08-05').trigger('click')

    expect(lastModel(wrapper)).toEqual([at(5), at(20)])
    wrapper.unmount()
  })

  it('период в один день допустим', async () => {
    const wrapper = mountPicker()
    await openPicker(wrapper)

    await day('2026-08-12').trigger('click')
    await day('2026-08-12').trigger('click')

    expect(lastModel(wrapper)).toEqual([at(12), at(12)])
    wrapper.unmount()
  })

  it('поле показывает обе границы через разделитель', () => {
    const wrapper = mountPicker({ modelValue: [at(10), at(14)] })

    expect((field(wrapper).element as HTMLInputElement).value).toBe('Aug 10, 2026 — Aug 14, 2026')
    wrapper.unmount()
  })

  it('незакрытый период не переживает закрытие панели', async () => {
    const wrapper = mountPicker()
    await openPicker(wrapper)
    await day('2026-08-10').trigger('click')

    // Панель закрыли снаружи, начало брошено.
    await wrapper.setProps({ open: false })
    await nextTick()
    await wrapper.setProps({ open: true })
    for (let i = 0; i < 4; i += 1) await nextTick()

    expect(inRange('2026-08-10'), 'показывать половину выбора значит врать о состоянии').toBe(false)
    wrapper.unmount()
  })
})

describe('GrDateRangePicker — подсветка', () => {
  it('выбранный период подсвечен полосой, края — заливкой', async () => {
    const wrapper = mountPicker({ modelValue: [at(10), at(14)] })
    await openPicker(wrapper)

    expect(inRange('2026-08-10')).toBe(true)
    expect(inRange('2026-08-12')).toBe(true)
    expect(inRange('2026-08-14')).toBe(true)
    expect(inRange('2026-08-15')).toBe(false)

    expect(day('2026-08-10').attributes('class')).toContain('--gr-calendar-selected-bg')
    expect(day('2026-08-12').attributes('class')).not.toContain('--gr-calendar-selected-bg')
    wrapper.unmount()
  })

  it('пока период открыт, наведение показывает предпросмотр', async () => {
    const wrapper = mountPicker()
    await openPicker(wrapper)

    await day('2026-08-10').trigger('click')
    await day('2026-08-13').trigger('mouseenter')

    expect(inRange('2026-08-12')).toBe(true)
    expect(inRange('2026-08-14')).toBe(false)
    wrapper.unmount()
  })

  it('без открытого периода наведение ничего не подсвечивает', async () => {
    const wrapper = mountPicker()
    await openPicker(wrapper)

    await day('2026-08-13').trigger('mouseenter')

    expect(inRange('2026-08-13')).toBe(false)
    wrapper.unmount()
  })

  it('предпросмотр работает и назад', async () => {
    const wrapper = mountPicker()
    await openPicker(wrapper)

    await day('2026-08-20').trigger('click')
    await day('2026-08-18').trigger('mouseenter')

    expect(inRange('2026-08-19')).toBe(true)
    expect(inRange('2026-08-21')).toBe(false)
    wrapper.unmount()
  })

  it('ячейки периода объявлены выбранными для скринридера', async () => {
    const wrapper = mountPicker({ modelValue: [at(10), at(12)] })
    await openPicker(wrapper)

    expect(cell('2026-08-11').attributes('aria-selected')).toBe('true')
    expect(cell('2026-08-13').attributes('aria-selected')).toBe('false')
    wrapper.unmount()
  })
})

describe('GrDateRangePicker — перф-инвариант', () => {
  it('движение мыши по сетке не пересобирает её', async () => {
    // Ради этого `buildCalendarGrid` и не знает про выбор: иначе каждый кадр
    // наведения создавал бы 42 объекта заново.
    const build = vi.spyOn(calendarGrid, 'buildCalendarGrid')

    const wrapper = mountPicker()
    await openPicker(wrapper)
    await day('2026-08-10').trigger('click')

    const before = build.mock.calls.length
    // Иначе тест зелен на нерабочем шпионе: 0 − 0 тоже даёт 0.
    expect(before, 'шпион не видит вызовов — проверять нечего').toBeGreaterThan(0)
    for (const key of ['2026-08-11', '2026-08-12', '2026-08-13', '2026-08-14']) {
      await day(key).trigger('mouseenter')
    }

    expect(build.mock.calls.length - before).toBe(0)
    build.mockRestore()
    wrapper.unmount()
  })

  it('наведение без открытого периода не перерисовывает сетку', async () => {
    // Подсвечивать нечего — значит и трогать состояние незачем: иначе каждое
    // движение мыши по уже выбранному периоду стоило бы 42 пересчёта классов.
    const rangeClass = vi.spyOn(calendarStyles, 'calendarRangeCellClass')

    const wrapper = mountPicker({ modelValue: [at(10), at(14)] })
    await openPicker(wrapper)

    const before = rangeClass.mock.calls.length
    expect(before, 'шпион не видит вызовов — проверять нечего').toBeGreaterThan(0)

    await day('2026-08-20').trigger('mouseenter')
    await day('2026-08-21').trigger('mouseenter')

    expect(rangeClass.mock.calls.length - before).toBe(0)
    rangeClass.mockRestore()
    wrapper.unmount()
  })
})

describe('GrDateRangePicker — ограничения длины', () => {
  it('слишком короткий период не выбирается и не сбрасывает начало', async () => {
    const wrapper = mountPicker({ minRange: 3 })
    await openPicker(wrapper)

    await day('2026-08-10').trigger('click')
    await day('2026-08-11').trigger('click')
    expect(wrapper.emitted('update:modelValue')).toBeFalsy()

    // Начало на месте — достаточно домахнуться до допустимой длины.
    await day('2026-08-12').trigger('click')
    expect(lastModel(wrapper)).toEqual([at(10), at(12)])
    wrapper.unmount()
  })

  it('слишком длинный период не выбирается', async () => {
    const wrapper = mountPicker({ maxRange: 5 })
    await openPicker(wrapper)

    await day('2026-08-10').trigger('click')
    await day('2026-08-20').trigger('click')
    expect(wrapper.emitted('update:modelValue')).toBeFalsy()

    await day('2026-08-14').trigger('click')
    expect(lastModel(wrapper)).toEqual([at(10), at(14)])
    wrapper.unmount()
  })

  it('длина считает обе границы: 10–12 августа — это три дня', async () => {
    const wrapper = mountPicker({ maxRange: 3 })
    await openPicker(wrapper)

    await day('2026-08-10').trigger('click')
    await day('2026-08-12').trigger('click')

    expect(lastModel(wrapper)).toEqual([at(10), at(12)])
    wrapper.unmount()
  })
})

describe('GrDateRangePicker — объявления для скринридера', () => {
  it('первый клик объявляет, что выбрано начало и ждут конца', async () => {
    // Видимого выбора первый клик не делает: без объявления незрячий
    // пользователь не понимает, что от него ждут второй даты.
    const wrapper = mountPicker()
    await openPicker(wrapper)

    await day('2026-08-10').trigger('click')

    expect(await announced()).toBe('Start date selected: August 10, 2026. Choose the end date')
    wrapper.unmount()
  })

  it('второй клик объявляет обе границы периода', async () => {
    const wrapper = mountPicker()
    await openPicker(wrapper)

    await day('2026-08-10').trigger('click')
    await day('2026-08-14').trigger('click')

    expect(await announced()).toBe('Range selected: August 10, 2026 — August 14, 2026')
    wrapper.unmount()
  })

  it('границы, набранные назад, объявляются по порядку', async () => {
    const wrapper = mountPicker()
    await openPicker(wrapper)

    await day('2026-08-14').trigger('click')
    await day('2026-08-10').trigger('click')

    expect(await announced()).toBe('Range selected: August 10, 2026 — August 14, 2026')
    wrapper.unmount()
  })

  it('промах мимо допустимой длины объявляется отказом, а не тишиной', async () => {
    // Иначе клик выглядит потерянным: ничего не выбралось и ничего не сказано.
    const wrapper = mountPicker({ minRange: 3 })
    await openPicker(wrapper)

    await day('2026-08-10').trigger('click')
    await day('2026-08-11').trigger('click')

    expect(await announced()).toBe('This range length is not allowed')
    wrapper.unmount()
  })

  it('календарь внутри диапазона свой день не объявляет — объявляет оболочка', async () => {
    const wrapper = mountPicker()
    await openPicker(wrapper)

    expect(query('[data-gr-calendar]').exists()).toBe(true)
    await day('2026-08-10').trigger('click')

    // Одно объявление на клик: два перебили бы друг друга в общем регионе.
    expect(await announced()).not.toBe('August 10, 2026')
    wrapper.unmount()
  })
})

describe('GrDateRangePicker — негативные сценарии и форма', () => {
  it('disabled не открывает панель', async () => {
    const wrapper = mountPicker({ disabled: true })
    await openPicker(wrapper)

    expect(document.querySelector('[data-gr-date-range-picker-panel]')).toBeNull()
    wrapper.unmount()
  })

  it('readonly открывает панель, но период не набирается', async () => {
    const wrapper = mountPicker({ readonly: true })
    await openPicker(wrapper)

    await day('2026-08-10').trigger('click')
    await day('2026-08-14').trigger('click')

    expect(wrapper.emitted('update:modelValue')).toBeFalsy()
    wrapper.unmount()
  })

  it('запрещённые дни в период не попадают', async () => {
    const wrapper = mountPicker({ min: at(10) })
    await openPicker(wrapper)

    await day('2026-08-05').trigger('click')
    await day('2026-08-14').trigger('click')

    // Первый клик по запрещённому дню сетка гасит сама — периода не начинали.
    expect(wrapper.emitted('update:modelValue')).toBeFalsy()
    wrapper.unmount()
  })

  it('форме уходят обе границы двумя полями с одним именем', () => {
    const wrapper = mountPicker({
      modelValue: ['2026-08-10', '2026-08-14'],
      valueAdapter: 'isoDate',
      name: 'stay',
    })
    const hidden = wrapper.findAll('input[type="hidden"]')

    expect(hidden).toHaveLength(2)
    expect(hidden.map(input => (input.element as HTMLInputElement).value)).toEqual(['2026-08-10', '2026-08-14'])
    expect(hidden.every(input => input.attributes('name') === 'stay')).toBe(true)
    wrapper.unmount()
  })

  it('адаптер isoDate отдаёт пару строк', async () => {
    const wrapper = mountPicker({ modelValue: null, valueAdapter: 'isoDate' })
    await openPicker(wrapper)

    await day('2026-08-10').trigger('click')
    await day('2026-08-14').trigger('click')

    expect(lastModel(wrapper)).toEqual(['2026-08-10', '2026-08-14'])
    wrapper.unmount()
  })

  it('полупустая модель значением не считается', () => {
    // Одна граница — это не диапазон: поле остаётся пустым, а не показывает половину.
    const wrapper = mountPicker({ modelValue: [at(10)] as never })

    expect((field(wrapper).element as HTMLInputElement).value).toBe('')
    wrapper.unmount()
  })

  it('очистка отдаёт null и своё событие', async () => {
    const wrapper = mountPicker({ modelValue: [at(10), at(14)], clearable: true })

    await wrapper.get('[data-gr-date-range-picker-clear]').trigger('click')

    expect(lastModel(wrapper)).toBeNull()
    expect(wrapper.emitted('clear')).toHaveLength(1)
    wrapper.unmount()
  })
})

describe('GrDateRangePicker — inline', () => {
  it('сетка на месте, поля нет, период набирается', async () => {
    const wrapper = mountPicker({ inline: true })
    for (let i = 0; i < 4; i += 1) await nextTick()

    expect(document.querySelector('[data-gr-date-range-picker-field]')).toBeNull()

    await day('2026-08-10').trigger('click')
    await day('2026-08-13').trigger('mouseenter')
    expect(inRange('2026-08-12')).toBe(true)

    await day('2026-08-14').trigger('click')
    expect(lastModel(wrapper)).toEqual([at(10), at(14)])
    wrapper.unmount()
  })
})

describe('GrDateRangePicker — проброс слота шапки недели', () => {
  it('слот weekday доходит до сетки вместе с ISO-номером дня', async () => {
    // Слот объявлен на пикере, а рендерит его вложенный `GrCalendar`: без
    // проброса потребитель переопределял бы шапку только у голой сетки.
    const wrapper = mount(GrDateRangePicker, {
      props: { locale: 'en-US', today: TODAY, weekStart: 1 },
      slots: { weekday: `<template #weekday="{ label, isoWeekday }"><i :data-iso="isoWeekday">{{ label[0] }}</i></template>` },
      attachTo: document.body,
    })
    await openPicker(wrapper)

    const cells = [...document.querySelectorAll('[data-gr-calendar-weekday] i')]

    expect(cells.map(cell => cell.textContent)).toEqual(['M', 'T', 'W', 'T', 'F', 'S', 'S'])
    expect(cells[0]!.getAttribute('data-iso')).toBe('1')
    wrapper.unmount()
  })
})
