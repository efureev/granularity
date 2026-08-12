import { mount } from '@vue/test-utils'
import { defineComponent, h, nextTick } from 'vue'
import { describe, expect, it } from 'vitest'

import GrFormField from '@feugene/granularity/components/GrFormField'

import GrCalendar from '../../GrCalendar/GrCalendar.vue'
import GrDatePicker from '../GrDatePicker.vue'

/** Локальная полночь: пикер работает с датами, а не с моментами. */
function at(value: string): Date {
  const [y, m, d] = value.split('-').map(Number) as [number, number, number]
  return new Date(y, m - 1, d)
}

function mountPicker(props: Record<string, unknown> = {}, options: Record<string, unknown> = {}) {
  return mount(GrDatePicker, {
    props: { locale: 'en-US', today: at('2026-08-12'), ...props },
    attachTo: document.body,
    ...options,
  })
}

type Picker = ReturnType<typeof mountPicker>

function field(wrapper: Picker) {
  return wrapper.get('[data-gr-date-picker-field]')
}

function calendar(wrapper: Picker) {
  return wrapper.findComponent(GrCalendar)
}

function day(wrapper: Picker, key: string) {
  return calendar(wrapper).get(`[data-key="${key}"]`)
}

/**
 * Открытие асинхронно по построению: сначала монтируется панель, потом в неё
 * уходит фокус. Тик один на каждый шаг плюс запас на отрисовку сетки.
 */
async function openPicker(wrapper: Picker, how: 'click' | 'Enter' | ' ' | 'ArrowDown' = 'click') {
  if (how === 'click') await field(wrapper).trigger('click')
  else await field(wrapper).trigger('keydown', { key: how })

  for (let i = 0; i < 4; i += 1) await nextTick()
}

describe('GrDatePicker — поле и роли', () => {
  it('поле объявлено combobox и не редактируется вручную', () => {
    const wrapper = mountPicker()
    const input = field(wrapper)

    expect(input.attributes('role')).toBe('combobox')
    expect(input.attributes('readonly')).toBeDefined()
    expect(input.attributes('aria-haspopup')).toBe('dialog')
    expect(input.attributes('aria-expanded')).toBe('false')
    wrapper.unmount()
  })

  it('значение показывается по локали, пустое — плейсхолдером', () => {
    const wrapper = mountPicker({ modelValue: at('2026-08-12'), placeholder: 'Дата' })
    expect((field(wrapper).element as HTMLInputElement).value).toBe('Aug 12, 2026')

    const empty = mountPicker({ modelValue: null, placeholder: 'Дата' })
    expect((field(empty).element as HTMLInputElement).value).toBe('')
    expect(field(empty).attributes('placeholder')).toBe('Дата')

    wrapper.unmount()
    empty.unmount()
  })

  it('format задаёт вид значения опциями Intl', () => {
    const wrapper = mountPicker({
      modelValue: at('2026-08-12'),
      format: { dateStyle: 'full' } satisfies Intl.DateTimeFormatOptions,
    })

    expect((field(wrapper).element as HTMLInputElement).value).toBe('Wednesday, August 12, 2026')
    wrapper.unmount()
  })

  it('открытая панель объявлена полю через aria-expanded и aria-controls', async () => {
    const wrapper = mountPicker()
    await openPicker(wrapper)

    expect(field(wrapper).attributes('aria-expanded')).toBe('true')
    expect(field(wrapper).attributes('aria-controls')).toBeTruthy()
    wrapper.unmount()
  })

  it('невалидность и обязательность объявлены атрибутами роли combobox', () => {
    const wrapper = mountPicker({ invalid: true, required: true })

    expect(field(wrapper).attributes('aria-invalid')).toBe('true')
    expect(field(wrapper).attributes('aria-required')).toBe('true')
    wrapper.unmount()
  })
})

describe('GrDatePicker — ленивое монтирование панели', () => {
  it('до первого открытия сетки в DOM нет', () => {
    // `GrPopover` держит содержимое в `v-show`: без ленивого монтирования
    // каждая форма создавала бы по сетке на 42 ячейки на загрузке страницы.
    const wrapper = mountPicker()

    expect(calendar(wrapper).exists()).toBe(false)
    wrapper.unmount()
  })

  it('после открытия сетка есть и остаётся после закрытия', async () => {
    const wrapper = mountPicker()
    await openPicker(wrapper)
    expect(calendar(wrapper).exists()).toBe(true)

    // Размонтировать на закрытие нельзя: содержимое исчезло бы рывком посреди
    // анимации ухода.
    await wrapper.setProps({ open: false })
    await nextTick()
    expect(calendar(wrapper).exists()).toBe(true)
    wrapper.unmount()
  })
})

