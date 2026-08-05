import { mount } from '@vue/test-utils'
import { computed, inject, nextTick, ref } from 'vue'
import { describe, expect, it, vi } from 'vitest'

import GrFormField from '../GrFormField.vue'
import { GR_FORM_FIELD_KEY } from '../context'
import { GR_FORM_KEY } from '../../GrForm/context'

describe('granularity/GrFormField (unit)', () => {
  it('показывает label и текст ошибки под контролом', () => {
    const wrapper = mount(GrFormField, {
      props: {
        label: 'Email',
        forId: 'email',
        error: 'Email обязателен.',
        labelClass: ['font-medium'],
      },
      slots: {
        default: '<input id="email" />',
      },
    })

    expect(wrapper.classes()).toContain('flex')
    expect(wrapper.classes()).toContain('flex-col')
    expect(wrapper.classes()).toContain('gap-2')

    const label = wrapper.get('label')
    expect(label.text()).toBe('Email')
    expect(label.attributes('for')).toBe('email')
    expect(label.attributes('class')).toContain('text-[var(--gr-muted-fg)]')
    expect(label.attributes('class')).toContain('font-medium')

    const errorEl = wrapper.get('[data-gr-form-field-error]')

    expect(errorEl.text()).toBe('Email обязателен.')
    expect(errorEl.attributes('class')).toContain('text-[var(--gr-danger-text)]')
    expect(wrapper.get('input').attributes('id')).toBe('email')
  })

  it('не рендерит label и ошибку, если пропсы не переданы', () => {
    const wrapper = mount(GrFormField, {
      slots: {
        default: '<input id="username" />',
      },
    })

    expect(wrapper.find('label').exists()).toBe(false)
    expect(wrapper.text()).not.toContain('обязателен')
    expect(wrapper.get('input').attributes('id')).toBe('username')
  })
})

describe('GrFormField — токены', () => {
  // Насыщенный тон как цвет текста запрещён правилом: для текста есть `-text`-роль,
  // а текст ошибки — самое контраст-чувствительное место формы.
  it('маркер обязательности и текст ошибки берут текстовую роль токена', () => {
    const wrapper = mount(GrFormField, {
      props: { label: 'Email', required: true, error: 'Обязательное поле' },
      slots: { default: '<input>' },
    })

    expect(wrapper.get('[data-gr-form-field-required]').classes()).toContain('text-[var(--gr-danger-text)]')
    expect(wrapper.get('[data-gr-form-field-error]').classes()).toContain('text-[var(--gr-danger-text)]')
  })
})

describe('GrFormField — объявление ошибки', () => {
  const Control = {
    template: '<input :aria-describedby="field?.describedById.value">',
    setup() {
      const field = inject(GR_FORM_FIELD_KEY, null)
      return { field }
    },
  }

  // Ошибка появлялась и исчезала через `v-if`, а `aria-describedby` в этот момент
  // менял состав: часть AT не перечитывает описание после смены атрибута.
  it('контейнер ошибки не появляется и не исчезает — меняется только текст', async () => {
    const wrapper = mount(GrFormField, {
      props: { label: 'Email' },
      slots: { default: Control },
    })

    const errorBox = wrapper.get('[data-gr-form-field-error]')
    expect(errorBox.attributes('role')).toBe('alert')
    expect(errorBox.text()).toBe('')
    // Пустой контейнер не занимает места в колонке поля.
    expect(errorBox.classes()).toContain('sr-only')

    const describedBefore = wrapper.get('input').attributes('aria-describedby')

    await wrapper.setProps({ error: 'Обязательное поле' })

    expect(wrapper.get('[data-gr-form-field-error]').text()).toBe('Обязательное поле')
    expect(wrapper.get('[data-gr-form-field-error]').classes()).not.toContain('sr-only')
    expect(wrapper.get('input').attributes('aria-describedby')).toBe(describedBefore)
  })

  it('описание держит и подсказку, и ошибку', () => {
    const wrapper = mount(GrFormField, {
      props: { label: 'Email', hint: 'Рабочая почта', error: 'Обязательное поле' },
      slots: { default: Control },
    })

    const ids = (wrapper.get('input').attributes('aria-describedby') ?? '').split(/\s+/)

    expect(ids).toContain(wrapper.get('[data-gr-form-field-hint]').attributes('id'))
    expect(ids).toContain(wrapper.get('[data-gr-form-field-error]').attributes('id'))
  })
})

