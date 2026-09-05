import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'
import { describe, expect, it, vi } from 'vitest'

import GrInput from '../GrInput.vue'
import { mockRect } from '../../../testing'

describe('GrInput', () => {
  it('поддерживает size=xs', () => {
    const wrapper = mount(GrInput, {
      props: {
        modelValue: 'Hello',
        size: 'xs',
      },
    })

    const input = wrapper.get('input')
    expect(input.attributes('class')).toContain('h-7')
    expect(input.attributes('class')).toContain('px-2.5')
    expect(input.attributes('class')).toContain('text-[length:var(--gr-control-text-xs)]')
  })

  it('поддерживает size=lg', () => {
    const wrapper = mount(GrInput, {
      props: {
        modelValue: 'Hello',
        size: 'lg',
      },
    })

    const input = wrapper.get('input')
    expect(input.attributes('class')).toContain('h-11')
    expect(input.attributes('class')).toContain('px-4')
    expect(input.attributes('class')).toContain('text-[length:var(--gr-control-text-lg)]')
  })

  it('по умолчанию использует size=md', () => {
    const wrapper = mount(GrInput, {
      props: {
        modelValue: '',
      },
    })

    const input = wrapper.get('input')
    expect(input.attributes('class')).toContain('h-10')
    expect(input.attributes('class')).toContain('px-3')
  })

  it('поддерживает textAlign', () => {
    const wrapper = mount(GrInput, {
      props: {
        modelValue: '123',
        textAlign: 'right',
      },
    })

    const input = wrapper.get('input')
    expect(input.attributes('class')).toContain('text-right')
  })

  it('экспортирует focus() через expose', () => {
    const wrapper = mount(GrInput, {
      props: {
        modelValue: '',
      },
    })

    const input = wrapper.get('input').element as HTMLInputElement
    const focusSpy = vi.spyOn(input, 'focus')

    ;(wrapper.vm as unknown as { focus: () => void }).focus()

    expect(focusSpy).toHaveBeenCalledTimes(1)
  })

  it('поддерживает prefix slot (зарезервированное место внутри, без изменения внешнего размера)', () => {
    const wrapper = mount(GrInput, {
      props: {
        modelValue: '123',
        size: 'md',
      },
      slots: {
        prefix: '₽',
      },
    })

    expect(wrapper.find('.left-0').exists()).toBe(true)

    const inputEl = wrapper.get('input').element as HTMLInputElement
    expect(inputEl.style.paddingLeft).toBe('calc(12px + 2.5rem)')
  })

  it('поддерживает suffix slot (зарезервированное место внутри, без изменения внешнего размера)', () => {
    const wrapper = mount(GrInput, {
      props: {
        modelValue: '123',
        size: 'md',
      },
      slots: {
        suffix: 'kg',
      },
    })

    expect(wrapper.find('.right-0').exists()).toBe(true)

    const inputEl = wrapper.get('input').element as HTMLInputElement
    expect(inputEl.style.paddingRight).toBe('calc(12px + 2.5rem)')
  })

  it('позволяет ограничить ширину prefix/suffix через min/max props', () => {
    const wrapper = mount(GrInput, {
      props: {
        modelValue: '123',
        size: 'md',
        prefixMinWidth: '1rem',
        prefixMaxWidth: '3rem',
        suffixMinWidth: '2rem',
        suffixMaxWidth: '4rem',
      },
      slots: {
        prefix: 'very-long-prefix',
        suffix: 'very-long-suffix',
      },
    })

    const prefix = wrapper.get('[data-testid="gr-input-prefix"]').element as HTMLElement
    expect(prefix.style.minWidth).toBe('1rem')
    expect(prefix.style.maxWidth).toBe('3rem')

    const suffix = wrapper.get('[data-testid="gr-input-suffix"]').element as HTMLElement
    expect(suffix.style.minWidth).toBe('2rem')
    expect(suffix.style.maxWidth).toBe('4rem')
  })

  it('если реальная ширина prefix больше minWidth — увеличивает paddingLeft под фактический размер', async () => {
    const wrapper = mount(GrInput, {
      props: {
        modelValue: '123',
        size: 'md',
      },
      slots: {
        prefix: 'prefix',
      },
    })

    const prefix = wrapper.get('[data-testid="gr-input-prefix"]').element as HTMLElement
    mockRect(prefix, { width: 120 })

    await wrapper.setProps({ modelValue: '124' })
    await nextTick()

    const inputEl = wrapper.get('input').element as HTMLInputElement
    expect(inputEl.style.paddingLeft).toBe('132px')
  })
})
describe('GrInput — clearable / password / readonly / count (feature)', () => {
  it('readonly: ставит readonly-атрибут', () => {
    const wrapper = mount(GrInput, { props: { modelValue: 'x', readonly: true } })
    expect((wrapper.get('input').element as HTMLInputElement).readOnly).toBe(true)
  })

  it('clearable: показывает кнопку при значении и эмитит пустую строку', async () => {
    const wrapper = mount(GrInput, { props: { modelValue: 'hello', clearable: true } })
    const clearBtn = wrapper.find('[data-gr-input-clear]')
    expect(clearBtn.exists()).toBe(true)

    await clearBtn.trigger('click')
    expect(wrapper.emitted('update:modelValue')?.at(-1)).toEqual([''])
  })

  it('clearable: кнопки нет при пустом значении или readonly', () => {
    expect(mount(GrInput, { props: { modelValue: '', clearable: true } }).find('[data-gr-input-clear]').exists()).toBe(false)
    expect(mount(GrInput, { props: { modelValue: 'x', clearable: true, readonly: true } }).find('[data-gr-input-clear]').exists()).toBe(false)
  })

  it('passwordToggle: переключает type password ↔ text', async () => {
    const wrapper = mount(GrInput, { props: { modelValue: 'secret', type: 'password', passwordToggle: true } })
    const input = wrapper.get('input')
    expect(input.attributes('type')).toBe('password')

    await wrapper.get('[data-gr-input-password-toggle]').trigger('click')
    expect(input.attributes('type')).toBe('text')
  })

  it('showCount + maxlength: показывает счётчик и ограничивает длину', () => {
    const wrapper = mount(GrInput, { props: { modelValue: 'abc', showCount: true, maxlength: 10 } })
    expect(wrapper.get('[data-gr-input-count]').text()).toBe('3 / 10')
    expect(wrapper.get('input').attributes('maxlength')).toBe('10')
  })
})

