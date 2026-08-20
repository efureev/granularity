import { mount } from '@vue/test-utils'
import { defineComponent, nextTick } from 'vue'
import { afterEach, describe, expect, it } from 'vitest'

import { announced, resetGranularityDom } from '@feugene/granularity/testing'

import type { PlainDate } from '../../../chrono/plainDate'
import GrConfigProvider from '@feugene/granularity/components/GrConfigProvider'

import GrCalendar from '../GrCalendar.vue'

function iso(value: string): PlainDate {
  const [y, m, d] = value.split('-').map(Number) as [number, number, number]
  return { y, m: m - 1, d }
}

/** Август 2026: 1-е — суббота. «Сегодня» задаётся явно — тесты не зависят от часов. */
function mountCalendar(props: Record<string, unknown> = {}) {
  return mount(GrCalendar, {
    props: { viewDate: iso('2026-08-01'), today: iso('2026-08-12'), locale: 'en-US', weekStart: 1, ...props },
    attachTo: document.body,
  })
}

function days(wrapper: ReturnType<typeof mountCalendar>) {
  return wrapper.findAll('[data-gr-calendar-day]')
}

function keyOf(wrapper: ReturnType<typeof mountCalendar>, index: number) {
  return days(wrapper)[index]!.attributes('data-key')
}

function tabStops(wrapper: ReturnType<typeof mountCalendar>) {
  return days(wrapper).filter(day => day.attributes('tabindex') === '0').map(day => day.attributes('data-key'))
}

async function press(wrapper: ReturnType<typeof mountCalendar>, key: string, init: Record<string, unknown> = {}) {
  await wrapper.get('[data-gr-calendar-grid]').trigger('keydown', { key, ...init })
  await nextTick()
}

afterEach(resetGranularityDom)

describe('GrCalendar — разметка и роли', () => {
  it('сетка объявлена как grid и связана с заголовком', () => {
    const wrapper = mountCalendar()
    const grid = wrapper.get('[data-gr-calendar-grid]')

    expect(grid.attributes('role')).toBe('grid')
    expect(grid.attributes('aria-labelledby')).toBe(wrapper.get('[data-gr-calendar-title]').attributes('id'))
    expect(wrapper.findAll('[role="gridcell"]')).toHaveLength(42)
    wrapper.unmount()
  })

  it('собственное имя перебивает связку с заголовком', () => {
    const wrapper = mountCalendar({ ariaLabel: 'Дата вылета' })
    const grid = wrapper.get('[data-gr-calendar-grid]')

    expect(grid.attributes('aria-label')).toBe('Дата вылета')
    expect(grid.attributes('aria-labelledby')).toBeUndefined()
    wrapper.unmount()
  })

  it('шапка недели несёт полное название в abbr', () => {
    // Скринридер прочёл бы «Mon» по буквам.
    const wrapper = mountCalendar()
    const first = wrapper.findAll('[data-gr-calendar-weekday] abbr')[0]!

    expect(first.text()).toBe('Mon')
    expect(first.attributes('title')).toBe('Monday')
    wrapper.unmount()
  })

  it('слот weekday получает подпись, полное название и ISO-номер дня', () => {
    const wrapper = mount(GrCalendar, {
      props: { viewDate: iso('2026-08-01'), today: iso('2026-08-12'), locale: 'en-US', weekStart: 1 },
      slots: {
        weekday: `<template #weekday="{ label, full, isoWeekday }">
          <i :data-iso="isoWeekday" :title="full">{{ label[0] }}</i>
        </template>`,
      },
      attachTo: document.body,
    })

    const cells = wrapper.findAll('[data-gr-calendar-weekday] i')

    expect(cells).toHaveLength(7)
    expect(cells.map(cell => cell.text())).toEqual(['M', 'T', 'W', 'T', 'F', 'S', 'S'])
    expect(cells[0]!.attributes('title')).toBe('Monday')
    // Номер дня — по ISO, а не по колонке: иначе выходные пришлось бы вычислять
    // из того, с какого дня локаль начинает неделю.
    expect(cells.map(cell => cell.attributes('data-iso'))).toEqual(['1', '2', '3', '4', '5', '6', '7'])
    expect(wrapper.find('[data-gr-calendar-weekday] abbr').exists(), 'подпись по умолчанию заменена').toBe(false)
    wrapper.unmount()
  })

  it('слот weekday нумерует дни от первого дня недели, а не от понедельника', () => {
    // Воскресная неделя: первая колонка — 7, последняя — 6.
    const wrapper = mount(GrCalendar, {
      props: { viewDate: iso('2026-08-01'), locale: 'en-US', weekStart: 7 },
      slots: { weekday: `<template #weekday="{ isoWeekday }"><i :data-iso="isoWeekday" /></template>` },
      attachTo: document.body,
    })

    expect(wrapper.findAll('[data-gr-calendar-weekday] i').map(cell => cell.attributes('data-iso')))
      .toEqual(['7', '1', '2', '3', '4', '5', '6'])
    wrapper.unmount()
  })

  it('«сегодня» помечен aria-current, выбранный — aria-selected', () => {
    const wrapper = mountCalendar({ modelValue: iso('2026-08-20') })

    expect(wrapper.get('[data-key="2026-08-12"]').attributes('aria-current')).toBe('date')
    const selected = wrapper.findAll('[role="gridcell"][aria-selected="true"]')
    expect(selected).toHaveLength(1)
    expect(selected[0]!.find('[data-gr-calendar-day]').attributes('data-key')).toBe('2026-08-20')
    wrapper.unmount()
  })

  it('номера недель показываются по требованию и объявлены заголовками строк', () => {
    const wrapper = mountCalendar({ showWeekNumbers: true })
    const numbers = wrapper.findAll('[data-gr-calendar-week-number]')

    expect(numbers).toHaveLength(6)
    expect(numbers[0]!.text()).toBe('31')
    expect(numbers[0]!.attributes('scope')).toBe('row')
    wrapper.unmount()
  })
})