describe('GrDatePicker — клавиатура и фокус', () => {
  it.each(['Enter', ' ', 'ArrowDown'] as const)('%s открывает панель', async (key) => {
    const wrapper = mountPicker()
    await openPicker(wrapper, key)

    expect(calendar(wrapper).exists()).toBe(true)
    expect(wrapper.emitted('update:open')?.at(-1)).toEqual([true])
    wrapper.unmount()
  })

  it('Enter и Space не дают браузеру отправить форму и прокрутить страницу', async () => {
    const wrapper = mountPicker()

    for (const key of ['Enter', ' ']) {
      const event = new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true })
      field(wrapper).element.dispatchEvent(event)
      expect(event.defaultPrevented, `${key} не погашен`).toBe(true)
    }

    wrapper.unmount()
  })

  it('после открытия фокус уходит в сетку, а не остаётся на поле', async () => {
    const wrapper = mountPicker({ modelValue: at('2026-08-20') })
    await openPicker(wrapper)

    expect(document.activeElement?.getAttribute('data-key')).toBe('2026-08-20')
    wrapper.unmount()
  })

  it('повторный клик по полю закрывает панель', async () => {
    const wrapper = mountPicker()
    await openPicker(wrapper)

    await field(wrapper).trigger('click')
    expect(wrapper.emitted('update:open')?.at(-1)).toEqual([false])
    wrapper.unmount()
  })
})

describe('GrDatePicker — модель', () => {
  it('выбор дня отдаёт Date и закрывает панель', async () => {
    const wrapper = mountPicker()
    await openPicker(wrapper)

    await day(wrapper, '2026-08-12').trigger('click')

    expect(wrapper.emitted('update:modelValue')?.at(-1)?.[0]).toEqual(at('2026-08-12'))
    expect(wrapper.emitted('change')?.at(-1)?.[0]).toEqual(at('2026-08-12'))
    expect(wrapper.emitted('update:open')?.at(-1)).toEqual([false])
    wrapper.unmount()
  })

  it('адаптер isoDate читает и отдаёт строку', async () => {
    const wrapper = mountPicker({ valueAdapter: 'isoDate', modelValue: '2026-08-20' })
    expect((field(wrapper).element as HTMLInputElement).value).toBe('Aug 20, 2026')

    await openPicker(wrapper)
    await day(wrapper, '2026-08-12').trigger('click')

    expect(wrapper.emitted('update:modelValue')?.at(-1)?.[0]).toBe('2026-08-12')
    wrapper.unmount()
  })

  it('невалидное значение модели показывается пустым, а не роняет компонент', () => {
    const wrapper = mountPicker({ valueAdapter: 'isoDate', modelValue: '2026-02-31' })

    expect((field(wrapper).element as HTMLInputElement).value).toBe('')
    wrapper.unmount()
  })

  it('выбранный день попадает в сетку выделением', async () => {
    const wrapper = mountPicker({ modelValue: at('2026-08-20') })
    await openPicker(wrapper)

    const selected = calendar(wrapper).findAll('[role="gridcell"][aria-selected="true"]')
    expect(selected).toHaveLength(1)
    expect(selected[0]!.find('[data-gr-calendar-day]').attributes('data-key')).toBe('2026-08-20')
    wrapper.unmount()
  })
})