describe('GrInput — клавиатура trailing-кнопок', () => {
  // `tabindex="-1"` объявлял кнопки доступными (`aria-label`, `aria-pressed`)
  // и одновременно недостижимыми: очистить поле или посмотреть пароль
  // клавиатурой было нельзя.
  it('кнопки очистки и показа пароля остаются в таб-порядке', () => {
    const wrapper = mount(GrInput, {
      props: { modelValue: 'secret', type: 'password', passwordToggle: true, clearable: true },
    })

    expect(wrapper.get('[data-gr-input-clear]').attributes('tabindex')).toBeUndefined()
    expect(wrapper.get('[data-gr-input-password-toggle]').attributes('tabindex')).toBeUndefined()
  })

  it('после очистки фокус возвращается в поле — кнопка исчезает вместе со значением', async () => {
    const wrapper = mount(GrInput, {
      props: { modelValue: 'hello', clearable: true },
      attachTo: document.body,
    })

    await wrapper.get('[data-gr-input-clear]').trigger('click')

    expect(document.activeElement).toBe(wrapper.get('input').element)
    wrapper.unmount()
  })

  it('переключатель пароля возвращает фокус в поле', async () => {
    const wrapper = mount(GrInput, {
      props: { modelValue: 'secret', type: 'password', passwordToggle: true },
      attachTo: document.body,
    })

    await wrapper.get('[data-gr-input-password-toggle]').trigger('click')

    expect(document.activeElement).toBe(wrapper.get('input').element)
    wrapper.unmount()
  })
})

describe('GrInput — disabled', () => {
  // `opacity-50` разбавляла выверенные на AA токены текста: гасим фоном.
  it('гасится токенами фона, а не прозрачностью', () => {
    const wrapper = mount(GrInput, { props: { modelValue: 'x', disabled: true } })
    const shell = wrapper.get('[data-gr-input] > div')

    expect(shell.classes()).toContain('bg-[var(--gr-muted)]')
    expect(shell.classes()).toContain('cursor-not-allowed')
    expect(shell.classes().some(cls => cls.startsWith('opacity-'))).toBe(false)
  })

  // Контраст сохраняем, но disabled обязан читаться как disabled: без этого
  // заблокированное поле выглядело обычным (поймано визуальным гейтом GrSelect).
  it('приглушает и текст значения, а не только фон', () => {
    const wrapper = mount(GrInput, { props: { modelValue: 'x', disabled: true } })
    expect(wrapper.get('input').classes()).toContain('disabled:text-[var(--gr-muted-fg)]')
  })

  it('включённое поле остаётся на фоне поверхности', () => {
    const wrapper = mount(GrInput, { props: { modelValue: 'x' } })
    const shell = wrapper.get('[data-gr-input] > div')

    expect(shell.classes()).toContain('bg-[var(--gr-bg)]')
    expect(shell.classes()).not.toContain('bg-[var(--gr-muted)]')
  })
})

