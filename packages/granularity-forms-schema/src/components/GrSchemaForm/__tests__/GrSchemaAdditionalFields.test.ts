import { mount } from '@vue/test-utils'
import { nextTick, reactive } from 'vue'
import { describe, expect, it } from 'vitest'

import { jsonSchemaAdapter } from '../../../adapters/json-schema'
import type { JsonSchemaDocument } from '../../../adapters/json-schema'
import GrSchemaForm from '../GrSchemaForm.vue'

/**
 * Свободные ключи — единственное место формы, где имя поля вводит пользователь.
 * Отсюда всё, что тут проверяется: переименование не должно ни терять значение,
 * ни переставлять строки, ни давать двух полей с одним именем.
 */
const schema: JsonSchemaDocument = {
  type: 'object',
  properties: { title: { type: 'string' } },
  additionalProperties: { type: 'string' },
}

function mountForm(model: Record<string, unknown>) {
  return mount(GrSchemaForm, {
    props: { schema, adapters: [jsonSchemaAdapter], modelValue: model },
    attachTo: document.body,
  })
}

type Wrapper = ReturnType<typeof mountForm>

function rows(wrapper: Wrapper) {
  return wrapper.findAll('[data-gr-schema-additional-row]')
}

function keyInputs(wrapper: Wrapper) {
  return wrapper.findAll('[data-gr-schema-additional-key] input')
}

describe('свободные ключи', () => {
  it('ключи сверх объявленных рисуются парами «ключ — значение»', async () => {
    const wrapper = mountForm(reactive({ title: 'Заголовок', colour: 'красный' }))
    await nextTick()

    expect(rows(wrapper)).toHaveLength(1)
    expect((keyInputs(wrapper)[0]!.element as HTMLInputElement).value).toBe('colour')
  })

  it('объявленное поле в свободные не попадает', async () => {
    const wrapper = mountForm(reactive({ title: 'Заголовок' }))
    await nextTick()

    expect(rows(wrapper)).toHaveLength(0)
    expect(wrapper.find('[data-gr-schema-additional-empty]').exists()).toBe(true)
  })

  it('добавление даёт незанятое имя, а не дубль', async () => {
    const model = reactive<Record<string, unknown>>({ title: '', key: 'занято' })
    const wrapper = mountForm(model)
    await nextTick()

    await wrapper.find('[data-gr-schema-additional-add]').trigger('click')
    await nextTick()

    expect(Object.keys(model)).toEqual(['title', 'key', 'key2'])
  })

  it('переименование переносит значение и сохраняет порядок ключей', async () => {
    const model = reactive<Record<string, unknown>>({ title: '', a: 'первое', b: 'второе' })
    const wrapper = mountForm(model)
    await nextTick()

    const input = keyInputs(wrapper)[0]!
    await input.setValue('z')
    await input.trigger('change')
    await nextTick()

    expect(Object.entries(model)).toEqual([['title', ''], ['z', 'первое'], ['b', 'второе']])
    expect(keyInputs(wrapper).map(i => (i.element as HTMLInputElement).value)).toEqual(['z', 'b'])
  })

  it('переименование в занятое имя откатывается', async () => {
    const model = reactive<Record<string, unknown>>({ title: '', a: 'первое', b: 'второе' })
    const wrapper = mountForm(model)
    await nextTick()

    const input = keyInputs(wrapper)[0]!
    await input.setValue('b')
    await input.trigger('change')
    await nextTick()

    expect(Object.entries(model)).toEqual([['title', ''], ['a', 'первое'], ['b', 'второе']])
  })

  it('удаление убирает ключ из модели', async () => {
    const model = reactive<Record<string, unknown>>({ title: '', a: 'первое' })
    const wrapper = mountForm(model)
    await nextTick()

    await wrapper.find('[data-gr-schema-additional-remove]').trigger('click')
    await nextTick()

    expect(model.a).toBeUndefined()
    expect(rows(wrapper)).toHaveLength(0)
  })

  it('вложенный объект ведёт свои свободные ключи отдельно', async () => {
    const model = reactive<Record<string, unknown>>({ title: '', meta: { note: 'важно' } })
    const wrapper = mount(GrSchemaForm, {
      props: {
        schema: {
          type: 'object',
          properties: {
            title: { type: 'string' },
            meta: { type: 'object', properties: {}, additionalProperties: { type: 'string' } },
          },
        },
        adapters: [jsonSchemaAdapter],
        modelValue: model,
      },
      attachTo: document.body,
    })
    await nextTick()

    expect(rows(wrapper)).toHaveLength(1)

    await wrapper.find('[data-gr-schema-additional-add]').trigger('click')
    await nextTick()

    expect(Object.keys(model.meta as Record<string, unknown>)).toEqual(['note', 'key'])
    expect(Object.keys(model)).toEqual(['title', 'meta'])
  })

  it('без схемы значения хвост не рисуется вовсе', async () => {
    const wrapper = mount(GrSchemaForm, {
      props: {
        schema: { type: 'object', properties: { title: { type: 'string' } }, additionalProperties: true },
        adapters: [jsonSchemaAdapter],
        modelValue: reactive({ title: '', extra: 'что-то' }),
      },
      attachTo: document.body,
    })
    await nextTick()

    expect(wrapper.find('[data-gr-schema-additional]').exists()).toBe(false)
  })
})