describe('GrDatePicker — негативные сценарии', () => {
  it('disabled не открывает панель ни кликом, ни клавишей', async () => {
    const wrapper = mountPicker({ disabled: true })

    await openPicker(wrapper)
    await openPicker(wrapper, 'Enter')

    expect(calendar(wrapper).exists()).toBe(false)
    expect(wrapper.emitted('update:open')).toBeFalsy()
    wrapper.unmount()
  })

  it('readonly открывает панель, но выбор не меняется', async () => {
    const wrapper = mountPicker({ readonly: true })
    await openPicker(wrapper)
    expect(calendar(wrapper).exists()).toBe(true)

    await day(wrapper, '2026-08-12').trigger('click')
    expect(wrapper.emitted('update:modelValue')).toBeFalsy()
    wrapper.unmount()
  })

  it('readonly доезжает до сетки, а не только до обёртки', async () => {
    // Гард в самом пикере молча гасил бы выбор, но сетка при этом выглядела
    // бы рабочей: ни `aria-readonly`, ни отключённого листания.
    const wrapper = mountPicker({ readonly: true })
    await openPicker(wrapper)

    expect(calendar(wrapper).get('[data-gr-calendar-grid]').attributes('aria-readonly')).toBe('true')
    expect(calendar(wrapper).get('[data-gr-calendar-next]').attributes('disabled')).toBeDefined()
    wrapper.unmount()
  })

  it('readonly, пришедший от GrFormField, тоже блокирует выбор', async () => {
    const Harness = defineComponent({
      render: () => h(GrFormField, { label: 'Дата', readonly: true }, {
        default: () => h(GrDatePicker as never, { locale: 'en-US', today: at('2026-08-12') }),
      }),
    })
    const wrapper = mount(Harness, { attachTo: document.body })
    const picker = wrapper.findComponent(GrDatePicker as never) as unknown as Picker

    await openPicker(picker)
    await day(picker, '2026-08-12').trigger('click')

    expect(picker.emitted('update:modelValue')).toBeFalsy()
    wrapper.unmount()
  })

  it('день вне min/max не выбирается', async () => {
    const wrapper = mountPicker({ min: at('2026-08-10'), max: at('2026-08-20') })
    await openPicker(wrapper)

    await day(wrapper, '2026-08-05').trigger('click')
    expect(wrapper.emitted('update:modelValue')).toBeFalsy()

    await day(wrapper, '2026-08-11').trigger('click')
    expect(wrapper.emitted('update:modelValue')?.at(-1)?.[0]).toEqual(at('2026-08-11'))
    wrapper.unmount()
  })

  it('предикат disabledDates получает Date, а не внутренний кортеж', async () => {
    const seen: unknown[] = []
    const wrapper = mountPicker({
      disabledDates: (date: Date) => {
        seen.push(date)
        return date.getDate() === 12
      },
    })
    await openPicker(wrapper)

    expect(seen[0]).toBeInstanceOf(Date)
    await day(wrapper, '2026-08-12').trigger('click')
    expect(wrapper.emitted('update:modelValue')).toBeFalsy()
    wrapper.unmount()
  })
})

describe('GrDatePicker — форма', () => {
  it('форме уходит сериализованное значение, а не видимый текст', () => {
    const wrapper = mountPicker({ name: 'birthday', valueAdapter: 'isoDate', modelValue: '2026-08-12' })
    const hidden = wrapper.get('input[type="hidden"]')

    expect(hidden.attributes('name')).toBe('birthday')
    expect((hidden.element as HTMLInputElement).value).toBe('2026-08-12')
    wrapper.unmount()
  })

  it('без name скрытого поля нет', () => {
    const wrapper = mountPicker({ modelValue: at('2026-08-12') })

    expect(wrapper.find('input[type="hidden"]').exists()).toBe(false)
    wrapper.unmount()
  })

  it('собственный id перебивает id от GrFormField', () => {
    const Harness = defineComponent({
      render: () => h(GrFormField, { label: 'Дата' }, {
        default: () => h(GrDatePicker as never, { id: 'my-date' }),
      }),
    })
    const wrapper = mount(Harness, { attachTo: document.body })

    expect(wrapper.get('[data-gr-date-picker-field]').attributes('id')).toBe('my-date')
    wrapper.unmount()
  })

  it('v-model:open открывает панель снаружи', async () => {
    const wrapper = mountPicker({ open: false })
    expect(calendar(wrapper).exists()).toBe(false)

    await wrapper.setProps({ open: true })
    await nextTick()
    expect(calendar(wrapper).exists()).toBe(true)
    wrapper.unmount()
  })
})

