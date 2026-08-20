import { mount } from '@vue/test-utils'
import { nextTick, reactive } from 'vue'
import { describe, expect, it } from 'vitest'

import { jsonSchemaAdapter } from '../../../adapters/json-schema'
import type { JsonSchemaDocument } from '../../../adapters/json-schema'
import GrSchemaForm from '../GrSchemaForm.vue'

/**
 * Ветвление — единственное место формы, где смена значения одного поля меняет
 * состав остальных. Отсюда и предмет проверки: не «переключатель нарисовался»,
 * а что после смены ветки в модели остаются ровно ключи выбранного варианта.
 */
const schema: JsonSchemaDocument = {
  type: 'object',
  properties: {
    title: { type: 'string' },
    delivery: {
      oneOf: [
        {
          type: 'object',
          title: 'Самовывоз',
          properties: { kind: { const: 'pickup' }, point: { type: 'string' }, note: { type: 'string' } },
        },
        {
          type: 'object',
          title: 'Курьер',
          properties: { kind: { const: 'courier' }, address: { type: 'string' }, note: { type: 'string' } },
        },
      ],
    },
  },
}

function mountForm(model: Record<string, unknown>) {
  return mount(GrSchemaForm, {
    props: { schema, adapters: [jsonSchemaAdapter], modelValue: model },
    attachTo: document.body,
  })
}

type Wrapper = ReturnType<typeof mountForm>

function labels(wrapper: Wrapper): string[] {
  return wrapper.findAll('label').map(label => label.text().replace('*', '').trim()).filter(Boolean)
}

async function switchTo(wrapper: Wrapper, tag: string): Promise<void> {
  const option = wrapper.findAll('[role="radio"]').find(radio => new RegExp(tag, 'i').test(radio.text()))
  expect(option, `вариант «${tag}» не найден`).toBeDefined()

  await option!.trigger('click')
}

describe('ветвление', () => {
  it('без значения открывается первым вариантом, а не пустотой', async () => {
    const model = reactive<Record<string, unknown>>({})
    const wrapper = mountForm(model)
    await nextTick()

    expect(model.delivery).toEqual({ kind: 'pickup', point: '', note: '' })
    expect(labels(wrapper)).toContain('Point')
  })

  it('подписи вариантов берутся из заголовков, а не из тегов', async () => {
    const wrapper = mountForm(reactive({}))
    await nextTick()

    expect(wrapper.findAll('[role="radio"]').map(radio => radio.text())).toEqual(['Самовывоз', 'Курьер'])
  })

  it('дискриминатор не рисуется вторым полем: им управляет переключатель', async () => {
    const wrapper = mountForm(reactive({}))
    await nextTick()

    expect(labels(wrapper)).not.toContain('Kind')
  })

  it('смена ветки меняет набор полей', async () => {
    const wrapper = mountForm(reactive({}))
    await nextTick()

    await switchTo(wrapper, 'Курьер')
    await nextTick()

    expect(labels(wrapper)).toContain('Address')
    expect(labels(wrapper)).not.toContain('Point')
  })

  it('общий ключ переживает смену ветки, чужой отбрасывается', async () => {
    const model = reactive<Record<string, unknown>>({
      delivery: { kind: 'pickup', point: 'у метро', note: 'позвонить' },
    })
    const wrapper = mountForm(model)
    await nextTick()

    await switchTo(wrapper, 'Курьер')
    await nextTick()

    expect(model.delivery).toEqual({ kind: 'courier', address: '', note: 'позвонить' })
  })

  it('возврат к прежней ветке не тащит ключи чужой', async () => {
    const model = reactive<Record<string, unknown>>({})
    const wrapper = mountForm(model)
    await nextTick()

    await switchTo(wrapper, 'Курьер')
    await nextTick()
    await switchTo(wrapper, 'Самовывоз')
    await nextTick()

    expect(Object.keys(model.delivery as Record<string, unknown>).sort()).toEqual(['kind', 'note', 'point'])
  })

  it('заданное значение открывает свою ветку, а не первую', async () => {
    const wrapper = mountForm(reactive({ delivery: { kind: 'courier', address: 'Тверская, 1', note: '' } }))
    await nextTick()

    expect(labels(wrapper)).toContain('Address')
    expect(labels(wrapper)).not.toContain('Point')
  })
})
