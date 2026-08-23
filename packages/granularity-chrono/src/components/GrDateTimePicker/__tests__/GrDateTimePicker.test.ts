import { DOMWrapper, mount } from '@vue/test-utils'
import { nextTick } from 'vue'
import { describe, expect, it } from 'vitest'

import { queryOne } from '@feugene/granularity-test-kit/vue'

import GrDateTimePicker from '../GrDateTimePicker.vue'

const TODAY = new Date(2026, 7, 12)

function at(day: number, hour = 0, minute = 0): Date {
  return new Date(2026, 7, day, hour, minute)
}

function mountPicker(props: Record<string, unknown> = {}) {
  return mount(GrDateTimePicker, {
    props: { locale: 'en-US', today: TODAY, use12Hours: false, ...props },
    attachTo: document.body,
  })
}

type Picker = ReturnType<typeof mountPicker>

function field(wrapper: Picker) {
  return wrapper.get('[data-gr-date-time-picker-field]')
}

/** Панель уезжает в портал, то есть из поддерева обёртки. */
const query = (selector: string): DOMWrapper<HTMLElement> => new DOMWrapper(queryOne(selector))

function exists(selector: string): boolean {
  return document.querySelector(selector) !== null
}

function day(key: string) {
  return query(`[data-gr-calendar-day][data-key="${key}"]`)
}

function timeOption(key: string) {
  return query(`[data-gr-time-picker-option][data-key="${key}"]`)
}

async function openPicker(wrapper: Picker) {
  await field(wrapper).trigger('click')
  for (let i = 0; i < 4; i += 1) await nextTick()
}

function lastModel(wrapper: Picker): unknown {
  return wrapper.emitted('update:modelValue')?.at(-1)?.[0]
}

describe('GrDateTimePicker — панель', () => {
  it('в одной панели и сетка, и колонки времени', async () => {
    const wrapper = mountPicker({ modelValue: at(12, 9, 30) })
    await openPicker(wrapper)

    expect(exists('[data-gr-calendar-grid]')).toBe(true)
    expect(exists('[data-gr-time-columns]')).toBe(true)
    wrapper.unmount()
  })

  it('до первого открытия панели в DOM нет', () => {
    const wrapper = mountPicker({ modelValue: at(12, 9, 30) })

    expect(exists('[data-gr-date-time-picker-panel]')).toBe(false)
    wrapper.unmount()
  })

  it('поле показывает и дату, и время', () => {
    const wrapper = mountPicker({ modelValue: at(12, 15, 30) })

    expect((field(wrapper).element as HTMLInputElement).value).toBe('Aug 12, 2026, 15:30')
    wrapper.unmount()
  })

  it('секунды в показе появляются вместе с колонкой', () => {
    const wrapper = mountPicker({ modelValue: new Date(2026, 7, 12, 15, 30, 45), enableSeconds: true })

    expect((field(wrapper).element as HTMLInputElement).value).toBe('Aug 12, 2026, 15:30:45')
    wrapper.unmount()
  })

  it('после открытия фокус уходит в сетку', async () => {
    const wrapper = mountPicker({ modelValue: at(12, 9, 0) })
    await openPicker(wrapper)

    expect(document.activeElement?.getAttribute('data-key')).toBe('2026-08-12')
    wrapper.unmount()
  })
})

describe('GrDateTimePicker — выбор при autoApply', () => {
  it('смена дня сохраняет время', async () => {
    const wrapper = mountPicker({ modelValue: at(12, 9, 30) })
    await openPicker(wrapper)

    await day('2026-08-20').trigger('click')

    expect(lastModel(wrapper)).toEqual(at(20, 9, 30))
    wrapper.unmount()
  })

  it('смена времени сохраняет день', async () => {
    const wrapper = mountPicker({ modelValue: at(12, 9, 30) })
    await openPicker(wrapper)

    await timeOption('hour-21').trigger('click')

    expect(lastModel(wrapper)).toEqual(at(12, 21, 30))
    wrapper.unmount()
  })

  it('без значения день даёт полночь, а время — дату today', async () => {
    const wrapper = mountPicker({ modelValue: null })
    await openPicker(wrapper)

    await day('2026-08-05').trigger('click')
    expect(lastModel(wrapper)).toEqual(at(5, 0, 0))
    wrapper.unmount()

    const empty = mountPicker({ modelValue: null })
    await openPicker(empty)
    await timeOption('hour-7').trigger('click')
    expect(lastModel(empty)).toEqual(at(12, 7, 0))
    empty.unmount()
  })

  it('панель по выбору не закрывается: дата и время выбираются по очереди', async () => {
    const wrapper = mountPicker({ modelValue: at(12, 9, 0) })
    await openPicker(wrapper)

    await day('2026-08-20').trigger('click')

    expect(wrapper.emitted('update:open')?.at(-1)).toEqual([true])
    wrapper.unmount()
  })
})