describe('GrCalendar — остановка Tab', () => {
  it('ровно одна на всю сетку', () => {
    const wrapper = mountCalendar()

    expect(tabStops(wrapper)).toHaveLength(1)
    wrapper.unmount()
  })

  it('без выбора стоит на первом дне месяца, а не на доборе соседнего', () => {
    const wrapper = mountCalendar()

    expect(tabStops(wrapper)).toEqual(['2026-08-01'])
    wrapper.unmount()
  })

  it('с выбором — на выбранном дне', () => {
    const wrapper = mountCalendar({ modelValue: iso('2026-08-20') })

    expect(tabStops(wrapper)).toEqual(['2026-08-20'])
    wrapper.unmount()
  })

  it('выбор в другом месяце остановку не забирает', () => {
    // Иначе `Tab` вёл бы в ячейку, которой в сетке нет.
    const wrapper = mountCalendar({ modelValue: iso('2025-01-15') })

    expect(tabStops(wrapper)).toEqual(['2026-08-01'])
    wrapper.unmount()
  })
})

describe('GrCalendar — клавиатура паттерна grid', () => {
  it('стрелки ходят по дням и по неделям', async () => {
    const wrapper = mountCalendar()

    await press(wrapper, 'ArrowRight')
    expect(tabStops(wrapper)).toEqual(['2026-08-02'])

    await press(wrapper, 'ArrowDown')
    expect(tabStops(wrapper)).toEqual(['2026-08-09'])

    await press(wrapper, 'ArrowLeft')
    expect(tabStops(wrapper)).toEqual(['2026-08-08'])

    await press(wrapper, 'ArrowUp')
    expect(tabStops(wrapper)).toEqual(['2026-08-01'])
    wrapper.unmount()
  })

  it('Home и End — края недели, а не месяца', async () => {
    const wrapper = mountCalendar()
    await press(wrapper, 'ArrowDown') // 8 августа, суббота второй строки

    await press(wrapper, 'Home')
    expect(tabStops(wrapper)).toEqual(['2026-08-03']) // понедельник той же недели

    await press(wrapper, 'End')
    expect(tabStops(wrapper)).toEqual(['2026-08-09']) // воскресенье той же недели
    wrapper.unmount()
  })

  it('PageUp и PageDown листают месяц', async () => {
    const wrapper = mountCalendar()

    await press(wrapper, 'PageDown')
    expect(wrapper.emitted('periodChange')?.at(-1)?.[0]).toEqual(iso('2026-09-01'))

    await press(wrapper, 'PageUp')
    await press(wrapper, 'PageUp')
    expect(wrapper.emitted('periodChange')?.at(-1)?.[0]).toEqual(iso('2026-07-01'))
    wrapper.unmount()
  })

  it('Shift с PageUp и PageDown листает год', async () => {
    const wrapper = mountCalendar()

    await press(wrapper, 'PageDown', { shiftKey: true })
    expect(wrapper.emitted('periodChange')?.at(-1)?.[0]).toEqual(iso('2027-08-01'))
    wrapper.unmount()
  })

  it('стрелка за нижний край листает месяц вперёд, а не прокручивает страницу', async () => {
    const wrapper = mountCalendar()
    const event = new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true, cancelable: true })

    // Шесть строк вниз — гарантированно за край сетки.
    for (let i = 0; i < 6; i += 1) await press(wrapper, 'ArrowDown')
    wrapper.get('[data-gr-calendar-grid]').element.dispatchEvent(event)

    expect(event.defaultPrevented).toBe(true)
    expect(wrapper.emitted('periodChange')).toBeTruthy()
    wrapper.unmount()
  })

  it('Enter и Space выбирают день под остановкой', async () => {
    const wrapper = mountCalendar()

    await press(wrapper, 'ArrowRight')
    await press(wrapper, 'Enter')
    expect(wrapper.emitted('update:modelValue')?.at(-1)?.[0]).toEqual(iso('2026-08-02'))

    await press(wrapper, 'ArrowRight')
    await press(wrapper, ' ')
    expect(wrapper.emitted('update:modelValue')?.at(-1)?.[0]).toEqual(iso('2026-08-03'))
    wrapper.unmount()
  })
})

