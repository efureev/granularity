import { DOMWrapper, mount } from '@vue/test-utils'
import { defineComponent, h, nextTick, ref } from 'vue'
import { describe, expect, it, vi } from 'vitest'

import GrFormField from '@feugene/granularity/components/GrFormField'

import GrTimePicker from '../GrTimePicker.vue'

const TODAY = new Date(2026, 7, 12)

function at(hour: number, minute = 0, second = 0): Date {
  return new Date(2026, 7, 12, hour, minute, second)
}

function mountPicker(props: Record<string, unknown> = {}) {
  return mount(GrTimePicker, {
    props: { locale: 'en-US', today: TODAY, use12Hours: false, ...props },
    attachTo: document.body,
  })
}

type Picker = ReturnType<typeof mountPicker>

function field(wrapper: Picker) {
  return wrapper.get('[data-gr-time-picker-field]')
}

/**
 * Панель уезжает в портал, то есть из поддерева обёртки — `wrapper.find` её не
 * видит. Запросы идут по документу; каждый тест размонтирует свой пикер, так
 * что чужих панелей в нём не остаётся.
 */
function query(selector: string): DOMWrapper<HTMLElement> {
  const element = document.querySelector<HTMLElement>(selector)
  if (!element) throw new Error(`нет элемента ${selector}`)

  return new DOMWrapper(element)
}

function panelExists(): boolean {
  return document.querySelector('[data-gr-time-picker-panel]') !== null
}

function column(unit: string) {
  return query(`[data-unit="${unit}"]`)
}

function options(unit: string): DOMWrapper<HTMLElement>[] {
  return [...column(unit).element.querySelectorAll<HTMLElement>('[data-gr-time-picker-option]')]
    .map(element => new DOMWrapper(element))
}

function option(key: string) {
  return query(`[data-key="${key}"]`)
}

function columnCount(): number {
  return document.querySelectorAll('[data-gr-time-picker-column]').length
}

/** Открытие асинхронно: панель монтируется, потом в неё уходит фокус. */
async function openPicker(wrapper: Picker) {
  await field(wrapper).trigger('click')
  for (let i = 0; i < 4; i += 1) await nextTick()
}

async function press(unit: string, key: string) {
  await column(unit).trigger('keydown', { key })
  await nextTick()
}

/** Ключ опции, на которую указывает `aria-activedescendant` колонки. */
function activeKey(unit: string): string | undefined {
  const id = column(unit).attributes('aria-activedescendant')
  if (!id) return undefined

  return document.querySelector(`[id="${id}"]`)?.getAttribute('data-key') ?? undefined
}

describe('GrTimePicker — поле и роли', () => {
  it('поле объявлено combobox и не редактируется вручную', () => {
    const wrapper = mountPicker()
    const input = field(wrapper)

    expect(input.attributes('role')).toBe('combobox')
    expect(input.attributes('readonly')).toBeDefined()
    expect(input.attributes('aria-haspopup')).toBe('dialog')
    wrapper.unmount()
  })

  it('значение показывается по локали', () => {
    const wrapper = mountPicker({ modelValue: at(15, 30) })
    expect((field(wrapper).element as HTMLInputElement).value).toBe('15:30')

    const twelve = mountPicker({ modelValue: at(15, 30), use12Hours: undefined })
    expect((field(twelve).element as HTMLInputElement).value).toBe('3:30 PM')

    wrapper.unmount()
    twelve.unmount()
  })

  it('секунды в показе появляются вместе с колонкой', () => {
    const wrapper = mountPicker({ modelValue: at(15, 30, 45), enableSeconds: true })

    expect((field(wrapper).element as HTMLInputElement).value).toBe('15:30:45')
    wrapper.unmount()
  })

  it('колонки объявлены листбоксами, опции — опциями', async () => {
    const wrapper = mountPicker({ modelValue: at(9, 0) })
    await openPicker(wrapper)

    const hours = column('hour')
    expect(hours.attributes('role')).toBe('listbox')
    // Колонка скроллится — значит обязана быть достижима с клавиатуры.
    expect(hours.attributes('tabindex')).toBe('0')
    expect(options('hour')).toHaveLength(24)
    expect(options('hour')[0]!.attributes('role')).toBe('option')
    wrapper.unmount()
  })

  it('состав колонок зависит от 12/24 и секунд', async () => {
    const twentyFour = mountPicker({ modelValue: at(9, 0) })
    await openPicker(twentyFour)
    expect(columnCount()).toBe(2)
    twentyFour.unmount()

    const full = mountPicker({ modelValue: at(9, 0), use12Hours: true, enableSeconds: true })
    await openPicker(full)
    expect(columnCount()).toBe(4)
    expect(document.querySelector('[data-unit="period"]')).not.toBeNull()
    full.unmount()
  })

  it('12-часовой вид берётся из локали, когда проп не задан', async () => {
    const american = mountPicker({ modelValue: at(9, 0), use12Hours: undefined })
    await openPicker(american)
    expect(document.querySelector('[data-unit="period"]')).not.toBeNull()
    american.unmount()

    const russian = mountPicker({ modelValue: at(9, 0), locale: 'ru-RU', use12Hours: undefined })
    await openPicker(russian)
    expect(document.querySelector('[data-unit="period"]')).toBeNull()
    russian.unmount()
  })
})

