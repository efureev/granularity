import { DOMWrapper, mount } from '@vue/test-utils'
import { nextTick } from 'vue'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { announced, resetGranularityDom } from '@feugene/granularity/testing'
import { queryOne } from '@feugene/granularity-test-kit/vue'

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
const query = (selector: string): DOMWrapper<HTMLElement> => new DOMWrapper(queryOne(selector))

function day(key: string) {
  return query(`[data-gr-calendar-day][data-key="${key}"]`)
}

/** Ячейка таблицы под днём: полосу диапазона рисует она, а не сам день. */
function cell(key: string) {
  const element = document.querySelector(`[data-gr-calendar-day][data-key="${key}"]`)?.closest('td')
  if (!element)
    throw new Error(`нет ячейки ${key}`)

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

describe('готовые периоды', () => {
  function presets(): DOMWrapper<HTMLElement>[] {
    return [...document.querySelectorAll<HTMLElement>('[data-gr-date-range-picker-preset]')]
      .map(el => new DOMWrapper(el))
  }

  const thisWeek = { label: 'Эта неделя', range: [at(10), at(16)] as const }

  it('одно нажатие ставит обе границы и закрывает панель', async () => {
    const wrapper = mountPicker({ presets: [thisWeek] })
    await openPicker(wrapper)

    await presets()[0]!.trigger('click')
    await nextTick()

    expect(lastModel(wrapper)).toEqual([at(10), at(16)])
    // Панель остаётся смонтированной (`v-show` у поповера), закрытие видно по `v-model:open`.
    expect(wrapper.emitted('update:open')?.at(-1)?.[0]).toBe(false)

    wrapper.unmount()
  })

  it('период длиннее `maxRange` приходит выключенным и модель не меняет', async () => {
    const wrapper = mountPicker({ presets: [thisWeek], maxRange: 3 })
    await openPicker(wrapper)

    expect(presets()[0]!.attributes('disabled')).toBeDefined()

    await presets()[0]!.trigger('click')
    await nextTick()

    expect(wrapper.emitted('update:modelValue')).toBeUndefined()

    wrapper.unmount()
  })

  it('граница на запрещённой дате выключает шорткат так же, как сетка гасит день', async () => {
    const wrapper = mountPicker({ presets: [thisWeek], disabledDates: [at(16)] })
    await openPicker(wrapper)

    expect(presets()[0]!.attributes('disabled')).toBeDefined()

    wrapper.unmount()
  })

  it('граница за `max` выключает шорткат', async () => {
    const wrapper = mountPicker({ presets: [thisWeek], max: at(14) })
    await openPicker(wrapper)

    expect(presets()[0]!.attributes('disabled')).toBeDefined()

    wrapper.unmount()
  })

  it('`readonly` не даёт применить шорткат ни одним способом', async () => {
    const wrapper = mountPicker({ presets: [thisWeek], readonly: true })
    await openPicker(wrapper)

    expect(presets()[0]!.attributes('disabled')).toBeDefined()

    await presets()[0]!.trigger('click')
    await nextTick()

    expect(wrapper.emitted('update:modelValue')).toBeUndefined()

    wrapper.unmount()
  })

  it('выбор периода объявляется вслух — как и второй клик по сетке', async () => {
    const wrapper = mountPicker({ presets: [thisWeek] })
    await openPicker(wrapper)

    await presets()[0]!.trigger('click')

    expect(await announced()).toContain('August 10')

    wrapper.unmount()
  })

  it('границы-функция пересчитываются, а не замораживаются на момент объявления', async () => {
    // «Последние 7 дней» отсчитываются от сегодняшнего дня, а не от дня, когда
    // объявили проп.
    const range = vi.fn(() => [at(11), at(12)] as const)
    const wrapper = mountPicker({ presets: [{ label: 'Последние 2 дня', range }] })
    await openPicker(wrapper)

    const beforeClick = range.mock.calls.length
    await presets()[0]!.trigger('click')

    expect(beforeClick).toBeGreaterThan(0)
    expect(range.mock.calls.length).toBeGreaterThan(beforeClick)
    expect(lastModel(wrapper)).toEqual([at(11), at(12)])

    wrapper.unmount()
  })

  it('свой подвал заменяет ряд целиком и получает рабочий `setRange`', async () => {
    const wrapper = mount(GrDateRangePicker, {
      props: { locale: 'en-US', today: TODAY, presets: [thisWeek] },
      slots: { footer: '<button data-own @click="params.setRange(new Date(2026, 7, 3), new Date(2026, 7, 5))">свой</button>' },
      attachTo: document.body,
    })
    await openPicker(wrapper)

    expect(document.querySelector('[data-gr-date-range-picker-preset]')).toBeNull()

    await query('[data-own]').trigger('click')
    await nextTick()

    expect(lastModel(wrapper)).toEqual([at(3), at(5)])

    wrapper.unmount()
  })

  it('подвал стоит в панели, а не внутри сетки календаря', async () => {
    // Внутри `[data-gr-calendar]` у подвала не было бы собственного отступа:
    // панель отдаёт фон и паддинг календарю.
    const wrapper = mountPicker({ presets: [thisWeek] })
    await openPicker(wrapper)

    const row = document.querySelector('[data-gr-date-range-picker-presets]')!

    expect(row.closest('[data-gr-date-range-picker-panel]')).not.toBeNull()
    expect(row.closest('[data-gr-calendar]')).toBeNull()

    wrapper.unmount()
  })
})

/**
 * Период с точностью до минут. Предмет проверок не «колонки нарисовались», а
 * две вещи, которых у диапазона по датам не было вовсе: умолчание «сутки
 * целиком» и порядок краёв внутри одного дня, который держит только время.
 */
describe('GrDateRangePicker — время границ', () => {
  function times(wrapper: Picker): [Date, Date] {
    return lastModel(wrapper) as [Date, Date]
  }

  function hm(date: Date): string {
    return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`
  }

  /**
   * Компонент управляемый: без возврата значения в проп `selected` остаётся
   * пустым, и колонки времени не появятся — им нечего править.
   */
  async function pickRange(wrapper: Picker) {
    await openPicker(wrapper)
    await day('2026-08-12').trigger('click')
    await day('2026-08-14').trigger('click')
    await nextTick()

    const emitted = lastModel(wrapper)
    if (emitted)
      await wrapper.setProps({ modelValue: emitted as readonly [Date, Date] })
    await nextTick()
  }

  /**
   * Две полуночи молча отрезали бы почти весь последний день: «с 12 по 14»
   * по-человечески включает всё четырнадцатое.
   */
  it('свежий период получает сутки целиком', async () => {
    const wrapper = mountPicker({ enableTime: true })
    await pickRange(wrapper)

    const [from, to] = times(wrapper)
    expect([hm(from), hm(to)]).toEqual(['00:00', '23:59'])
  })

  /**
   * 23:59 при шаге в 15 минут в колонке отсутствует: минуты остались бы без
   * выбранного варианта, и конец периода нельзя было бы прочитать там, где его
   * правят. Умолчание обязано лежать на той же сетке, что и столбец.
   */
  it('с крупным шагом конец кладётся на последний доступный слот', async () => {
    const wrapper = mountPicker({ enableTime: true, minuteStep: 15 })
    await pickRange(wrapper)

    expect(hm(times(wrapper)[1])).toBe('23:45')
  })

  it('с секундами конец — 23:59:59', async () => {
    const wrapper = mountPicker({ enableTime: true, enableSeconds: true })
    await pickRange(wrapper)

    expect(times(wrapper)[1].getSeconds()).toBe(59)
  })

  it('без `enableTime` обе границы остаются полуночью', async () => {
    const wrapper = mountPicker()
    await pickRange(wrapper)

    const [from, to] = times(wrapper)
    expect([hm(from), hm(to)]).toEqual(['00:00', '00:00'])
    expect(document.querySelector('[data-gr-date-range-picker-times]')).toBeNull()
  })

  it('колонки времени появляются только после выбора периода', async () => {
    const wrapper = mountPicker({ enableTime: true })
    await openPicker(wrapper)

    expect(document.querySelector('[data-gr-date-range-picker-times]')).toBeNull()

    await day('2026-08-12').trigger('click')
    await day('2026-08-14').trigger('click')
    await nextTick()
    await wrapper.setProps({ modelValue: lastModel(wrapper) as readonly [Date, Date] })
    await nextTick()

    expect(document.querySelectorAll('[data-gr-date-range-picker-time]')).toHaveLength(2)
  })

  it('поле показывает и дату, и время', async () => {
    const wrapper = mountPicker({ enableTime: true })
    await pickRange(wrapper)
    await nextTick()

    expect(field(wrapper).attributes('value')).toMatch(/\d{1,2}:\d{2}/)
  })
})

/**
 * Порядок краёв внутри одного дня держит только время: по датам они равны.
 * Раньше такого случая не существовало, и это единственное место, где время
 * добавляет новое правило, а не новое поле.
 */
describe('GrDateRangePicker — порядок краёв со временем', () => {
  function timeOption(edge: 0 | 1, unit: string, value: string) {
    const block = document.querySelectorAll('[data-gr-date-range-picker-time]')[edge]
    const option = [...(block?.querySelectorAll(`[data-unit="${unit}"] [role="option"]`) ?? [])]
      .find(el => el.textContent?.trim() === value)

    if (!option)
      throw new Error(`нет варианта ${unit}=${value} у края ${edge}`)

    return new DOMWrapper(option as HTMLElement)
  }

  async function sameDayRange() {
    // 24 часа явно: у `en-US` колонка двенадцатичасовая, и «07» при PM — это 19:00.
    const wrapper = mountPicker({ enableTime: true, use12Hours: false })
    await field(wrapper).trigger('click')
    for (let i = 0; i < 4; i += 1) await nextTick()

    await day('2026-08-12').trigger('click')
    await day('2026-08-12').trigger('click')
    await nextTick()
    await wrapper.setProps({ modelValue: lastModel(wrapper) as readonly [Date, Date] })
    await nextTick()

    return wrapper
  }

  it('правка времени меняет свой край и не трогает второй', async () => {
    const wrapper = await sameDayRange()

    await timeOption(0, 'hour', '08').trigger('click')
    await nextTick()

    const [from, to] = lastModel(wrapper) as [Date, Date]
    expect(from.getHours()).toBe(8)
    expect([to.getHours(), to.getMinutes()]).toEqual([23, 59])
  })

  it('конец раньше начала внутри одного дня не применяется', async () => {
    const wrapper = await sameDayRange()

    // Начало в 08:00, затем попытка увести конец на 07:00.
    await timeOption(0, 'hour', '08').trigger('click')
    await nextTick()
    await wrapper.setProps({ modelValue: lastModel(wrapper) as readonly [Date, Date] })
    await nextTick()

    await timeOption(1, 'hour', '07').trigger('click')
    await nextTick()
    // Отказ объявляется тиком позже, чтобы не быть перебитым колонками.
    await nextTick()

    // Сравниваем исход, а не ссылку: перерисовка вправе переиздать то же значение.
    const [from, to] = lastModel(wrapper) as [Date, Date]
    expect(to.getTime()).toBeGreaterThanOrEqual(from.getTime())
    expect(to.getHours()).toBe(23)
    expect(await announced()).toContain('The end must not come before the start')
  })
})

describe('GrDateRangePicker — ручной ввод', () => {
  function atTime(day: number, hour = 0, minute = 0): Date {
    return new Date(2026, 7, day, hour, minute)
  }

  async function type(wrapper: Picker, text: string) {
    const input = field(wrapper)
    ;(input.element as HTMLInputElement).value = text
    await input.trigger('input')
  }

  async function commit(wrapper: Picker, text: string) {
    await type(wrapper, text)
    await field(wrapper).trigger('keydown', { key: 'Enter' })
  }

  it('без `editable` поле остаётся readonly и текста не принимает', async () => {
    const wrapper = mountPicker({ modelValue: [at(12), at(14)] })

    expect(field(wrapper).attributes('readonly')).toBeDefined()
    await commit(wrapper, '08/16/2026 — 08/18/2026')

    expect(wrapper.emitted('update:modelValue')).toBeUndefined()
    wrapper.unmount()
  })

  it('строка из двух дат становится периодом', async () => {
    const wrapper = mountPicker({ editable: true })

    await commit(wrapper, '08/16/2026 — 08/18/2026')

    expect(lastModel(wrapper)).toEqual([at(16), at(18)])
    wrapper.unmount()
  })

  it('поле показывает период тем же видом, какой принимает обратно', async () => {
    const wrapper = mountPicker({ editable: true, modelValue: [at(12), at(14)] })

    const shown = (field(wrapper).element as HTMLInputElement).value
    expect(shown).toBe('08/12/2026 — 08/14/2026')

    // Круг замкнулся: показанное разбирается обратно в ту же пару.
    await commit(wrapper, shown)
    expect(lastModel(wrapper)).toEqual([at(12), at(14)])
    wrapper.unmount()
  })

  it('обратный порядок нормализуется, как и при кликах', async () => {
    const wrapper = mountPicker({ editable: true })

    await commit(wrapper, '08/18/2026 — 08/16/2026')

    expect(lastModel(wrapper)).toEqual([at(16), at(18)])
    wrapper.unmount()
  })

  it('одна дата — не период: набранное откатывается', async () => {
    const wrapper = mountPicker({ editable: true, modelValue: [at(12), at(14)] })

    await commit(wrapper, '08/16/2026')

    expect(wrapper.emitted('update:modelValue')).toBeUndefined()
    expect((field(wrapper).element as HTMLInputElement).value).toBe('08/12/2026 — 08/14/2026')
    wrapper.unmount()
  })

  it('недопустимая длина отклоняется и объявляется', async () => {
    const wrapper = mountPicker({ editable: true, maxRange: 3 })

    await commit(wrapper, '08/16/2026 — 08/26/2026')

    expect(wrapper.emitted('update:modelValue')).toBeUndefined()
    expect(await announced()).toBe('This range length is not allowed')
    wrapper.unmount()
  })

  it('запрещённая граница не принимается текстом', async () => {
    const wrapper = mountPicker({ editable: true, disabledDates: [at(18)] })

    await commit(wrapper, '08/16/2026 — 08/18/2026')

    expect(wrapper.emitted('update:modelValue')).toBeUndefined()
    wrapper.unmount()
  })

  it('со временем набираются обе границы целиком', async () => {
    const wrapper = mountPicker({ editable: true, enableTime: true, use12Hours: false })

    await commit(wrapper, '08/16/2026, 08:00 — 08/18/2026, 20:30')

    expect(lastModel(wrapper)).toEqual([atTime(16, 8, 0), atTime(18, 20, 30)])
    wrapper.unmount()
  })

  it('время принимается ровно тогда, когда пикер его показывает', async () => {
    const withTime = mountPicker({ editable: true, enableTime: true, use12Hours: false })
    await commit(withTime, '08/16/2026 — 08/18/2026')
    expect(withTime.emitted('update:modelValue')).toBeUndefined()
    withTime.unmount()

    const withoutTime = mountPicker({ editable: true })
    await commit(withoutTime, '08/16/2026, 08:00 — 08/18/2026, 20:30')
    expect(withoutTime.emitted('update:modelValue')).toBeUndefined()
    withoutTime.unmount()
  })

  it('уход фокуса фиксирует набранное, а `applyOnBlur=false` — нет', async () => {
    const wrapper = mountPicker({ editable: true })
    await type(wrapper, '08/16/2026 — 08/18/2026')
    await field(wrapper).trigger('blur')
    expect(lastModel(wrapper)).toEqual([at(16), at(18)])
    wrapper.unmount()

    const strict = mountPicker({ editable: true, applyOnBlur: false })
    await type(strict, '08/16/2026 — 08/18/2026')
    await field(strict).trigger('blur')
    expect(strict.emitted('update:modelValue')).toBeUndefined()
    strict.unmount()
  })

  it('`readonly` не принимает набранное', async () => {
    const wrapper = mountPicker({ editable: true, readonly: true, modelValue: [at(12), at(14)] })

    await commit(wrapper, '08/16/2026 — 08/18/2026')

    expect(wrapper.emitted('update:modelValue')).toBeUndefined()
    wrapper.unmount()
  })

  it('ввод строкой закрывает период, начатый кликом в панели', async () => {
    const wrapper = mountPicker({ editable: true })
    await openPicker(wrapper)

    await day('2026-08-20').trigger('click')
    await commit(wrapper, '08/16/2026 — 08/18/2026')
    expect(lastModel(wrapper)).toEqual([at(16), at(18)])

    // Начало, оставшееся от клика, снято: иначе следующий клик закрыл бы период
    // от 20-го, о котором в поле уже ничего не написано.
    await day('2026-08-22').trigger('click')
    await nextTick()

    expect(lastModel(wrapper)).toEqual([at(16), at(18)])
    expect(await announced()).toContain('Start date selected')
    wrapper.unmount()
  })

  it('плейсхолдер по умолчанию показывает обе границы', () => {
    const plain = mountPicker({ editable: true })
    expect(field(plain).attributes('placeholder')).toBe('MM/DD/YYYY — MM/DD/YYYY')
    plain.unmount()

    const timed = mountPicker({ editable: true, enableTime: true, use12Hours: false })
    expect(field(timed).attributes('placeholder')).toBe('MM/DD/YYYY, HH:MM — MM/DD/YYYY, HH:MM')
    timed.unmount()
  })
})

describe('GrDateRangePicker — время готовых периодов', () => {
  /**
   * Шорткат обязан давать то же, что две даты кликом: иначе «последние 7 дней»
   * с `enable-time` молча отрезали бы последние сутки.
   */
  it('с `enable-time` готовый период получает 00:00 и конец суток', async () => {
    const wrapper = mountPicker({
      enableTime: true,
      use12Hours: false,
      presets: [{ label: 'Эта неделя', range: [at(10), at(16)] as const }],
    })
    await openPicker(wrapper)

    await new DOMWrapper(queryOne('[data-gr-date-range-picker-preset]')).trigger('click')
    await nextTick()

    expect(lastModel(wrapper)).toEqual([
      new Date(2026, 7, 10, 0, 0, 0),
      new Date(2026, 7, 16, 23, 59, 0),
    ])
    wrapper.unmount()
  })
})

describe('GrDateRangePicker — панель идёт за набором', () => {
  async function type(wrapper: Picker, text: string) {
    const input = field(wrapper)
    ;(input.element as HTMLInputElement).value = text
    await input.trigger('input')
  }

  it('первая набранная граница подсвечивается началом периода', async () => {
    const wrapper = mountPicker({ editable: true })
    await openPicker(wrapper)

    await type(wrapper, '08/16/2026')
    await nextTick()

    expect(day('2026-08-16').attributes('class')).toContain('--gr-calendar-selected-bg')
    expect(wrapper.emitted('update:modelValue')).toBeUndefined()
    wrapper.unmount()
  })

  it('обе набранные границы подсвечивают полосу между ними', async () => {
    const wrapper = mountPicker({ editable: true })
    await openPicker(wrapper)

    await type(wrapper, '08/16/2026 — 08/20/2026')
    await nextTick()

    expect(inRange('2026-08-18')).toBe(true)
    expect(inRange('2026-08-22')).toBe(false)
    wrapper.unmount()
  })

  it('сетка переходит на месяц набранного', async () => {
    const wrapper = mountPicker({ editable: true })
    await openPicker(wrapper)

    await type(wrapper, '09/23/2026')
    await nextTick()

    expect(query('[data-gr-calendar-title]').text()).toContain('September')
    wrapper.unmount()
  })

  it('недобранная строка не гасит уже набранную границу', async () => {
    const wrapper = mountPicker({ editable: true })
    await openPicker(wrapper)

    // Чётное число групп цифр делится пополам, и половинки не разбираются, —
    // подсветка обязана остаться на первой границе, а не мигать по дороге.
    await type(wrapper, '08/16/2026 — 08')
    await nextTick()

    expect(day('2026-08-16').attributes('class')).toContain('--gr-calendar-selected-bg')
    wrapper.unmount()
  })
})