describe('GrDateTimePicker — autoApply=false', () => {
  it('правки уходят в черновик, а не в модель', async () => {
    const wrapper = mountPicker({ modelValue: at(12, 9, 0), autoApply: false })
    await openPicker(wrapper)

    await day('2026-08-20').trigger('click')
    await timeOption('hour-21').trigger('click')

    expect(wrapper.emitted('update:modelValue')).toBeFalsy()
    // Поле показывает старое значение, панель — новое.
    expect((field(wrapper).element as HTMLInputElement).value).toBe('Aug 12, 2026, 09:00')
    expect(query('[data-gr-calendar-day][data-key="2026-08-20"]').attributes('class')).toContain('--gr-calendar-selected-bg')
    wrapper.unmount()
  })

  it('кнопка подтверждения отдаёт черновик и закрывает панель', async () => {
    const wrapper = mountPicker({ modelValue: at(12, 9, 0), autoApply: false })
    await openPicker(wrapper)

    await day('2026-08-20').trigger('click')
    await query('[data-gr-date-time-picker-apply]').trigger('click')

    expect(lastModel(wrapper)).toEqual(at(20, 9, 0))
    expect(wrapper.emitted('update:open')?.at(-1)).toEqual([false])
    wrapper.unmount()
  })

  it('отмена закрывает панель, ничего не отдав', async () => {
    const wrapper = mountPicker({ modelValue: at(12, 9, 0), autoApply: false })
    await openPicker(wrapper)

    await day('2026-08-20').trigger('click')
    await query('[data-gr-date-time-picker-cancel]').trigger('click')

    expect(wrapper.emitted('update:modelValue')).toBeFalsy()
    expect(wrapper.emitted('update:open')?.at(-1)).toEqual([false])
    wrapper.unmount()
  })

  it('после отмены повторное открытие показывает модель, а не брошенный черновик', async () => {
    const wrapper = mountPicker({ modelValue: at(12, 9, 0), autoApply: false })
    await openPicker(wrapper)
    await day('2026-08-20').trigger('click')
    await query('[data-gr-date-time-picker-cancel]').trigger('click')

    await openPicker(wrapper)

    expect(query('[data-gr-calendar-day][data-key="2026-08-12"]').attributes('class'))
      .toContain('--gr-calendar-selected-bg')
    wrapper.unmount()
  })

  it('отмена откатывает панель, даже если она осталась открытой', async () => {
    // Панель контролируется снаружи и на `update:open` не закрывается —
    // тогда откат черновика виден сразу, а не при следующем открытии.
    const wrapper = mountPicker({ modelValue: at(12, 9, 0), autoApply: false, open: true })
    for (let i = 0; i < 4; i += 1) await nextTick()

    await day('2026-08-20').trigger('click')
    await query('[data-gr-date-time-picker-cancel]').trigger('click')
    await nextTick()

    expect(query('[data-gr-calendar-day][data-key="2026-08-12"]').attributes('class'))
      .toContain('--gr-calendar-selected-bg')
    expect(query('[data-gr-calendar-day][data-key="2026-08-20"]').attributes('class'))
      .not
      .toContain('--gr-calendar-selected-bg')
    wrapper.unmount()
  })

  it('при autoApply кнопок подтверждения нет', async () => {
    const wrapper = mountPicker({ modelValue: at(12, 9, 0) })
    await openPicker(wrapper)

    expect(exists('[data-gr-date-time-picker-footer]')).toBe(false)
    wrapper.unmount()
  })

  it('слот подвала получает подтверждение и отмену', async () => {
    const wrapper = mount(GrDateTimePicker, {
      props: { locale: 'en-US', today: TODAY, use12Hours: false, modelValue: at(12, 9, 0), autoApply: false },
      slots: { footer: '<button data-custom-apply @click="params.apply()">ok</button>' },
      attachTo: document.body,
    })
    await openPicker(wrapper)

    await day('2026-08-20').trigger('click')
    await query('[data-custom-apply]').trigger('click')

    expect(exists('[data-gr-date-time-picker-apply]'), 'свой подвал заменяет кнопки целиком').toBe(false)
    expect(wrapper.emitted('update:modelValue')?.at(-1)?.[0]).toEqual(at(20, 9, 0))
    wrapper.unmount()
  })
})