describe('GrInput — счётчик символов', () => {
  it('связан с полем через aria-describedby', () => {
    const wrapper = mount(GrInput, { props: { modelValue: 'abc', showCount: true, maxlength: 10 } })

    const countId = wrapper.get('[data-gr-input-count]').attributes('id')
    expect(countId).toBeTruthy()
    expect(wrapper.get('input').attributes('aria-describedby')).toBe(countId)
  })

  it('без showCount описание поля не появляется из ниоткуда', () => {
    const wrapper = mount(GrInput, { props: { modelValue: 'abc', maxlength: 10 } })
    expect(wrapper.get('input').attributes('aria-describedby')).toBeUndefined()
  })

  it('живой регион молчит до исчерпания лимита', async () => {
    const wrapper = mount(GrInput, { props: { modelValue: 'abc', showCount: true, maxlength: 5 } })
    const live = wrapper.get('[data-gr-input-live]')

    expect(live.attributes('role')).toBe('status')
    expect(live.text()).toBe('')

    await wrapper.setProps({ modelValue: 'abcde' })
    expect(wrapper.get('[data-gr-input-live]').text()).toBe('Character limit reached')
  })
})

describe('GrInput — события и императивный API', () => {
  it('эмитит change со строкой', async () => {
    const wrapper = mount(GrInput, { props: { modelValue: 'a' } })
    const input = wrapper.get('input')
    ;(input.element as HTMLInputElement).value = 'ab'

    await input.trigger('change')
    expect(wrapper.emitted('change')?.at(-1)).toEqual(['ab'])
  })

  it('эмитит focus и blur', async () => {
    const wrapper = mount(GrInput, { props: { modelValue: '' } })
    const input = wrapper.get('input')

    await input.trigger('focus')
    await input.trigger('blur')

    expect(wrapper.emitted('focus')).toHaveLength(1)
    expect(wrapper.emitted('blur')).toHaveLength(1)
  })

  // Ручное стирание и очистку кнопкой по `update:modelValue` не различить.
  it('очистка кнопкой отдельно объявляется событием clear', async () => {
    const wrapper = mount(GrInput, { props: { modelValue: 'hello', clearable: true } })

    await wrapper.get('[data-gr-input-clear]').trigger('click')

    expect(wrapper.emitted('clear')).toHaveLength(1)
    expect(wrapper.emitted('update:modelValue')?.at(-1)).toEqual([''])
  })

  // Очистка — такая же фиксация значения, как уход фокуса: слушающий `change`
  // ради «значение установилось» пропускал бы ровно её. Соседняя `GrTextarea`
  // так и делает, а текстовое поле из этого ряда выпадало.
  it('очистка кнопкой фиксирует значение событием change', async () => {
    const wrapper = mount(GrInput, { props: { modelValue: 'hello', clearable: true } })

    await wrapper.get('[data-gr-input-clear]').trigger('click')

    expect(wrapper.emitted('change')).toEqual([['']])
    // Порядок важен: сначала значение, потом его фиксация, и только затем
    // «стёрто кнопкой» — обработчик `clear` вправе рассчитывать на свежую модель.
    // Сверяем порядок трёх, а не весь список: `clear()` возвращает фокус в поле,
    // и `focus` в хвосте к контракту очистки отношения не имеет.
    const order = Object.keys(wrapper.emitted())
      .filter(name => ['update:modelValue', 'change', 'clear'].includes(name))

    expect(order).toEqual(['update:modelValue', 'change', 'clear'])
  })

  it('expose отдаёт focus/blur/select', async () => {
    const wrapper = mount(GrInput, { props: { modelValue: 'hello' }, attachTo: document.body })
    const api = wrapper.vm as unknown as { focus: () => void, blur: () => void, select: () => void }
    const input = wrapper.get('input').element as HTMLInputElement

    api.focus()
    expect(document.activeElement).toBe(input)

    api.select()
    expect(input.selectionStart).toBe(0)
    expect(input.selectionEnd).toBe('hello'.length)

    api.blur()
    expect(document.activeElement).not.toBe(input)
    wrapper.unmount()
  })
})