describe('GrTimePicker — ленивое монтирование', () => {
  it('до первого открытия колонок в DOM нет', () => {
    const wrapper = mountPicker()

    expect(panelExists()).toBe(false)
    wrapper.unmount()
  })

  it('после открытия панель есть', async () => {
    const wrapper = mountPicker()
    await openPicker(wrapper)

    expect(panelExists()).toBe(true)
    wrapper.unmount()
  })
})

describe('GrTimePicker — выбор', () => {
  it('час подставляется в дату значения, остальное сохраняется', async () => {
    const wrapper = mountPicker({ modelValue: at(9, 45) })
    await openPicker(wrapper)

    await option('hour-21').trigger('click')

    expect(wrapper.emitted('update:modelValue')?.at(-1)?.[0]).toEqual(at(21, 45))
    wrapper.unmount()
  })

  it('без значения выбор часа даёт ровный час на дате `today`', async () => {
    const wrapper = mountPicker({ modelValue: null })
    await openPicker(wrapper)

    await option('hour-7').trigger('click')

    expect(wrapper.emitted('update:modelValue')?.at(-1)?.[0]).toEqual(at(7, 0, 0))
    wrapper.unmount()
  })

  it('панель по выбору не закрывается: время набирается за несколько шагов', async () => {
    const wrapper = mountPicker({ modelValue: at(9, 0) })
    await openPicker(wrapper)

    await option('hour-10').trigger('click')

    expect(wrapper.emitted('update:open')?.at(-1)).toEqual([true])
    expect(panelExists()).toBe(true)
    wrapper.unmount()
  })

  it('в 12-часовом виде час считается по текущему периоду', async () => {
    const wrapper = mountPicker({ modelValue: at(15, 30), use12Hours: true })
    await openPicker(wrapper)

    // «03» при периоде PM — это 15 часов, а не 3.
    await option('hour-3').trigger('click')
    expect(wrapper.emitted('update:modelValue')?.at(-1)?.[0]).toEqual(at(15, 30))

    await option('period-am').trigger('click')
    expect(wrapper.emitted('update:modelValue')?.at(-1)?.[0]).toEqual(at(3, 30))
    wrapper.unmount()
  })

  it('шаг минут задаёт состав колонки', async () => {
    const wrapper = mountPicker({ modelValue: at(9, 0), minuteStep: 15 })
    await openPicker(wrapper)

    expect(options('minute')).toHaveLength(4)
    await option('minute-45').trigger('click')
    expect(wrapper.emitted('update:modelValue')?.at(-1)?.[0]).toEqual(at(9, 45))
    wrapper.unmount()
  })

  it('выбранная опция помечена aria-selected', async () => {
    const wrapper = mountPicker({ modelValue: at(9, 30) })
    await openPicker(wrapper)

    expect(option('hour-9').attributes('aria-selected')).toBe('true')
    expect(option('minute-30').attributes('aria-selected')).toBe('true')
    expect(option('hour-10').attributes('aria-selected')).toBe('false')
    wrapper.unmount()
  })
})