describe('GrCalendar — запреты и границы', () => {
  it('день вне min и max отмечен и не выбирается', async () => {
    const wrapper = mountCalendar({ min: iso('2026-08-10'), max: iso('2026-08-20') })
    const early = wrapper.get('[data-key="2026-08-05"]')

    expect(early.attributes('aria-disabled')).toBe('true')
    await early.trigger('click')
    expect(wrapper.emitted('update:modelValue')).toBeFalsy()
    wrapper.unmount()
  })

  it('запрещённый день остаётся в обходе стрелками', async () => {
    // У него `aria-disabled`, а не нативный `disabled`: прыжок через него
    // молча поменял бы семантику стрелок.
    const wrapper = mountCalendar({ disabledDates: [iso('2026-08-02')] })

    await press(wrapper, 'ArrowRight')
    expect(tabStops(wrapper)).toEqual(['2026-08-02'])
    wrapper.unmount()
  })

  it('листание не уходит за границы', () => {
    const wrapper = mountCalendar({ min: iso('2026-08-01'), max: iso('2026-08-31') })

    expect(wrapper.get('[data-gr-calendar-prev]').attributes('disabled')).toBeDefined()
    expect(wrapper.get('[data-gr-calendar-next]').attributes('disabled')).toBeDefined()
    wrapper.unmount()
  })

  it('readonly показывает выбор, но не меняет его', async () => {
    const wrapper = mountCalendar({ readonly: true, modelValue: iso('2026-08-12') })

    await wrapper.get('[data-key="2026-08-20"]').trigger('click')
    await press(wrapper, 'ArrowRight')

    expect(wrapper.emitted('update:modelValue')).toBeFalsy()
    expect(wrapper.emitted('periodChange')).toBeFalsy()
    wrapper.unmount()
  })

  it('disabled не даёт ни выбрать, ни листать', async () => {
    const wrapper = mountCalendar({ disabled: true })

    await wrapper.get('[data-key="2026-08-12"]').trigger('click')
    await press(wrapper, 'PageDown')

    expect(wrapper.emitted('update:modelValue')).toBeFalsy()
    expect(wrapper.emitted('periodChange')).toBeFalsy()
    wrapper.unmount()
  })
})