describe('GrFormField — валидация по blur', () => {
  function mountInForm(slot: string) {
    const validateField = vi.fn().mockResolvedValue(true)

    const wrapper = mount(GrFormField, {
      props: { label: 'Email', name: 'email' },
      slots: { default: slot },
      attachTo: document.body,
      global: {
        provide: {
          [GR_FORM_KEY as symbol]: {
            errors: ref<Record<string, string | undefined>>({}),
            requiredFields: computed(() => new Set<string>()),
            hasField: () => true,
            registerField: () => () => {},
            validateField,
          },
        },
      },
    })

    return { wrapper, validateField }
  }

  // `focusout` всплывает от любого контрола внутри поля: переход между input и
  // его же кнопкой очистки (или между чекбоксами группы) валидировал поле
  // раньше, чем пользователь его дозаполнил.
  it('перемещение фокуса внутри поля валидацию не запускает', async () => {
    const { wrapper, validateField } = mountInForm(
      '<input data-first><button type="button" data-second>×</button>',
    )

    const first = wrapper.get('[data-first]').element as HTMLElement
    const second = wrapper.get('[data-second]').element as HTMLElement

    first.focus()
    await wrapper.get('[data-first]').trigger('focusout', { relatedTarget: second })

    expect(validateField).not.toHaveBeenCalled()

    wrapper.unmount()
  })

  it('уход фокуса из поля валидацию запускает', async () => {
    const outside = document.createElement('button')
    document.body.appendChild(outside)

    const { wrapper, validateField } = mountInForm('<input data-first>')

    await wrapper.get('[data-first]').trigger('focusout', { relatedTarget: outside })

    expect(validateField).toHaveBeenCalledWith('email', 'blur')

    wrapper.unmount()
    outside.remove()
  })

  it('уход фокуса «в никуда» тоже валидирует', async () => {
    const { wrapper, validateField } = mountInForm('<input data-first>')

    await wrapper.get('[data-first]').trigger('focusout', { relatedTarget: null })

    expect(validateField).toHaveBeenCalledTimes(1)

    wrapper.unmount()
  })
})

describe('GrFormField — слоты', () => {
  it('#label заменяет строку и остаётся именем поля для ARIA-виджетов', () => {
    const wrapper = mount(GrFormField, {
      slots: {
        label: '<span data-custom-label>Ставка, <em>годовых</em></span>',
        default: '<input>',
      },
    })

    const label = wrapper.get('label')
    expect(label.find('[data-custom-label]').exists()).toBe(true)
    // Виджеты с ARIA-ролью связываются с подписью по id, а не через `for`.
    expect(label.attributes('id')).toBeTruthy()
  })

  it('#error заменяет текст ошибки, сохраняя контейнер и его роль', async () => {
    const wrapper = mount(GrFormField, {
      props: { error: 'Обязательное поле' },
      slots: {
        default: '<input>',
        error: '<span data-custom-error>Свой рендер</span>',
      },
    })

    const box = wrapper.get('[data-gr-form-field-error]')
    expect(box.attributes('role')).toBe('alert')
    expect(box.find('[data-custom-error]').exists()).toBe(true)
  })

  it('без ошибки слот #error не рендерится — контейнер остаётся пустым', () => {
    const wrapper = mount(GrFormField, {
      slots: {
        default: '<input>',
        error: '<span data-custom-error>Свой рендер</span>',
      },
    })

    expect(wrapper.find('[data-custom-error]').exists()).toBe(false)
    expect(wrapper.get('[data-gr-form-field-error]').classes()).toContain('sr-only')
  })
})

