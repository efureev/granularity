import { mount } from '@vue/test-utils'
import { defineComponent, nextTick, reactive } from 'vue'
import GrConfigProvider from '@feugene/granularity/components/GrConfigProvider'
import { describe, expect, it } from 'vitest'

import { jsonSchemaAdapter } from '../../../adapters/json-schema'
import type { JsonSchemaDocument } from '../../../adapters/json-schema'
import GrSchemaForm from '../GrSchemaForm.vue'

/**
 * Сквозная проверка обещания пакета: схема на входе — настоящая форма на
 * выходе, неотличимая от написанной руками. Поэтому смотрим на разметку и
 * поведение, а не на промежуточные структуры.
 */
function mountForm(schema: JsonSchemaDocument, props: Record<string, unknown> = {}) {
  return mount(GrSchemaForm, {
    props: { schema, adapters: [jsonSchemaAdapter], ...props },
    attachTo: document.body,
  })
}

const basic: JsonSchemaDocument = {
  type: 'object',
  properties: {
    email: { type: 'string', format: 'email', title: 'Почта' },
    age: { type: 'integer', minimum: 18 },
    agree: { type: 'boolean' },
    role: { type: 'string', enum: ['admin', 'user'] },
    bio: { type: 'string', maxLength: 500 },
  },
  required: ['email'],
}

describe('разметка', () => {
  it('поля схемы становятся полями формы', () => {
    const wrapper = mountForm(basic)
    const paths = wrapper.findAll('[data-gr-schema-field]').map(el => el.attributes('data-path'))

    expect(paths).toEqual(['email', 'age', 'agree', 'role', 'bio'])
  })

  it('подпись берётся из схемы, а без неё выводится из ключа', () => {
    const wrapper = mountForm(basic)
    const labels = wrapper.findAll('label').map(el => el.text())

    expect(labels[0]).toContain('Почта')
    expect(labels[1]).toContain('Age')
  })

  /** Виджет выбирается по виду и формату узла — это и есть реестр рендереров. */
  it('вид контрола следует из схемы', () => {
    const wrapper = mountForm(basic)

    expect(wrapper.find('[data-path="email"] input[type="email"]').exists()).toBe(true)
    expect(wrapper.find('[data-path="age"] [data-gr-number-input]').exists()).toBe(true)
    expect(wrapper.find('[data-path="agree"] [role="checkbox"]').exists()).toBe(true)
    expect(wrapper.find('[data-path="role"] [data-gr-radio-group]').exists()).toBe(true)
    expect(wrapper.find('[data-path="bio"] textarea').exists()).toBe(true)
  })

  it('обязательность из схемы доезжает до поля', () => {
    const wrapper = mountForm(basic)
    const email = wrapper.find('[data-path="email"]')

    expect(email.html()).toContain('aria-required="true"')
  })
})

describe('модель', () => {
  it('начальные значения собираются по схеме', async () => {
    const model: Record<string, unknown> = {}
    mountForm(basic, { modelValue: model })
    await nextTick()

    // Число — `null`, а не `0`: ядро не считает ноль пустым, и `required`
    // прошёл бы на нетронутом поле.
    expect(model).toEqual({ email: '', age: null, agree: false, role: null, bio: '' })
  })

  it('ввод пишется в модель по dot-пути', async () => {
    const model: Record<string, unknown> = {}
    const wrapper = mountForm({
      type: 'object',
      properties: { user: { type: 'object', properties: { city: { type: 'string' } } } },
    }, { modelValue: model })

    await nextTick()
    await wrapper.find('[data-path="user.city"] input').setValue('Тверь')

    expect((model.user as Record<string, unknown>).city).toBe('Тверь')
  })
})

describe('валидация', () => {
  it('невалидная форма не отправляется, валидная — отправляется', async () => {
    const model: Record<string, unknown> = { email: '' }
    const wrapper = mountForm(basic, { modelValue: model })
    await nextTick()

    await wrapper.find('form').trigger('submit')
    await nextTick()
    await nextTick()
    expect(wrapper.emitted('submit')).toBeUndefined()

    model.email = 'a@b.co'
    await nextTick()
    await wrapper.find('form').trigger('submit')
    await nextTick()
    await nextTick()

    expect(wrapper.emitted('submit')).toBeTruthy()
  })

  it('правила видны снаружи — на вопрос «почему поле не проверяется» есть ответ', () => {
    const wrapper = mountForm(basic)
    const rules = (wrapper.vm as unknown as { compiledRules: Record<string, unknown[]> }).compiledRules

    expect(Object.keys(rules)).toContain('email')
    expect(rules.email!.length).toBeGreaterThan(0)
  })

  it('свои правила потребителя побеждают скомпилированные', () => {
    const wrapper = mountForm(basic, { rules: { email: [{ required: false }] } })
    const rules = (wrapper.vm as unknown as { compiledRules: Record<string, unknown[]> }).compiledRules

    expect(rules.email).toEqual([{ required: false }])
  })
})