describe('GrCalendar — выбор мышью', () => {
  it('клик по дню месяца эмитит значение и change', async () => {
    const wrapper = mountCalendar()

    await wrapper.get('[data-key="2026-08-12"]').trigger('click')

    expect(wrapper.emitted('update:modelValue')?.at(-1)?.[0]).toEqual(iso('2026-08-12'))
    expect(wrapper.emitted('change')?.at(-1)?.[0]).toEqual(iso('2026-08-12'))
    wrapper.unmount()
  })

  it('клик по добору соседнего месяца переводит показ туда', async () => {
    // Иначе выбранный день исчез бы из сетки сразу после выбора.
    const wrapper = mountCalendar()

    await wrapper.get('[data-key="2026-09-01"]').trigger('click')

    expect(wrapper.emitted('update:modelValue')?.at(-1)?.[0]).toEqual(iso('2026-09-01'))
    expect(wrapper.emitted('periodChange')?.at(-1)?.[0]).toEqual(iso('2026-09-01'))
    wrapper.unmount()
  })

  it('клик переносит остановку Tab туда же, куда и выбор', async () => {
    const wrapper = mountCalendar()

    await wrapper.get('[data-key="2026-08-20"]').trigger('click')

    expect(tabStops(wrapper)).toEqual(['2026-08-20'])
    wrapper.unmount()
  })
})

describe('GrCalendar — локаль', () => {
  it('первый день недели берётся из локали, если не задан', () => {
    const us = mount(GrCalendar, {
      props: { viewDate: iso('2026-08-01'), locale: 'en-US' },
      attachTo: document.body,
    })
    const ru = mount(GrCalendar, {
      props: { viewDate: iso('2026-08-01'), locale: 'ru-RU' },
      attachTo: document.body,
    })

    expect(us.findAll('[data-gr-calendar-weekday]')[0]!.text()).toBe('Sun')
    expect(ru.findAll('[data-gr-calendar-weekday]')[0]!.text()).toBe('пн')
    us.unmount()
    ru.unmount()
  })

  it('заголовок месяца локализован', () => {
    const wrapper = mount(GrCalendar, {
      props: { viewDate: iso('2026-08-01'), locale: 'ru-RU' },
      attachTo: document.body,
    })

    expect(wrapper.get('[data-gr-calendar-title]').text()).toBe('август 2026 г.')
    wrapper.unmount()
  })

  it('первое число попадает в свою колонку при любом старте недели', () => {
    // 1 августа 2026 — суббота: с понедельника это шестая колонка, с
    // воскресенья — седьмая.
    const monday = mountCalendar({ weekStart: 1 })
    const sunday = mountCalendar({ weekStart: 7 })

    expect(keyOf(monday, 5)).toBe('2026-08-01')
    expect(keyOf(sunday, 6)).toBe('2026-08-01')
    monday.unmount()
    sunday.unmount()
  })
})

