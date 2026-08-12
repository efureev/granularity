import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'
import { afterEach, describe, expect, it } from 'vitest'

import { resetAnnouncer } from '@feugene/granularity/composables/useAnnouncer'

import type { PlainDate } from '../../../chrono/plainDate'
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

/**
 * Объявления уходят в общий живой регион, а не в узел компонента: текст там
 * появляется отложенным макротаском — иначе повтор того же сообщения не дал бы
 * мутации и не прочитался.
 */
async function announced(): Promise<string> {
  await new Promise(resolve => setTimeout(resolve, 2))
  return document.querySelector('[data-gr-announcer-region="polite"]')?.textContent ?? ''
}

afterEach(() => {
  resetAnnouncer()
})

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
    expect(wrapper.emitted('monthChange')?.at(-1)?.[0]).toEqual(iso('2026-09-01'))

    await press(wrapper, 'PageUp')
    await press(wrapper, 'PageUp')
    expect(wrapper.emitted('monthChange')?.at(-1)?.[0]).toEqual(iso('2026-07-01'))
    wrapper.unmount()
  })

  it('Shift с PageUp и PageDown листает год', async () => {
    const wrapper = mountCalendar()

    await press(wrapper, 'PageDown', { shiftKey: true })
    expect(wrapper.emitted('monthChange')?.at(-1)?.[0]).toEqual(iso('2027-08-01'))
    wrapper.unmount()
  })

  it('стрелка за нижний край листает месяц вперёд, а не прокручивает страницу', async () => {
    const wrapper = mountCalendar()
    const event = new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true, cancelable: true })

    // Шесть строк вниз — гарантированно за край сетки.
    for (let i = 0; i < 6; i += 1) await press(wrapper, 'ArrowDown')
    wrapper.get('[data-gr-calendar-grid]').element.dispatchEvent(event)

    expect(event.defaultPrevented).toBe(true)
    expect(wrapper.emitted('monthChange')).toBeTruthy()
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
    expect(wrapper.emitted('monthChange')).toBeFalsy()
    wrapper.unmount()
  })

  it('disabled не даёт ни выбрать, ни листать', async () => {
    const wrapper = mountCalendar({ disabled: true })

    await wrapper.get('[data-key="2026-08-12"]').trigger('click')
    await press(wrapper, 'PageDown')

    expect(wrapper.emitted('update:modelValue')).toBeFalsy()
    expect(wrapper.emitted('monthChange')).toBeFalsy()
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
    expect(wrapper.emitted('monthChange')?.at(-1)?.[0]).toEqual(iso('2026-09-01'))
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

  it('заголовок сам живым регионом не является — иначе объявление задвоится', () => {
    const wrapper = mountCalendar()

    expect(wrapper.get('[data-gr-calendar-title]').attributes('aria-live')).toBe('off')
    wrapper.unmount()
  })
})