describe('uiSchema', () => {
  it('порядок и подписи переопределяются', () => {
    const wrapper = mountForm(basic, {
      uiSchema: { order: ['role', '*'], fields: { role: { label: 'Роль в системе' } } },
    })

    const paths = wrapper.findAll('[data-gr-schema-field]').map(el => el.attributes('data-path'))
    expect(paths[0]).toBe('role')
    expect(wrapper.find('[data-path="role"]').text()).toContain('Роль в системе')
  })

  it('скрытое поле не рисуется', () => {
    const wrapper = mountForm(basic, { uiSchema: { hidden: ['bio'] } })
    const paths = wrapper.findAll('[data-gr-schema-field]').map(el => el.attributes('data-path'))

    expect(paths).not.toContain('bio')
  })

  /** Скрытое условием поле не должно блокировать отправку своей обязательностью. */
  it('условие показывает и прячет поле по значению другого', async () => {
    // Модель реактивная: условие пересчитывается по изменению источника, а
    // plain-объект Vue не отслеживает — как и в приложении потребителя.
    const model = reactive<Record<string, unknown>>({ role: 'user' })
    const wrapper = mountForm(basic, {
      modelValue: model,
      uiSchema: { fields: { bio: { when: { path: 'role', eq: 'admin' } } } },
    })
    await nextTick()

    expect(wrapper.find('[data-path="bio"]').exists()).toBe(false)

    model.role = 'admin'
    await nextTick()

    expect(wrapper.find('[data-path="bio"]').exists()).toBe(true)
  })

  it('виджет подменяется по имени записи реестра', () => {
    const wrapper = mountForm(basic, { uiSchema: { fields: { bio: { widget: 'gr:string' } } } })

    expect(wrapper.find('[data-path="bio"] input').exists()).toBe(true)
    expect(wrapper.find('[data-path="bio"] textarea').exists()).toBe(false)
  })
})

describe('серверные ошибки', () => {
  it('ошибка садится на поле и снимается правкой', async () => {
    const model: Record<string, unknown> = { email: 'a@b.co' }
    const wrapper = mountForm(basic, {
      modelValue: model,
      serverErrors: { errors: { email: ['Уже занято'] } },
    })
    await nextTick()

    expect(wrapper.find('[data-path="email"]').text()).toContain('Уже занято')

    await wrapper.find('[data-path="email"] input').setValue('other@b.co')
    await nextTick()

    expect(wrapper.find('[data-path="email"]').text()).not.toContain('Уже занято')
  })

  it('ошибка на несуществующее поле показывается сводкой, а не пропадает', async () => {
    const wrapper = mountForm(basic, { serverErrors: { errors: { secret: ['Нельзя'] } } })
    await nextTick()

    expect(wrapper.find('[data-gr-schema-form-errors]').text()).toContain('Нельзя')
  })
})

describe('слоты', () => {
  it('свой контрол поля заменяет сгенерированный, а обвязка остаётся', () => {
    const wrapper = mount(GrSchemaForm, {
      props: { schema: basic, adapters: [jsonSchemaAdapter] },
      slots: {
        default: `<template #default="{ fields }">
          <div v-for="field in fields" :key="field.name" data-custom>{{ field.name }}</div>
        </template>`,
      },
      attachTo: document.body,
    })

    expect(wrapper.findAll('[data-custom]').length).toBe(5)
  })
})

/**
 * Настройка через `GrConfigProvider`.
 *
 * Все четыре ключа были объявлены в `defaults.ts` и не читались ни разу: во всём
 * пакете не было ни одного вызова `useGrComponentProp`, а `headingLevel` вдобавок
 * держал дефолт `3` в `withDefaults` — Vue подставлял его раньше, чем компонент
 * мог заглянуть в провайдер. Гейт молчал: он проверяет адрес аугментации, а не
 * чтение. Ровно так когда-то `showWeekNumbers` числился настраиваемым и им не был.
 */
describe('GrSchemaForm и GrConfigProvider', () => {
  function mountWithConfig(defaults: Record<string, unknown>, props: Record<string, unknown> = {}) {
    const Harness = defineComponent({
      name: 'HarnessSchemaFormConfig',
      components: { GrSchemaForm, GrConfigProvider },
      props: {
        componentDefaults: { type: Object, required: true },
        formProps: { type: Object, default: () => ({}) },
      },
      template: `
        <GrConfigProvider :component-defaults="componentDefaults">
          <GrSchemaForm v-bind="formProps" />
        </GrConfigProvider>
      `,
    })

    return mount(Harness, {
      props: {
        componentDefaults: { GrSchemaForm: defaults },
        formProps: { schema: basic, adapters: [jsonSchemaAdapter], ...props },
      },
      attachTo: document.body,
    })
  }

  it('`columns` из провайдера доезжает до сетки полей', () => {
    const wrapper = mountWithConfig({ columns: 2 })

    expect(wrapper.get('[data-gr-schema-form] .grid').classes()).toContain('grid-cols-2')

    wrapper.unmount()
  })

  it('локальный проп сильнее провайдера', () => {
    const wrapper = mountWithConfig({ columns: 3 }, { columns: 1 })
    const classes = wrapper.get('[data-gr-schema-form] .grid').classes()

    expect(classes).toContain('grid-cols-1')
    expect(classes).not.toContain('grid-cols-3')

    wrapper.unmount()
  })

  it('`headingLevel` из провайдера доезжает до заголовка раздела', () => {
    // Именно этот ключ не сработал бы и после появления чтения: дефолт `3`
    // в `withDefaults` не оставляет резолверу шанса увидеть `undefined`.
    const wrapper = mountWithConfig({ headingLevel: 5 }, {
      schema: {
        type: 'object',
        properties: {
          user: { type: 'object', title: 'Пользователь', properties: { name: { type: 'string' } } },
        },
      } satisfies JsonSchemaDocument,
    })

    expect(wrapper.find('h5').exists()).toBe(true)

    wrapper.unmount()
  })
})