describe('GrCalendar — объявления для скринридера', () => {
  it('смена месяца стрелками объявляется вслух', async () => {
    // Фокус переехал, сетка сменилась — а что именно изменилось, незрячему
    // пользователю иначе неоткуда узнать.
    const wrapper = mountCalendar()

    await press(wrapper, 'PageDown')

    expect(await announced()).toBe('September 2026')
    wrapper.unmount()
  })

  it('листание кнопкой объявляется так же', async () => {
    const wrapper = mountCalendar()

    await wrapper.get('[data-gr-calendar-prev]').trigger('click')

    expect(await announced()).toBe('July 2026')
    wrapper.unmount()
  })

  it('выбранный день объявляется полной датой', async () => {
    // `aria-selected` меняется на ячейке, где фокус уже стоит: диктор об этом
    // молчит, и клик неотличим от ничего.
    const wrapper = mountCalendar()

    await days(wrapper).find(day => day.attributes('data-key') === '2026-08-20')!.trigger('click')

    expect(await announced()).toBe('August 20, 2026')
    wrapper.unmount()
  })

  it('выбор с клавиатуры объявляется так же, как клик', async () => {
    const wrapper = mountCalendar({ modelValue: iso('2026-08-20') })

    await press(wrapper, 'Enter')

    expect(await announced()).toBe('August 20, 2026')
    wrapper.unmount()
  })

  it('день из добора соседнего месяца объявляет себя, а не месяц, куда переехал показ', async () => {
    // Выбор переводит показ на сентябрь, и смена периода объявляет себя сама —
    // объявленный раньше день она бы затёрла.
    const wrapper = mountCalendar()

    await days(wrapper).find(day => day.attributes('data-key') === '2026-09-01')!.trigger('click')

    expect(await announced()).toBe('September 1, 2026')
    wrapper.unmount()
  })

  it('запрещённый день не объявляется: выбора не было', async () => {
    const wrapper = mountCalendar({ disabledDates: [iso('2026-08-20')] })

    await days(wrapper).find(day => day.attributes('data-key') === '2026-08-20')!.trigger('click')

    expect(await announced()).toBe('')
    wrapper.unmount()
  })

  it('announceSelection выключает объявление выбора, но не смены периода', async () => {
    // Оболочка диапазона объявляет состояние периода сама: два объявления на
    // один клик перебили бы друг друга.
    const wrapper = mountCalendar({ announceSelection: false })

    await days(wrapper).find(day => day.attributes('data-key') === '2026-08-20')!.trigger('click')
    expect(await announced()).toBe('')

    await wrapper.get('[data-gr-calendar-next]').trigger('click')
    expect(await announced()).toBe('September 2026')
    wrapper.unmount()
  })

  it('заголовок сам живым регионом не является — иначе объявление задвоится', () => {
    const wrapper = mountCalendar()

    expect(wrapper.get('[data-gr-calendar-title]').attributes('aria-live')).toBe('off')
    wrapper.unmount()
  })
})

