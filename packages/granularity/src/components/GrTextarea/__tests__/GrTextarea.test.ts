import { mount } from '@vue/test-utils'
import { defineComponent, nextTick } from 'vue'
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

  it('обёртка есть всегда, а счётчик без showCount — нет', () => {
    const wrapper = mount(GrTextarea, { props: { modelValue: '' } })

    expect(wrapper.element.hasAttribute('data-gr-textarea-wrap')).toBe(true)
    expect(wrapper.find('textarea').exists()).toBe(true)
    expect(wrapper.find('[data-gr-textarea-count]').exists()).toBe(false)
  })

  it('resize управляется пропом', () => {
    expect(mount(GrTextarea, { props: { modelValue: '' } }).get('textarea').classes()).toContain('resize-y')
    expect(mount(GrTextarea, { props: { modelValue: '', resize: 'none' } }).get('textarea').classes()).toContain('resize-none')
  })

  // Прозрачность разбавляет выверенные на AA токены текста.
  it('disabled гасится токенами, а не прозрачностью', () => {
    const field = mount(GrTextarea, { props: { modelValue: '', disabled: true } }).get('textarea')

    expect(field.classes()).toContain('bg-[var(--gr-muted)]')
    expect(field.classes().some(cls => cls.startsWith('opacity-'))).toBe(false)
  })

  it('readonly и size доходят до поля', () => {
    const field = mount(GrTextarea, { props: { modelValue: 'x', readonly: true, size: 'lg' } }).get('textarea')

    expect((field.element as HTMLTextAreaElement).readOnly).toBe(true)
    expect(field.classes()).toContain('text-[length:var(--gr-control-text-lg)]')
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

describe('GrTextarea — признак состояния', () => {
  it('success и warning несут не только цвет: иконка плюс подпись в описании поля', () => {
    for (const state of ['success', 'warning'] as const) {
      const wrapper = mount(GrTextarea, { props: { modelValue: '', state } })

      expect(wrapper.get('[data-gr-textarea-state]').attributes('aria-hidden')).toBe('true')

      const text = wrapper.get('[data-gr-textarea-state-text]')
      expect(text.text()).not.toBe('')

      const describedBy = wrapper.get('textarea').attributes('aria-describedby') ?? ''
      expect(describedBy.split(' ')).toContain(text.attributes('id'))
    }
  })

  /**
   * Без очистки и без счётчиков поле остаётся корневым элементом — на этом
   * стоит контракт fallthrough-атрибутов. Признак заводит обёртку так же, как
   * её заводит кнопка очистки.
   */
  it('признак появляется в той же обёртке', () => {
    const bare = mount(GrTextarea, { props: { modelValue: '' } })
    expect(bare.find('[data-gr-textarea-state]').exists()).toBe(false)

    const signalled = mount(GrTextarea, { props: { modelValue: '', state: 'success' } })
    expect(signalled.find('[data-gr-textarea-state]').exists()).toBe(true)
  })

  it('невалидность гасит признак, даже если state=success', () => {
    const wrapper = mount(GrTextarea, { props: { modelValue: '', state: 'success', invalid: true } })
    expect(wrapper.find('[data-gr-textarea-state]').exists()).toBe(false)
  })
})

describe('GrTextarea — своя формулировка счётчика', () => {
  it('слот заменяет текст счётчика и получает длину, предел и остаток', () => {
    const wrapper = mount(GrTextarea, {
      props: { modelValue: 'abcd', showCount: true, maxlength: 10 },
      slots: { count: '<span data-own>осталось {{ params.remaining }} из {{ params.maxlength }}, набрано {{ params.length }}</span>' },
    })

    const count = wrapper.get('[data-gr-textarea-count]')
    expect(count.text()).toBe('осталось 6 из 10, набрано 4')
    expect(count.text()).not.toContain('4 / 10')
  })

  /**
   * Слот без `show-count` не рисовал бы ничего, и потребитель искал бы опечатку
   * в имени слота вместо забытого пропа.
   */
  it('слот показывает счётчик и без show-count, вместе со связкой по aria', () => {
    const wrapper = mount(GrTextarea, {
      props: { modelValue: 'ab' },
      slots: { count: '<span>своё</span>' },
    })

    const count = wrapper.get('[data-gr-textarea-count]')
    expect(count.text()).toBe('своё')
    expect(wrapper.get('textarea').attributes('aria-describedby')).toContain(count.attributes('id'))
  })

  it('без maxlength предел и остаток не выдумываются', () => {
    const wrapper = mount(GrTextarea, {
      props: { modelValue: 'abc', showCount: true },
      slots: { count: '<span>{{ params.length }}|{{ params.maxlength ?? "нет" }}|{{ params.remaining ?? "нет" }}</span>' },
    })

    expect(wrapper.get('[data-gr-textarea-count]').text()).toBe('3|нет|нет')
  })

  /**
   * `maxlength` держит только ввод с клавиатуры: значение из кода ограничение
   * перешагивает, и ноль вместо «-2» скрыл бы ровно тот случай, ради которого
   * потребитель и берёт свою формулировку.
   */
  it('перебор длины даёт отрицательный остаток, а не ноль', () => {
    const wrapper = mount(GrTextarea, {
      props: { modelValue: '123456789012', showCount: true, maxlength: 10 },
      slots: { count: '<span>{{ params.remaining }}</span>' },
    })

    expect(wrapper.get('[data-gr-textarea-count]').text()).toBe('-2')
  })

  it('без слота счётчик остаётся прежним', () => {
    const wrapper = mount(GrTextarea, { props: { modelValue: 'abcd', showCount: true, maxlength: 10 } })

    expect(wrapper.get('[data-gr-textarea-count]').text()).toBe('4 / 10')
  })
})

/**
 * Обёртка появлялась вместе с признаком, крестиком или счётчиком, и
 * `<textarea>` пересоздавался: на «1100-445» `state` становился `success`,
 * фокус уходил на `<body>`, и «␣Lisboa» не набиралось никуда.
 */
describe('GrTextarea — поле не пересоздаётся', () => {
  function typing(props: Record<string, unknown>, decide: (value: string) => Record<string, unknown>) {
    const Host = defineComponent({
      components: { GrTextarea },
      data: () => ({ value: '' }),
      computed: { extra(): Record<string, unknown> { return decide(this.value) } },
      template: '<GrTextarea v-model="value" v-bind="{ ...props, ...extra }" />',
      setup: () => ({ props }),
    })

    return mount(Host, { attachTo: document.body })
  }

  async function type(wrapper: ReturnType<typeof mount>, text: string) {
    const field = wrapper.get('textarea')
    ;(field.element as HTMLTextAreaElement).value = text
    await field.trigger('input')
    await nextTick()
  }

  it('`state` меняется на лету — тот же узел, фокус и каретка на месте', async () => {
    const wrapper = typing({}, value => ({ state: /\d{4}-\d{3}/.test(value) ? 'success' : 'default' }))
    const before = wrapper.get('textarea').element as HTMLTextAreaElement
    before.focus()

    await type(wrapper, '1100-445')
    before.setSelectionRange(8, 8)

    const after = wrapper.get('textarea').element as HTMLTextAreaElement
    expect(wrapper.find('[data-gr-textarea-state]').exists()).toBe(true)
    expect(after).toBe(before)
    expect(document.activeElement).toBe(before)
    expect(after.selectionStart).toBe(8)
    wrapper.unmount()
  })

  it('первый символ при `clearable` — крестик появился, фокус остался', async () => {
    const wrapper = typing({ clearable: true }, () => ({}))
    const before = wrapper.get('textarea').element as HTMLTextAreaElement
    before.focus()

    await type(wrapper, 'R')

    expect(wrapper.find('[data-gr-textarea-clear]').exists()).toBe(true)
    expect(wrapper.get('textarea').element).toBe(before)
    expect(document.activeElement).toBe(before)
    wrapper.unmount()
  })

  it('счётчик включается и выключается — тот же узел', async () => {
    const wrapper = mount(GrTextarea, { props: { modelValue: 'x' }, attachTo: document.body })
    const before = wrapper.get('textarea').element

    await wrapper.setProps({ showCount: true, maxlength: 10 })
    expect(wrapper.find('[data-gr-textarea-count]').exists()).toBe(true)
    expect(wrapper.get('textarea').element).toBe(before)

    await wrapper.setProps({ showCount: false })
    expect(wrapper.get('textarea').element).toBe(before)
    wrapper.unmount()
  })

  it('поле — блочное: высота не зависит от того, есть ли соседи', () => {
    for (const props of [{}, { state: 'success' }, { clearable: true, modelValue: 'x' }] as Record<string, unknown>[]) {
      const wrapper = mount(GrTextarea, { props: { modelValue: '', ...props } })
      expect(wrapper.get('textarea').classes()).toContain('block')
      wrapper.unmount()
    }
  })
})

/** Кнопка очистки и признак лежат поверх поля: первая строка не должна уходить под «×». */
describe('GrTextarea — место под кнопку и признак справа', () => {
  it.each([
    ['clearable', { clearable: true }, '2.25rem'],
    ['признак', { state: 'success' }, '2.25rem'],
    ['оба', { clearable: true, state: 'success' }, '3.75rem'],
  ] as [string, Record<string, unknown>, string][])('%s', (_name, props, padding) => {
    const wrapper = mount(GrTextarea, { props: { modelValue: 'Your invoice INV-0419 was sent today to the billing address', ...props } })

    expect((wrapper.get('textarea').element as HTMLTextAreaElement).style.paddingRight).toBe(padding)
  })

  it('без кнопки и признака — свой отступ поля', () => {
    const wrapper = mount(GrTextarea, { props: { modelValue: 'x' } })

    expect((wrapper.get('textarea').element as HTMLTextAreaElement).style.paddingRight).toBe('')
  })

  it('место держится, пока крестик может появиться, — и на пустом поле', () => {
    const wrapper = mount(GrTextarea, { props: { modelValue: '', clearable: true } })

    expect((wrapper.get('textarea').element as HTMLTextAreaElement).style.paddingRight).toBe('2.25rem')
  })
})
