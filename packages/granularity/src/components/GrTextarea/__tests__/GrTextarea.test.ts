import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'

import GrTextarea from '../GrTextarea.vue'

describe('GrTextarea', () => {
  it('эмитит update:modelValue при вводе', async () => {
    const wrapper = mount(GrTextarea, {
      props: {
        modelValue: 'hello',
      },
    })

    await wrapper.get('textarea').setValue('updated')

    expect(wrapper.emitted('update:modelValue')).toEqual([['updated']])
  })

  it('использует danger-state при invalid=true независимо от state', () => {
    const wrapper = mount(GrTextarea, {
      props: {
        modelValue: '',
        invalid: true,
        state: 'success',
      },
    })

    const textarea = wrapper.get('textarea')

    expect(textarea.attributes('aria-invalid')).toBe('true')
    expect(textarea.attributes('class')).toContain('border-[var(--gr-invalid-brd)]')
    expect(textarea.attributes('class')).toContain('focus-visible:ring-[var(--gr-invalid-ring)]')
  })

  it('уважает rows и state для валидного значения', () => {
    const wrapper = mount(GrTextarea, {
      props: {
        modelValue: 'text',
        rows: 6,
        state: 'warning',
      },
    })

    const textarea = wrapper.get('textarea')

    expect(textarea.attributes('rows')).toBe('6')
    expect(textarea.attributes('class')).toContain('border-[var(--gr-warning)]')
    expect(textarea.attributes('class')).toContain('focus-visible:ring-[var(--gr-warning)]')
  })
})

describe('GrTextarea — паритет с GrInput', () => {
  it('счётчик символов связан с полем через aria-describedby', () => {
    const wrapper = mount(GrTextarea, { props: { modelValue: 'abc', showCount: true, maxlength: 10 } })

    const countId = wrapper.get('[data-gr-textarea-count]').attributes('id')
    expect(wrapper.get('[data-gr-textarea-count]').text()).toBe('3 / 10')
    expect(wrapper.get('textarea').attributes('aria-describedby')).toBe(countId)
    expect(wrapper.get('textarea').attributes('maxlength')).toBe('10')
  })

  it('счётчик строк считает переводы строки и связан с полем', () => {
    const wrapper = mount(GrTextarea, {
      props: { modelValue: 'первая\nвторая\nтретья', showLineCount: true },
    })

    const lines = wrapper.get('[data-gr-textarea-line-count]')
    // Без адаптера i18n подпись приходит из английского фолбэка с формой числа.
    expect(lines.text()).toContain('3')

    expect(wrapper.get('textarea').attributes('aria-describedby')).toContain(lines.attributes('id'))
  })

  it('maxLines только форматирует счётчик и не режет ввод', async () => {
    const wrapper = mount(GrTextarea, {
      props: { modelValue: 'одна\nдва', showLineCount: true, maxLines: 4 },
    })

    expect(wrapper.get('[data-gr-textarea-line-count]').text()).toBe('2 / 4')

    // Пять строк при `maxLines: 4` — счётчик показывает перебор, значение цело.
    await wrapper.setProps({ modelValue: 'a\nb\nc\nd\ne' })
    expect(wrapper.get('[data-gr-textarea-line-count]').text()).toBe('5 / 4')
    expect((wrapper.get('textarea').element as HTMLTextAreaElement).value).toBe('a\nb\nc\nd\ne')
  })

  it('счётчики включаются независимо, обёртку даёт любой из них', () => {
    const both = mount(GrTextarea, {
      props: { modelValue: 'a\nb', showCount: true, showLineCount: true, maxlength: 10 },
    })

    expect(both.find('[data-gr-textarea-line-count]').exists()).toBe(true)
    expect(both.get('[data-gr-textarea-count]').text()).toBe('3 / 10')

    const onlyLines = mount(GrTextarea, { props: { modelValue: 'a', showLineCount: true } })
    expect(onlyLines.find('[data-gr-textarea-count]').exists()).toBe(false)
    expect(onlyLines.find('[data-gr-textarea-wrap]').exists()).toBe(true)
  })

  it('без showCount поле остаётся корневым элементом', () => {
    const wrapper = mount(GrTextarea, { props: { modelValue: '' } })

    expect(wrapper.element.tagName).toBe('TEXTAREA')
    expect(wrapper.find('[data-gr-textarea-count]').exists()).toBe(false)
  })

  it('resize управляется пропом', () => {
    expect(mount(GrTextarea, { props: { modelValue: '' } }).classes()).toContain('resize-y')
    expect(mount(GrTextarea, { props: { modelValue: '', resize: 'none' } }).classes()).toContain('resize-none')
  })

  // Прозрачность разбавляет выверенные на AA токены текста.
  it('disabled гасится токенами, а не прозрачностью', () => {
    const wrapper = mount(GrTextarea, { props: { modelValue: '', disabled: true } })

    expect(wrapper.classes()).toContain('bg-[var(--gr-muted)]')
    expect(wrapper.classes().some(cls => cls.startsWith('opacity-'))).toBe(false)
  })

  it('readonly и size доходят до поля', () => {
    const wrapper = mount(GrTextarea, { props: { modelValue: 'x', readonly: true, size: 'lg' } })

    expect((wrapper.element as HTMLTextAreaElement).readOnly).toBe(true)
    expect(wrapper.classes()).toContain('text-[length:var(--gr-control-text-lg)]')
  })
})