describe('GrCalendar — режимы месяца и года', () => {
  function mountMonths(props: Record<string, unknown> = {}) {
    return mount(GrCalendar, {
      // `viewDate` не задаётся намеренно: с ним показ управляется снаружи, и
      // листание внутри календаря ничего не меняет.
      props: { mode: 'month', today: iso('2026-08-12'), locale: 'en-US', ...props },
      attachTo: document.body,
    })
  }

  function periods(wrapper: ReturnType<typeof mountMonths>) {
    return wrapper.findAll('[data-gr-calendar-period]')
  }

  it('сетка месяцев — двенадцать ячеек с ролями grid и gridcell', () => {
    const wrapper = mountMonths()

    expect(wrapper.get('[data-gr-calendar-periods]').attributes('role')).toBe('grid')
    expect(periods(wrapper)).toHaveLength(12)
    expect(periods(wrapper)[0]!.attributes('role')).toBe('gridcell')
    expect(periods(wrapper)[0]!.text()).toBe('Jan')
    expect(wrapper.find('[data-gr-calendar-grid]').exists(), 'дневная сетка в этом режиме не рендерится').toBe(false)
    wrapper.unmount()
  })

  it('заголовок показывает год, а листание ходит годами', async () => {
    const wrapper = mountMonths()
    expect(wrapper.get('[data-gr-calendar-title]').text()).toBe('2026')

    await wrapper.get('[data-gr-calendar-next]').trigger('click')

    expect(wrapper.get('[data-gr-calendar-title]').text()).toBe('2027')
    // Показ — это якорь, а не выбор: в режиме месяцев от него важен только год.
    expect(wrapper.emitted('periodChange')?.at(-1)?.[0]).toEqual(iso('2027-08-12'))
    wrapper.unmount()
  })

  it('выбор месяца отдаёт его первое число', async () => {
    const wrapper = mountMonths()

    await wrapper.get('[data-key="2026-03"]').trigger('click')

    expect(wrapper.emitted('update:modelValue')?.at(-1)?.[0]).toEqual(iso('2026-03-01'))
    wrapper.unmount()
  })

  it('стрелки ходят по трём колонкам', async () => {
    const wrapper = mountMonths({ modelValue: iso('2026-01-15') })
    const grid = wrapper.get('[data-gr-calendar-periods]')

    await grid.trigger('keydown', { key: 'ArrowRight' })
    await nextTick()
    expect(wrapper.findAll('[data-gr-calendar-period]').filter(cell => cell.attributes('tabindex') === '0')[0]!.attributes('data-key'))
      .toBe('2026-02')

    await grid.trigger('keydown', { key: 'ArrowDown' })
    await nextTick()
    expect(wrapper.findAll('[data-gr-calendar-period]').filter(cell => cell.attributes('tabindex') === '0')[0]!.attributes('data-key'))
      .toBe('2026-05')
    wrapper.unmount()
  })

  it('сетка лет показывает десятилетие с добором и подписью по краям', async () => {
    const wrapper = mountMonths({ mode: 'year' })

    expect(wrapper.get('[data-gr-calendar-title]').text()).toBe('2020 — 2029')
    expect(periods(wrapper)[0]!.text()).toBe('2019')
    expect(periods(wrapper).at(-1)!.text()).toBe('2030')

    await wrapper.get('[data-key="2024"]').trigger('click')
    expect(wrapper.emitted('update:modelValue')?.at(-1)?.[0]).toEqual(iso('2024-01-01'))
    wrapper.unmount()
  })

  it('листание в режиме лет ходит десятилетиями', async () => {
    const wrapper = mountMonths({ mode: 'year' })

    await wrapper.get('[data-gr-calendar-next]').trigger('click')

    expect(wrapper.get('[data-gr-calendar-title]').text()).toBe('2030 — 2039')
    wrapper.unmount()
  })

  it('выбор года из добора переводит показ в его десятилетие', async () => {
    const wrapper = mountMonths({ mode: 'year' })

    await wrapper.get('[data-key="2030"]').trigger('click')

    expect(wrapper.get('[data-gr-calendar-title]').text()).toBe('2030 — 2039')
    wrapper.unmount()
  })

  it('выбранный месяц объявляется вместе с годом', async () => {
    // Без года «March» на слух не отличить от марта любого другого года.
    const wrapper = mountMonths()

    await wrapper.get('[data-key="2026-03"]').trigger('click')

    expect(await announced()).toBe('March 2026')
    wrapper.unmount()
  })

  it('выбранный год объявляется числом', async () => {
    const wrapper = mountMonths({ mode: 'year' })

    await wrapper.get('[data-key="2024"]').trigger('click')

    expect(await announced()).toBe('2024')
    wrapper.unmount()
  })

  it('год из добора объявляет себя, а не десятилетие, куда переехал показ', async () => {
    const wrapper = mountMonths({ mode: 'year' })

    await wrapper.get('[data-key="2030"]').trigger('click')

    expect(await announced()).toBe('2030')
    wrapper.unmount()
  })

  it('периоды вне границ не выбираются', async () => {
    const wrapper = mountMonths({ min: iso('2026-06-01') })

    expect(wrapper.get('[data-key="2026-03"]').attributes('aria-disabled')).toBe('true')
    await wrapper.get('[data-key="2026-03"]').trigger('click')

    expect(wrapper.emitted('update:modelValue')).toBeFalsy()
    wrapper.unmount()
  })

  it('смена периода объявляется вслух', async () => {
    const wrapper = mountMonths()

    await wrapper.get('[data-gr-calendar-next]').trigger('click')

    expect(await announced()).toBe('2027')
    wrapper.unmount()
  })
})

/**
 * Настройка через `GrConfigProvider`.
 *
 * Реестр дефолтов типизируется аугментацией из `defaults.ts`, но сам факт
 * записи в реестр ничего не гарантирует: гейт `componentDefaults` проверяет
 * адрес аугментации, а не то, что компонент действительно читает конфиг. Ровно
 * так `showWeekNumbers` числился настраиваемым и им не был — IDE подсказывала
 * ключ, `GrConfigProvider` на него не влиял, и ошибки не было ни одной.
 */
/**
 * Квартал — четыре ячейки, а не двенадцать: год делится на них ровно.
 * Название берётся строкой локали пакета: `Intl` кварталы не именует.
 */