describe('GrTimePicker — клавиатура', () => {
  it('после открытия фокус уходит на колонку часов', async () => {
    const wrapper = mountPicker({ modelValue: at(9, 0) })
    await openPicker(wrapper)

    expect(document.activeElement?.getAttribute('data-unit')).toBe('hour')
    wrapper.unmount()
  })

  it('колонка прокручивается к выбранному значению', async () => {
    // Иначе панель на 24 значения открывается на нуле, и выбранные 09:30
    // остаются за кадром — курсор на них есть, а видно их нет.
    // jsdom метода не знает вовсе — заводим заглушку и следим за вызовами.
    // Убирается она удалением, а не возвратом прежнего значения: прежнего нет.
    Element.prototype.scrollIntoView = () => {}
    const spy = vi.spyOn(Element.prototype, 'scrollIntoView')

    const wrapper = mountPicker({ modelValue: at(9, 30) })
    await openPicker(wrapper)

    const scrolled = spy.mock.instances.map(element => (element as Element).getAttribute('data-key'))
    expect(scrolled).toContain('hour-9')
    expect(scrolled).toContain('minute-30')

    spy.mockRestore()
    Reflect.deleteProperty(Element.prototype, 'scrollIntoView')
    wrapper.unmount()
  })

  it('курсор встаёт на выбранное значение, а не на начало списка', async () => {
    const wrapper = mountPicker({ modelValue: at(9, 30) })
    await openPicker(wrapper)

    expect(activeKey('hour')).toBe('hour-9')
    expect(activeKey('minute')).toBe('minute-30')
    wrapper.unmount()
  })

  it('стрелки двигают курсор, Home и End — края колонки', async () => {
    const wrapper = mountPicker({ modelValue: at(9, 0) })
    await openPicker(wrapper)

    await press('hour', 'ArrowDown')
    expect(activeKey('hour')).toBe('hour-10')

    await press('hour', 'ArrowUp')
    await press('hour', 'ArrowUp')
    expect(activeKey('hour')).toBe('hour-8')

    await press('hour', 'Home')
    expect(activeKey('hour')).toBe('hour-0')

    await press('hour', 'End')
    expect(activeKey('hour')).toBe('hour-23')
    wrapper.unmount()
  })

  it('курсор кольцуется на краях колонки', async () => {
    // Список конечный и короткий: уехать «за 23 часа» некуда, кроме как в начало.
    const wrapper = mountPicker({ modelValue: at(23, 0) })
    await openPicker(wrapper)

    await press('hour', 'ArrowDown')
    expect(activeKey('hour')).toBe('hour-0')
    wrapper.unmount()
  })

  it('Enter выбирает значение под курсором', async () => {
    const wrapper = mountPicker({ modelValue: at(9, 0) })
    await openPicker(wrapper)

    await press('hour', 'ArrowDown')
    await press('hour', 'Enter')

    expect(wrapper.emitted('update:modelValue')?.at(-1)?.[0]).toEqual(at(10, 0))
    wrapper.unmount()
  })

  it('Space выбирает и не прокручивает страницу', async () => {
    const wrapper = mountPicker({ modelValue: at(9, 0) })
    await openPicker(wrapper)

    const event = new KeyboardEvent('keydown', { key: ' ', bubbles: true, cancelable: true })
    column('minute').element.dispatchEvent(event)
    await nextTick()

    expect(event.defaultPrevented).toBe(true)
    expect(wrapper.emitted('update:modelValue')).toBeTruthy()
    wrapper.unmount()
  })

  it('каждая колонка — своя остановка Tab со своим курсором', async () => {
    const wrapper = mountPicker({ modelValue: at(9, 30) })
    await openPicker(wrapper)

    await press('minute', 'ArrowDown')

    expect(activeKey('minute')).toBe('minute-31')
    expect(activeKey('hour'), 'курсор соседней колонки не должен двигаться').toBe('hour-9')
    wrapper.unmount()
  })
})