describe('GrTextarea — контракт событий', () => {
  it('change отдаёт значение по нативному событию', async () => {
    const wrapper = mount(GrTextarea, { props: { modelValue: 'draft' } })
    const textarea = wrapper.get('textarea')

    ;(textarea.element as HTMLTextAreaElement).value = 'final'
    await textarea.trigger('change')

    expect(wrapper.emitted('change')).toEqual([['final']])
  })

  it('focus и blur переизлучаются с объектом события', async () => {
    const wrapper = mount(GrTextarea, { props: { modelValue: '' } })
    const textarea = wrapper.get('textarea')

    await textarea.trigger('focus')
    await textarea.trigger('blur')

    // Объявленный emit уходит из `$attrs`, поэтому переизлучение — единственный
    // способ сохранить `@focus`/`@blur` у потребителя.
    expect(wrapper.emitted('focus')?.[0][0]).toBeInstanceOf(Event)
    expect(wrapper.emitted('blur')?.[0][0]).toBeInstanceOf(Event)
  })

  it('события работают и в ветке со счётчиком', async () => {
    const wrapper = mount(GrTextarea, { props: { modelValue: '', showCount: true, maxlength: 10 } })
    const textarea = wrapper.get('textarea')

    // `setValue` в VTU шлёт и `input`, и `change` — отдельно триггерить не нужно.
    await textarea.setValue('hi')
    await textarea.trigger('focus')

    expect(wrapper.emitted('update:modelValue')).toEqual([['hi']])
    expect(wrapper.emitted('change')).toEqual([['hi']])
    expect(wrapper.emitted('focus')).toHaveLength(1)
  })
})

describe('GrTextarea — паритет веток', () => {
  const props = {
    modelValue: 'text',
    name: 'bio',
    rows: 6,
    maxlength: 200,
    placeholder: 'About you',
    ariaLabel: 'Bio',
    required: true,
    readonly: true,
  }

  it('поле рендерится одинаково со счётчиком и без него', () => {
    const plain = mount(GrTextarea, { props })
    const counted = mount(GrTextarea, { props: { ...props, showCount: true } })

    const attributesOf = (wrapper: ReturnType<typeof mount>) => {
      const element = wrapper.get('textarea').element
      return Object.fromEntries(
        [...element.attributes]
          // `aria-describedby` отличается намеренно: счётчик добавляет себя в описание.
          .filter(attr => attr.name !== 'aria-describedby')
          .map(attr => [attr.name, attr.value]),
      )
    }

    expect(attributesOf(counted)).toEqual(attributesOf(plain))
  })

  it('атрибуты потребителя доходят до поля в обеих ветках', () => {
    const attrs = { 'data-test': 'bio', 'spellcheck': 'false' }

    const plain = mount(GrTextarea, { props: { modelValue: '' }, attrs })
    const counted = mount(GrTextarea, { props: { modelValue: '', showCount: true }, attrs })

    for (const wrapper of [plain, counted]) {
      const textarea = wrapper.get('textarea')
      expect(textarea.attributes('data-test')).toBe('bio')
      expect(textarea.attributes('spellcheck')).toBe('false')
    }

    // Обёртка счётчика чужие атрибуты себе не забирает.
    expect(counted.get('[data-gr-textarea-wrap]').attributes('data-test')).toBeUndefined()
  })
})

describe('GrTextarea — clearable', () => {
  it('крестик виден при непустом значении, чистит и эмитит clear', async () => {
    const wrapper = mount(GrTextarea, { props: { modelValue: 'черновик', clearable: true, ariaLabel: 'Note' } })

    const button = wrapper.get('[data-gr-textarea-clear]')
    await button.trigger('click')

    expect(wrapper.emitted('update:modelValue')?.at(-1)).toEqual([''])
    expect(wrapper.emitted('change')?.at(-1)).toEqual([''])
    expect(wrapper.emitted('clear')).toHaveLength(1)
    wrapper.unmount()
  })

  it('скрыт при пустом значении, disabled и readonly', () => {
    const empty = mount(GrTextarea, { props: { modelValue: '', clearable: true, ariaLabel: 'N' } })
    expect(empty.find('[data-gr-textarea-clear]').exists()).toBe(false)
    empty.unmount()

    const disabled = mount(GrTextarea, { props: { modelValue: 'x', clearable: true, disabled: true, ariaLabel: 'N' } })
    expect(disabled.find('[data-gr-textarea-clear]').exists()).toBe(false)
    disabled.unmount()

    const readonly = mount(GrTextarea, { props: { modelValue: 'x', clearable: true, readonly: true, ariaLabel: 'N' } })
    expect(readonly.find('[data-gr-textarea-clear]').exists()).toBe(false)
    readonly.unmount()
  })

  it('без clearable кнопки нет', () => {
    const wrapper = mount(GrTextarea, { props: { modelValue: 'x', ariaLabel: 'N' } })
    expect(wrapper.find('[data-gr-textarea-clear]').exists()).toBe(false)
    wrapper.unmount()
  })
})