describe('GrDatePicker — очистка', () => {
  it('кнопка появляется только при значении и отдаёт null', async () => {
    const empty = mountPicker({ clearable: true })
    expect(empty.find('[data-gr-date-picker-clear]').exists()).toBe(false)
    empty.unmount()

    const wrapper = mountPicker({ clearable: true, modelValue: at('2026-08-12') })
    await wrapper.get('[data-gr-date-picker-clear]').trigger('click')

    expect(wrapper.emitted('update:modelValue')?.at(-1)).toEqual([null])
    expect(wrapper.emitted('change')?.at(-1)).toEqual([null])
    expect(wrapper.emitted('clear')).toHaveLength(1)
    wrapper.unmount()
  })

  it('без clearable кнопки нет, а readonly её убирает', () => {
    const plain = mountPicker({ modelValue: at('2026-08-12') })
    expect(plain.find('[data-gr-date-picker-clear]').exists()).toBe(false)
    plain.unmount()

    const readonly = mountPicker({ clearable: true, readonly: true, modelValue: at('2026-08-12') })
    expect(readonly.find('[data-gr-date-picker-clear]').exists()).toBe(false)
    readonly.unmount()
  })

  it('loading прячет очистку и объявляет занятость', () => {
    const wrapper = mountPicker({ clearable: true, loading: true, modelValue: at('2026-08-12') })

    expect(field(wrapper).attributes('aria-busy')).toBe('true')
    expect(wrapper.find('[data-gr-date-picker-clear]').exists()).toBe(false)
    expect(wrapper.find('[data-gr-date-picker-spinner]').exists()).toBe(true)
    wrapper.unmount()
  })
})

describe('GrDatePicker — inline', () => {
  it('панель на месте, поля и поповера нет', () => {
    const wrapper = mountPicker({ inline: true, modelValue: at('2026-08-12') })

    expect(wrapper.find('[data-gr-date-picker-field]').exists()).toBe(false)
    expect(wrapper.find('[data-gr-picker-inline]').exists()).toBe(true)
    expect(calendar(wrapper).exists()).toBe(true)
    wrapper.unmount()
  })

  it('фокус на монтировании не забирается', async () => {
    const before = document.activeElement
    const wrapper = mountPicker({ inline: true })
    for (let i = 0; i < 4; i += 1) await nextTick()

    expect(document.activeElement).toBe(before)
    wrapper.unmount()
  })

  it('фокус не забирается даже при open=true', async () => {
    // Панель и так на экране: `open` у inline-пикера ничего не открывает, но
    // и права уводить фокус со страницы не даёт.
    const before = document.activeElement
    const wrapper = mountPicker({ inline: true, open: true, modelValue: at('2026-08-12') })
    for (let i = 0; i < 4; i += 1) await nextTick()

    expect(document.activeElement).toBe(before)
    wrapper.unmount()
  })

  it('выбор работает и отдаёт то же, что в панели', async () => {
    const wrapper = mountPicker({ inline: true, name: 'day', valueAdapter: 'isoDate', modelValue: '2026-08-12' })

    await day(wrapper, '2026-08-20').trigger('click')

    expect(wrapper.emitted('update:modelValue')?.at(-1)?.[0]).toBe('2026-08-20')
    // Модель и форма остаются пикеровскими — этим `inline` и отличается от
    // голого `GrCalendar`, который говорит кортежами.
    expect((wrapper.get('input[type="hidden"]').element as HTMLInputElement).value).toBe('2026-08-12')
    wrapper.unmount()
  })

  it('режим месяцев показывает месяц с годом', () => {
    const wrapper = mountPicker({ mode: 'month', modelValue: at('2026-08-12') })

    expect((field(wrapper).element as HTMLInputElement).value).toBe('August 2026')
    wrapper.unmount()
  })

  it('режим лет показывает год', () => {
    const wrapper = mountPicker({ mode: 'year', modelValue: at('2026-08-12') })

    expect((field(wrapper).element as HTMLInputElement).value).toBe('2026')
    wrapper.unmount()
  })

  it('в режиме месяцев панель показывает сетку периодов', async () => {
    const wrapper = mountPicker({ mode: 'month', modelValue: at('2026-08-12') })
    await openPicker(wrapper)

    expect(calendar(wrapper).findAll('[data-gr-calendar-period]')).toHaveLength(12)
    expect(calendar(wrapper).find('[data-gr-calendar-grid]').exists()).toBe(false)
    wrapper.unmount()
  })
})