describe('GrCalendar — режим квартала', () => {
  function mountQuarters(props: Record<string, unknown> = {}) {
    return mount(GrCalendar, {
      props: { mode: 'quarter', today: iso('2026-08-12'), locale: 'en-US', ...props },
      attachTo: document.body,
    })
  }

  it('четыре ячейки с подписями кварталов', () => {
    const wrapper = mountQuarters()
    const cells = wrapper.findAll('[data-gr-calendar-period]')

    expect(cells).toHaveLength(4)
    expect(cells.map(cell => cell.text())).toEqual(['Q1', 'Q2', 'Q3', 'Q4'])
    expect(wrapper.find('[data-gr-calendar-grid]').exists(), 'дневная сетка в этом режиме не рендерится').toBe(false)
    wrapper.unmount()
  })

  it('выбор ячейки отдаёт первое число квартала', async () => {
    const wrapper = mountQuarters()

    await wrapper.findAll('[data-gr-calendar-period]')[2]!.trigger('click')

    const selected = wrapper.emitted('update:modelValue')!.at(-1)![0] as { y: number, m: number, d: number }
    expect([selected.y, selected.m, selected.d]).toEqual([2026, 6, 1])
    wrapper.unmount()
  })

  it('выбранный квартал подсвечен по месяцу значения', () => {
    const wrapper = mountQuarters({ modelValue: iso('2026-08-12') })
    const cells = wrapper.findAll('[data-gr-calendar-period]')

    expect(cells.map(cell => cell.attributes('aria-selected'))).toEqual(['false', 'false', 'true', 'false'])
    wrapper.unmount()
  })

  /** Инвариант 11: запрещённое значение не выбирается ни кликом, ни `Enter`. */
  it('квартал целиком за `max` не выбирается', async () => {
    const wrapper = mountQuarters({ max: iso('2026-07-05') })
    const cells = wrapper.findAll('[data-gr-calendar-period]')

    expect(cells[3]!.attributes('aria-disabled')).toBe('true')

    await cells[3]!.trigger('click')
    expect(wrapper.emitted('update:modelValue')).toBeUndefined()
    wrapper.unmount()
  })
})

describe('GrCalendar и GrConfigProvider', () => {
  function mountWithConfig(defaults: Record<string, unknown>, props: Record<string, unknown> = {}) {
    const Harness = defineComponent({
      name: 'HarnessCalendarConfig',
      components: { GrCalendar, GrConfigProvider },
      props: {
        componentDefaults: { type: Object, required: true },
        calendarProps: { type: Object, default: () => ({}) },
      },
      template: `
        <GrConfigProvider :component-defaults="componentDefaults">
          <GrCalendar v-bind="calendarProps" />
        </GrConfigProvider>
      `,
    })

    return mount(Harness, {
      props: {
        componentDefaults: { GrCalendar: defaults },
        calendarProps: { viewDate: iso('2026-08-01'), today: iso('2026-08-12'), locale: 'en-US', ...props },
      },
      attachTo: document.body,
    })
  }

  const weekdays = (wrapper: ReturnType<typeof mountWithConfig>) =>
    wrapper.findAll('[data-gr-calendar-weekday]').map(node => node.text())

  it('weekStart берётся из конфига', () => {
    const monday = mountWithConfig({ weekStart: 1 })
    const sunday = mountWithConfig({ weekStart: 7 })

    expect(weekdays(monday)[0]).not.toBe(weekdays(sunday)[0])
    expect(weekdays(sunday)[0]).toBe(weekdays(monday)[6])

    monday.unmount()
    sunday.unmount()
  })

  it('локальный проп сильнее конфига', () => {
    const wrapper = mountWithConfig({ weekStart: 7 }, { weekStart: 1 })
    const configured = mountWithConfig({ weekStart: 1 })

    expect(weekdays(wrapper)).toEqual(weekdays(configured))

    wrapper.unmount()
    configured.unmount()
  })

  /**
   * Локаль остаётся последним звеном, а не первым.
   *
   * Если бы конфиг подставлялся всегда, `Intl` перестал бы решать: приложение,
   * ничего не настраивавшее, получило бы понедельник и в `en-US`, где неделя
   * начинается с воскресенья.
   */
  it('без конфига и пропа первый день недели даёт локаль', () => {
    const us = mountWithConfig({}, { locale: 'en-US' })
    const ru = mountWithConfig({}, { locale: 'ru-RU' })

    expect(weekdays(us)[0]).not.toBe(weekdays(ru)[0])

    us.unmount()
    ru.unmount()
  })

  it('showWeekNumbers включается конфигом и выключается пропом', () => {
    const on = mountWithConfig({ showWeekNumbers: true })
    expect(on.findAll('[data-gr-calendar-week-number]').length).toBeGreaterThan(0)

    const off = mountWithConfig({ showWeekNumbers: true }, { showWeekNumbers: false })
    expect(off.findAll('[data-gr-calendar-week-number]')).toHaveLength(0)

    on.unmount()
    off.unmount()
  })
})