describe('GrInput — loading', () => {
  it('показывает спиннер и объявляет занятость, не блокируя ввод', () => {
    const wrapper = mount(GrInput, { props: { modelValue: 'x', loading: true } })

    expect(wrapper.find('[data-gr-input-spinner]').exists()).toBe(true)
    expect(wrapper.get('input').attributes('aria-busy')).toBe('true')
    expect((wrapper.get('input').element as HTMLInputElement).disabled).toBe(false)
  })

  it('спиннер резервирует место справа наравне с кнопками', () => {
    const idle = mount(GrInput, { props: { modelValue: 'x' } })
    const busy = mount(GrInput, { props: { modelValue: 'x', loading: true } })

    expect((idle.get('input').element as HTMLInputElement).style.paddingRight).toBe('')
    expect((busy.get('input').element as HTMLInputElement).style.paddingRight).not.toBe('')
  })

  it('без loading спиннера нет', () => {
    expect(mount(GrInput, { props: { modelValue: 'x' } }).find('[data-gr-input-spinner]').exists()).toBe(false)
  })
})

/**
 * Аддон-сегмент и украшение внутри рамки — разные сущности.
 *
 * Сегмент отрезан рамкой и держит ширину ступени размера: так поля с «₽» и
 * «USD» стоят в колонку. Поисковая строка с лупой в таком отсеке читается
 * составным элементом, а не одним полем, — из-за этого иконку внутри рамки
 * нельзя было выразить вовсе, и от неё отказывались.
 */
describe('GrInput — режим аддонов', () => {
  it('по умолчанию сегмент: рамка-разделитель и своя ширина', () => {
    const wrapper = mount(GrInput, {
      props: { modelValue: '' },
      slots: { prefix: '₽', suffix: 'кг' },
    })

    const prefix = wrapper.get('[data-testid="gr-input-prefix"]')
    const suffix = wrapper.get('[data-testid="gr-input-suffix"]')

    expect(prefix.classes()).toContain('border-r')
    expect(suffix.classes()).toContain('border-l')
    // Ширина ступени размера — иначе соседние поля разъезжаются.
    expect(prefix.attributes('style')).toContain('min-width')
  })

  it('`inline` снимает разделитель и собственную ширину', () => {
    const wrapper = mount(GrInput, {
      props: { modelValue: '', addon: 'inline' },
      slots: { prefix: '🔍', suffix: 'кг' },
    })

    const prefix = wrapper.get('[data-testid="gr-input-prefix"]')
    const suffix = wrapper.get('[data-testid="gr-input-suffix"]')

    expect(prefix.classes()).not.toContain('border-r')
    expect(suffix.classes()).not.toContain('border-l')
    expect(prefix.attributes('style') ?? '').toContain('min-width: 0px')
  })

  it('поле всё равно отступает под украшение', () => {
    const wrapper = mount(GrInput, {
      props: { modelValue: '', addon: 'inline' },
      slots: { prefix: '🔍' },
    })

    // Отступ считается по измеренной ширине, а не по ступени: текст начинается
    // сразу за иконкой, а не в пустом отсеке.
    expect(wrapper.get('input').attributes('style') ?? '').toContain('padding-left')
  })
})

describe('GrInput — признак состояния', () => {
  it('success и warning несут не только цвет: иконка плюс подпись в описании поля', () => {
    for (const state of ['success', 'warning'] as const) {
      const wrapper = mount(GrInput, { props: { modelValue: '', state } })

      const icon = wrapper.get('[data-gr-input-state]')
      // Иконка — для глаз, поэтому от скринридера скрыта: смысл ему несёт подпись.
      expect(icon.attributes('aria-hidden')).toBe('true')

      const text = wrapper.get('[data-gr-input-state-text]')
      expect(text.text()).not.toBe('')

      // Без этой связи подпись видна только глазами — то есть не существует.
      const describedBy = wrapper.get('input').attributes('aria-describedby') ?? ''
      expect(describedBy.split(' ')).toContain(text.attributes('id'))
    }
  })

  it('у default и danger признака нет', () => {
    for (const state of ['default', 'danger'] as const) {
      const wrapper = mount(GrInput, { props: { modelValue: '', state } })
      expect(wrapper.find('[data-gr-input-state]').exists()).toBe(false)
    }
  })

  /**
   * Галочка «корректно» рядом с `aria-invalid="true"` противоречила бы ему:
   * глаза читали бы одно, диктор — другое.
   */
  it('невалидность гасит признак, даже если state=success', () => {
    const wrapper = mount(GrInput, { props: { modelValue: '', state: 'success', invalid: true } })
    expect(wrapper.find('[data-gr-input-state]').exists()).toBe(false)
  })
})