describe('GrDateTimePicker — границы', () => {
  it('время ограничено только в граничный день', async () => {
    const wrapper = mountPicker({ modelValue: at(12, 12, 0), min: at(12, 9, 0) })
    await openPicker(wrapper)

    // 12 августа — день границы: до 09:00 выбирать нечего.
    expect(timeOption('hour-8').attributes('aria-disabled')).toBe('true')

    // Следующий день границей не задет: там доступны все часы.
    await day('2026-08-20').trigger('click')
    await wrapper.setProps({ modelValue: at(20, 12, 0) })
    await nextTick()

    expect(timeOption('hour-8').attributes('aria-disabled')).toBeUndefined()
    wrapper.unmount()
  })

  it('дни вне min не выбираются', async () => {
    const wrapper = mountPicker({ modelValue: at(12, 9, 0), min: at(10, 0, 0) })
    await openPicker(wrapper)

    await day('2026-08-05').trigger('click')

    expect(wrapper.emitted('update:modelValue')).toBeFalsy()
    wrapper.unmount()
  })
})

describe('GrDateTimePicker — негативные сценарии и форма', () => {
  it('disabled не открывает панель', async () => {
    const wrapper = mountPicker({ disabled: true })
    await openPicker(wrapper)

    expect(exists('[data-gr-date-time-picker-panel]')).toBe(false)
    wrapper.unmount()
  })

  it('readonly открывает панель, но ни день, ни время не меняются', async () => {
    const wrapper = mountPicker({ modelValue: at(12, 9, 0), readonly: true })
    await openPicker(wrapper)

    await day('2026-08-20').trigger('click')
    await timeOption('hour-21').trigger('click')

    expect(wrapper.emitted('update:modelValue')).toBeFalsy()
    wrapper.unmount()
  })

  it('форме уходит сериализованное значение, а не видимый текст', () => {
    const wrapper = mountPicker({
      modelValue: '2026-08-12T15:30:00',
      valueAdapter: 'isoDateTime',
      name: 'meeting',
    })
    const hidden = wrapper.get('input[type="hidden"]')

    expect((hidden.element as HTMLInputElement).value).toBe('2026-08-12T15:30:00')
    expect((field(wrapper).element as HTMLInputElement).value).toBe('Aug 12, 2026, 15:30')
    wrapper.unmount()
  })

  it('адаптер isoDateTime отдаёт строку', async () => {
    const wrapper = mountPicker({ modelValue: '2026-08-12T15:30:00', valueAdapter: 'isoDateTime' })
    await openPicker(wrapper)

    await day('2026-08-20').trigger('click')

    expect(lastModel(wrapper)).toBe('2026-08-20T15:30:00')
    wrapper.unmount()
  })

  it('очистка отдаёт null и своё событие', async () => {
    const wrapper = mountPicker({ modelValue: at(12, 9, 0), clearable: true })

    await wrapper.get('[data-gr-date-time-picker-clear]').trigger('click')

    expect(lastModel(wrapper)).toBeNull()
    expect(wrapper.emitted('clear')).toHaveLength(1)
    wrapper.unmount()
  })
})