/**
 * Неделя рисуется **сеткой дней**, а не сеткой периодов: двенадцать недель в
 * три колонки — это четверть года без единой подписи месяца, выбирать там
 * нечего. Клик по любому дню выбирает его неделю, строка подсвечивается целиком.
 */
describe('GrCalendar — режим недели', () => {
  function mountWeeks(props: Record<string, unknown> = {}) {
    return mount(GrCalendar, {
      props: { mode: 'week', today: iso('2026-08-12'), locale: 'en-US', ...props },
      attachTo: document.body,
    })
  }

  function days(wrapper: ReturnType<typeof mountWeeks>) {
    return wrapper.findAll('[data-gr-calendar-day]')
  }

  it('рисуется дневная сетка, а не сетка периодов', () => {
    const wrapper = mountWeeks()

    expect(wrapper.find('[data-gr-calendar-grid]').exists()).toBe(true)
    expect(wrapper.find('[data-gr-calendar-periods]').exists()).toBe(false)
    wrapper.unmount()
  })

  /** У `en-US` неделя начинается с воскресенья — 12 августа 2026 попадает в неделю с 9-го. */
  it('клик по любому дню кладёт в модель начало его недели', async () => {
    const wrapper = mountWeeks()

    const wednesday = days(wrapper).find(day => day.text() === '12')!
    await wednesday.trigger('click')

    const selected = wrapper.emitted('update:modelValue')!.at(-1)![0] as { y: number, m: number, d: number }
    expect([selected.y, selected.m, selected.d]).toEqual([2026, 7, 9])
    wrapper.unmount()
  })

  it('с неделей от понедельника начало другое', async () => {
    const wrapper = mountWeeks({ weekStart: 1 })

    await days(wrapper).find(day => day.text() === '12')!.trigger('click')

    const selected = wrapper.emitted('update:modelValue')!.at(-1)![0] as { y: number, m: number, d: number }
    expect([selected.y, selected.m, selected.d]).toEqual([2026, 7, 10])
    wrapper.unmount()
  })

  function selectedDays(wrapper: ReturnType<typeof mountWeeks>): string[] {
    return wrapper.findAll('[data-gr-calendar-cell]')
      .filter(cell => cell.attributes('aria-selected') === 'true')
      .map(cell => cell.text())
  }

  it('подсвечивается вся строка недели, а не один день', () => {
    const wrapper = mountWeeks({ modelValue: iso('2026-08-12') })

    expect(selectedDays(wrapper)).toEqual(['9', '10', '11', '12', '13', '14', '15'])
    wrapper.unmount()
  })

  /** Первый день приходит из `Intl` по локали, а не прибит к понедельнику. */
  it('с неделей от понедельника подсвечивается другая строка', () => {
    const wrapper = mountWeeks({ modelValue: iso('2026-08-12'), weekStart: 1 })

    expect(selectedDays(wrapper)).toEqual(['10', '11', '12', '13', '14', '15', '16'])
    wrapper.unmount()
  })

  /** Инвариант 11: `readonly` не меняется ни одной клавишей и ни одним кликом. */
  it('`readonly` неделю не выбирает', async () => {
    const wrapper = mountWeeks({ readonly: true })

    await days(wrapper)[10]!.trigger('click')

    expect(wrapper.emitted('update:modelValue')).toBeUndefined()
    wrapper.unmount()
  })
})