describe('GrFormField — связь подписи с контролом', () => {
  it('в dev предупреждает, если контрол не прочитал контекст поля', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})

    try {
      // `<label for>` указывает на id из контекста; контрол, который его не
      // прочитал, оставляет подпись висеть в пустоте — клик по ней ничего не
      // фокусирует, а связи для скринридера нет.
      const wrapper = mount(GrFormField, {
        props: { label: 'Email' },
        slots: { default: '<input>' },
        attachTo: document.body,
      })
      await nextTick()

      expect(warn).toHaveBeenCalledTimes(1)
      expect(String(warn.mock.calls[0][0])).toContain('GrFormField')

      wrapper.unmount()
    }
    finally {
      warn.mockRestore()
    }
  })

  it('контрол с id из контекста предупреждения не вызывает', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})

    try {
      const wrapper = mount(GrFormField, {
        props: { label: 'Email', forId: 'email' },
        slots: { default: '<input id="email">' },
        attachTo: document.body,
      })
      await nextTick()

      expect(warn).not.toHaveBeenCalled()

      wrapper.unmount()
    }
    finally {
      warn.mockRestore()
    }
  })

  it('без подписи связывать нечего — молчит', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})

    try {
      const wrapper = mount(GrFormField, {
        slots: { default: '<input>' },
        attachTo: document.body,
      })
      await nextTick()

      expect(warn).not.toHaveBeenCalled()

      wrapper.unmount()
    }
    finally {
      warn.mockRestore()
    }
  })
})

describe('GrFormField — несколько ошибок и showMessage', () => {
  const Control = {
    template: '<input :aria-invalid="field?.invalid.value ? \'true\' : undefined">',
    setup() {
      const field = inject(GR_FORM_FIELD_KEY, null)
      return { field }
    },
  }

  it('массив ошибок рендерится строками в одном живом регионе', () => {
    const wrapper = mount(GrFormField, {
      props: { error: ['Файл слишком большой', 'Формат не поддерживается'] },
      slots: { default: '<input>' },
    })

    const box = wrapper.get('[data-gr-form-field-error]')
    const lines = box.findAll('[data-gr-form-field-error-item]').map(item => item.text())

    expect(lines).toEqual(['Файл слишком большой', 'Формат не поддерживается'])
    expect(box.attributes('role')).toBe('alert')
  })

  it('showMessage=false помечает поле невалидным, но текст не показывает', () => {
    const wrapper = mount(GrFormField, {
      props: { error: 'Обязательное поле', showMessage: false },
      slots: { default: Control },
    })

    expect(wrapper.get('input').attributes('aria-invalid')).toBe('true')
    expect(wrapper.get('[data-gr-form-field-error]').text()).toBe('')
    expect(wrapper.get('[data-gr-form-field-error]').classes()).toContain('sr-only')
  })
})

describe('GrFormField — расположение подписи', () => {
  it('по умолчанию подпись сверху', () => {
    const wrapper = mount(GrFormField, {
      props: { label: 'Email' },
      slots: { default: '<input>' },
    })

    expect(wrapper.classes()).toContain('flex-col')
  })

  it('labelPosition="start" ставит подпись слева, labelWidth задаёт колонку', () => {
    const wrapper = mount(GrFormField, {
      props: { label: 'Email', labelPosition: 'start', labelWidth: 160 },
      slots: { default: '<input>' },
    })

    expect(wrapper.classes()).not.toContain('flex-col')
    expect(wrapper.classes()).toContain('items-start')

    const label = wrapper.get('label')
    expect(label.attributes('style')).toContain('width: 160px')
    // Подпись не сжимается, а контрол занимает остаток строки.
    expect(label.classes()).toContain('shrink-0')
  })

  it('подсказка и ошибка остаются в колонке контрола — они про него', () => {
    const wrapper = mount(GrFormField, {
      props: { label: 'Email', labelPosition: 'start', hint: 'Рабочая', error: 'Обязательное' },
      slots: { default: '<input>' },
    })

    const column = wrapper.get('[data-gr-form-field-control]')
    expect(column.find('[data-gr-form-field-hint]').exists()).toBe(true)
    expect(column.find('[data-gr-form-field-error]').exists()).toBe(true)
    expect(column.find('input').exists()).toBe(true)
  })
})