describe('GrDateTimePicker — inline', () => {
  it('сетка и колонки на месте, поля нет', async () => {
    const wrapper = mountPicker({ inline: true, modelValue: at(12, 9, 30) })
    for (let i = 0; i < 4; i += 1) await nextTick()

    expect(document.querySelector('[data-gr-date-time-picker-field]')).toBeNull()
    expect(exists('[data-gr-calendar-grid]')).toBe(true)
    expect(exists('[data-gr-time-columns]')).toBe(true)
    wrapper.unmount()
  })

  it('черновик заводится и без открытия панели', async () => {
    // Иначе при `autoApply: false` подтверждать было бы нечего: черновик
    // заводится на открытии, которого в `inline` не случается.
    const wrapper = mountPicker({ inline: true, autoApply: false, modelValue: at(12, 9, 0) })
    for (let i = 0; i < 4; i += 1) await nextTick()

    await day('2026-08-20').trigger('click')
    expect(wrapper.emitted('update:modelValue')).toBeFalsy()

    await query('[data-gr-date-time-picker-apply]').trigger('click')
    expect(lastModel(wrapper)).toEqual(at(20, 9, 0))
    wrapper.unmount()
  })
})

describe('GrDateTimePicker — проброс слота шапки недели', () => {
  it('слот weekday доходит до сетки вместе с ISO-номером дня', async () => {
    // Слот объявлен на пикере, а рендерит его вложенный `GrCalendar`: без
    // проброса потребитель переопределял бы шапку только у голой сетки.
    const wrapper = mount(GrDateTimePicker, {
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

async function type(wrapper: Picker, text: string) {
  const input = field(wrapper)
  ;(input.element as HTMLInputElement).value = text
  await input.trigger('input')
}

describe('GrDateTimePicker — ручной ввод', () => {
  it('без `editable` поле не принимает текст и остаётся readonly', async () => {
    const wrapper = mountPicker({ modelValue: at(12, 9, 30) })

    expect(field(wrapper).attributes('readonly')).toBeDefined()
    await type(wrapper, '8/14/2026, 10:00')
    await field(wrapper).trigger('keydown', { key: 'Enter' })

    expect(lastModel(wrapper)).toBeUndefined()
    wrapper.unmount()
  })

  it('набранное уходит наружу по `Enter`', async () => {
    const wrapper = mountPicker({ editable: true, modelValue: at(12, 9, 30) })

    await type(wrapper, '8/14/2026, 10:15')
    await field(wrapper).trigger('keydown', { key: 'Enter' })

    expect(lastModel(wrapper)).toEqual(at(14, 10, 15))
    wrapper.unmount()
  })

  it('одна дата без времени сохраняет время модели', async () => {
    const wrapper = mountPicker({ editable: true, modelValue: at(12, 9, 30) })

    await type(wrapper, '8/14/2026')
    await field(wrapper).trigger('keydown', { key: 'Enter' })

    expect(lastModel(wrapper)).toEqual(at(14, 9, 30))
    wrapper.unmount()
  })

  it('уход фокуса фиксирует набранное, а `applyOnBlur=false` — нет', async () => {
    const wrapper = mountPicker({ editable: true, modelValue: at(12, 9, 30) })

    await type(wrapper, '8/14/2026, 10:15')
    await field(wrapper).trigger('blur')
    expect(lastModel(wrapper)).toEqual(at(14, 10, 15))
    wrapper.unmount()

    const strict = mountPicker({ editable: true, applyOnBlur: false, modelValue: at(12, 9, 30) })

    await type(strict, '8/14/2026, 10:15')
    await strict.trigger('blur')
    await field(strict).trigger('blur')
    expect(lastModel(strict)).toBeUndefined()
    strict.unmount()
  })

  it('мусор откатывается к значению модели', async () => {
    const wrapper = mountPicker({ editable: true, modelValue: at(12, 9, 30) })

    await type(wrapper, 'кто здесь')
    await field(wrapper).trigger('keydown', { key: 'Enter' })

    expect(lastModel(wrapper)).toBeUndefined()
    expect((field(wrapper).element as HTMLInputElement).value).toBe('08/12/2026, 09:30')
    wrapper.unmount()
  })

  /** Инвариант 11: запрещённое не выбирается ни кликом, ни `Enter`. */
  it('запрещённая дата не принимается текстом', async () => {
    const wrapper = mountPicker({
      editable: true,
      modelValue: at(12, 9, 30),
      disabledDates: [at(14)],
    })

    await type(wrapper, '8/14/2026, 10:15')
    await field(wrapper).trigger('keydown', { key: 'Enter' })
    expect(lastModel(wrapper)).toBeUndefined()
    wrapper.unmount()
  })

  it('значение вне `min`/`max` не принимается текстом', async () => {
    const wrapper = mountPicker({ editable: true, modelValue: at(12, 9, 30), max: at(12, 18, 0) })

    await type(wrapper, '8/12/2026, 19:00')
    await field(wrapper).trigger('keydown', { key: 'Enter' })
    expect(lastModel(wrapper)).toBeUndefined()

    await type(wrapper, '8/12/2026, 17:00')
    await field(wrapper).trigger('keydown', { key: 'Enter' })
    expect(lastModel(wrapper)).toEqual(at(12, 17, 0))
    wrapper.unmount()
  })

  it('`readonly` не принимает набранное', async () => {
    const wrapper = mountPicker({ editable: true, readonly: true, modelValue: at(12, 9, 30) })

    await type(wrapper, '8/14/2026, 10:15')
    await field(wrapper).trigger('keydown', { key: 'Enter' })

    expect(lastModel(wrapper)).toBeUndefined()
    wrapper.unmount()
  })

  it('текст подтверждает сам себя и при `autoApply=false`', async () => {
    const wrapper = mountPicker({ editable: true, autoApply: false, modelValue: at(12, 9, 30) })

    await type(wrapper, '8/14/2026, 10:15')
    await field(wrapper).trigger('keydown', { key: 'Enter' })

    expect(lastModel(wrapper)).toEqual(at(14, 10, 15))
    wrapper.unmount()
  })

  it('плейсхолдер по умолчанию — подсказка формата локали', () => {
    const wrapper = mountPicker({ editable: true })

    expect(field(wrapper).attributes('placeholder')).toBe('MM/DD/YYYY, HH:MM')
    wrapper.unmount()
  })
})

describe('GrDateTimePicker — панель идёт за набором', () => {
  it('набранная целиком дата подсвечивается и переводит сетку, модель не трогая', async () => {
    const wrapper = mountPicker({ editable: true, modelValue: at(12, 9, 30) })
    await openPicker(wrapper)

    await type(wrapper, '9/23/2026')
    await nextTick()

    expect(query('[data-gr-calendar-title]').text()).toContain('September')
    expect(day('2026-09-23').attributes('class')).toContain('--gr-calendar-selected-bg')
    expect(wrapper.emitted('update:modelValue')).toBeUndefined()
    wrapper.unmount()
  })

  it('набранный час подсвечивается в колонке, минуты остаются прежними', async () => {
    const wrapper = mountPicker({ editable: true, modelValue: at(12, 9, 30) })
    await openPicker(wrapper)

    await type(wrapper, '8/12/2026 18')
    await nextTick()

    expect(timeOption('hour-18').attributes('aria-selected')).toBe('true')
    expect(timeOption('minute-30').attributes('aria-selected')).toBe('true')
    wrapper.unmount()
  })

  it('дописанные минуты подсвечиваются следом', async () => {
    const wrapper = mountPicker({ editable: true, modelValue: at(12, 9, 30) })
    await openPicker(wrapper)

    await type(wrapper, '8/12/2026 18:45')
    await nextTick()

    expect(timeOption('hour-18').attributes('aria-selected')).toBe('true')
    expect(timeOption('minute-45').attributes('aria-selected')).toBe('true')
    wrapper.unmount()
  })

  /**
   * Первый `Esc` при открытой панели достаётся ей, а не полю: стек слоёв ловит
   * его в capture-фазе и гасит, чтобы нажатие не провалилось на слой ниже.
   * Черновик снимает второй — или первый, если панель не открывали.
   */
  it('снятый черновик возвращает панель к модели', async () => {
    const wrapper = mountPicker({ editable: true, modelValue: at(12, 9, 30) })
    await openPicker(wrapper)

    await type(wrapper, '9/23/2026 18:45')
    await field(wrapper).trigger('keydown', { key: 'Escape' })
    await field(wrapper).trigger('keydown', { key: 'Escape' })
    await nextTick()

    expect((field(wrapper).element as HTMLInputElement).value).toBe('08/12/2026, 09:30')
    expect(query('[data-gr-calendar-title]').text()).toContain('August')
    expect(timeOption('hour-9').attributes('aria-selected')).toBe('true')
    wrapper.unmount()
  })
})