describe('GrTimePicker — границы и негативные сценарии', () => {
  it('значения вне min помечены aria-disabled и не выбираются', async () => {
    const wrapper = mountPicker({ modelValue: at(9, 45), min: at(9, 30), minuteStep: 15 })
    await openPicker(wrapper)

    expect(option('minute-0').attributes('aria-disabled')).toBe('true')
    expect(option('minute-30').attributes('aria-disabled')).toBeUndefined()

    await option('minute-0').trigger('click')
    expect(wrapper.emitted('update:modelValue')).toBeFalsy()
    wrapper.unmount()
  })

  it('запрещённое значение не выбирается и с клавиатуры', async () => {
    const wrapper = mountPicker({ modelValue: at(9, 30), min: at(9, 30), minuteStep: 15 })
    await openPicker(wrapper)

    // Курсор на 30, шаг вверх — на запрещённые 15.
    await press('minute', 'ArrowUp')
    expect(activeKey('minute')).toBe('minute-15')

    await press('minute', 'Enter')
    expect(wrapper.emitted('update:modelValue')).toBeFalsy()
    wrapper.unmount()
  })

  it('disabled не открывает панель', async () => {
    const wrapper = mountPicker({ disabled: true })

    await openPicker(wrapper)

    expect(panelExists()).toBe(false)
    expect(wrapper.emitted('update:open')).toBeFalsy()
    wrapper.unmount()
  })

  it('readonly открывает панель, но выбор не меняется', async () => {
    const wrapper = mountPicker({ modelValue: at(9, 0), readonly: true })
    await openPicker(wrapper)
    expect(panelExists()).toBe(true)

    await option('hour-10').trigger('click')
    await press('hour', 'Enter')

    expect(wrapper.emitted('update:modelValue')).toBeFalsy()
    wrapper.unmount()
  })

  it('readonly, пришедший от GrFormField, тоже блокирует выбор', async () => {
    // Значение держит сам стенд: тогда «выбор не состоялся» видно в поле, а не
    // только в эмитах — и проверка не зависит от того, как обёрнут компонент.
    const Harness = defineComponent({
      setup: () => ({ value: ref<Date | null>(at(9, 0)) }),
      render(this: { value: Date | null }) {
        return h(GrFormField, { label: 'Время', readonly: true }, {
          // `as never` — дженерик-SFC не выводится через `h()`; тот же приём,
          // что в тесте `GrDatePicker`.
          default: () => h(GrTimePicker as never, {
            'locale': 'en-US',
            'today': TODAY,
            'use12Hours': false,
            'modelValue': this.value,
            'onUpdate:modelValue': (next: Date | null) => { this.value = next },
          }),
        })
      },
    })
    const wrapper = mount(Harness, { attachTo: document.body })

    await wrapper.get('[data-gr-time-picker-field]').trigger('click')
    for (let i = 0; i < 4; i += 1) await nextTick()
    await option('hour-10').trigger('click')
    await nextTick()

    expect((wrapper.get('[data-gr-time-picker-field]').element as HTMLInputElement).value).toBe('09:00')
    wrapper.unmount()
  })
})

describe('GrTimePicker — форма', () => {
  it('форме уходит сериализованное значение, а не видимый текст', () => {
    const wrapper = mountPicker({
      modelValue: '2026-08-12T15:30:00',
      valueAdapter: 'isoDateTime',
      name: 'meeting',
    })
    const hidden = wrapper.get('input[type="hidden"]')

    expect(hidden.attributes('name')).toBe('meeting')
    expect((hidden.element as HTMLInputElement).value).toBe('2026-08-12T15:30:00')
    expect((field(wrapper).element as HTMLInputElement).value).toBe('15:30')
    wrapper.unmount()
  })

  it('адаптер isoDateTime отдаёт строку и сохраняет дату значения', async () => {
    const wrapper = mountPicker({ modelValue: '2026-08-12T15:30:00', valueAdapter: 'isoDateTime' })
    await openPicker(wrapper)

    await option('hour-8').trigger('click')

    expect(wrapper.emitted('update:modelValue')?.at(-1)?.[0]).toBe('2026-08-12T08:30:00')
    wrapper.unmount()
  })

  it('очистка отдаёт null и своё событие', async () => {
    const wrapper = mountPicker({ modelValue: at(9, 0), clearable: true })

    await wrapper.get('[data-gr-time-picker-clear]').trigger('click')

    expect(wrapper.emitted('update:modelValue')?.at(-1)).toEqual([null])
    expect(wrapper.emitted('clear')).toHaveLength(1)
    wrapper.unmount()
  })
})

describe('GrTimePicker — inline', () => {
  it('колонки на месте, поля нет, фокус не забирается', async () => {
    const before = document.activeElement
    const wrapper = mountPicker({ inline: true, modelValue: at(9, 30) })
    for (let i = 0; i < 4; i += 1) await nextTick()

    expect(document.querySelector('[data-gr-time-picker-field]')).toBeNull()
    expect(document.querySelector('[data-gr-picker-inline]')).not.toBeNull()
    expect(options('hour')).toHaveLength(24)
    expect(document.activeElement).toBe(before)
    wrapper.unmount()
  })

  it('курсор колонки объявлен и без открытия панели', async () => {
    // В `inline` панель не «открывают» — `aria-activedescendant` обязан быть
    // всё равно, иначе клавиатура молчит для скринридера.
    const wrapper = mountPicker({ inline: true, modelValue: at(9, 30) })
    for (let i = 0; i < 4; i += 1) await nextTick()

    await press('hour', 'ArrowDown')

    expect(activeKey('hour')).toBe('hour-10')
    wrapper.unmount()
  })
})
