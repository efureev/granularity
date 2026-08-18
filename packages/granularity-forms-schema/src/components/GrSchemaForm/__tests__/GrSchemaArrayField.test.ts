import { mount } from '@vue/test-utils'
import { nextTick, reactive } from 'vue'
import { describe, expect, it } from 'vitest'

import { jsonSchemaAdapter } from '../../../adapters/json-schema'
import type { JsonSchemaDocument } from '../../../adapters/json-schema'
import GrSchemaForm from '../GrSchemaForm.vue'

/**
 * Повторитель — место, где ядро ведёт себя не так, как кажется: поле
 * регистрируется в форме один раз и не следит за сменой имени, а сообщения об
 * ошибках не чистятся при его дерегистрации. Тесты проверяют именно это, а не
 * то, что кнопка «Добавить» рисуется.
 */
const schema: JsonSchemaDocument = {
  type: 'object',
  properties: {
    items: {
      type: 'array',
      minItems: 1,
      maxItems: 3,
      items: {
        type: 'object',
        properties: { name: { type: 'string' }, qty: { type: 'integer' } },
        required: ['name'],
      },
    },
  },
}

function mountForm(model: Record<string, unknown>) {
  return mount(GrSchemaForm, {
    props: { schema, adapters: [jsonSchemaAdapter], modelValue: model },
    attachTo: document.body,
  })
}

function rows(wrapper: ReturnType<typeof mountForm>) {
  return wrapper.findAll('[data-gr-schema-row]')
}

describe('строки', () => {
  it('пустой список показывает заглушку, а не пустоту', async () => {
    const wrapper = mountForm(reactive({ items: [] }))
    await nextTick()

    expect(wrapper.find('[data-gr-schema-array-empty]').exists()).toBe(true)
  })

  it('добавление создаёт строку с полями по узлу элемента', async () => {
    const model = reactive<Record<string, unknown>>({ items: [] })
    const wrapper = mountForm(model)
    await nextTick()

    await wrapper.find('[data-gr-schema-row-add]').trigger('click')
    await nextTick()

    expect(rows(wrapper)).toHaveLength(1)
    expect((model.items as unknown[])[0]).toEqual({ name: '', qty: null })
    expect(wrapper.find('[data-path="items.0.name"]').exists()).toBe(true)
  })

  it('удаление средней строки сдвигает хвост', async () => {
    const model = reactive<Record<string, unknown>>({
      items: [{ name: 'A', qty: 1 }, { name: 'B', qty: 2 }, { name: 'C', qty: 3 }],
    })
    const wrapper = mountForm(model)
    await nextTick()

    await wrapper.findAll('[data-gr-schema-row-remove]')[1]!.trigger('click')
    await nextTick()

    expect(model.items).toEqual([{ name: 'A', qty: 1 }, { name: 'C', qty: 3 }])
    expect(rows(wrapper)).toHaveLength(2)
  })

  /**
   * Поле рендерится с ключом-инстанс-путём именно поэтому: `GrFormField`
   * регистрируется один раз и смену `name` не отслеживает, — иначе после
   * удаления строки поле осталось бы в форме под старым именем.
   */
  it('после удаления оставшиеся поля адресуются новыми путями', async () => {
    const model = reactive<Record<string, unknown>>({
      items: [{ name: 'A' }, { name: 'B' }],
    })
    const wrapper = mountForm(model)
    await nextTick()

    await wrapper.findAll('[data-gr-schema-row-remove]')[0]!.trigger('click')
    await nextTick()

    const paths = wrapper.findAll('[data-gr-schema-field]').map(el => el.attributes('data-path'))
    expect(paths).toEqual(['items.0.name', 'items.0.qty'])
    expect((model.items as { name: string }[])[0]!.name).toBe('B')
  })

  it('перестановка меняет порядок значений', async () => {
    const model = reactive<Record<string, unknown>>({ items: [{ name: 'A' }, { name: 'B' }] })
    const wrapper = mountForm(model)
    await nextTick()

    // Вторая кнопка первой строки — «вниз».
    await wrapper.findAll('[data-gr-schema-row] button')[1]!.trigger('click')
    await nextTick()

    expect((model.items as { name: string }[]).map(item => item.name)).toEqual(['B', 'A'])
  })
})

describe('границы длины', () => {
  it('на максимуме добавление недоступно', async () => {
    const model = reactive<Record<string, unknown>>({
      items: [{ name: 'A' }, { name: 'B' }, { name: 'C' }],
    })
    const wrapper = mountForm(model)
    await nextTick()

    expect(wrapper.find('[data-gr-schema-row-add]').attributes('disabled')).toBeDefined()
  })

  it('на минимуме удаление недоступно', async () => {
    const model = reactive<Record<string, unknown>>({ items: [{ name: 'A' }] })
    const wrapper = mountForm(model)
    await nextTick()

    expect(wrapper.find('[data-gr-schema-row-remove]').attributes('disabled')).toBeDefined()
  })
})

describe('доступность', () => {
  it('строка объявлена группой с номером и общим числом', async () => {
    const wrapper = mountForm(reactive({ items: [{ name: 'A' }, { name: 'B' }] }))
    await nextTick()

    const row = rows(wrapper)[0]!
    expect(row.attributes('role')).toBe('group')
    expect(row.attributes('aria-label')).toBe('Position 1 of 2')
  })

  /** Десять кнопок «Удалить» в списке диктор не различит — имя несёт номер. */
  it('кнопки строки называют свою позицию', async () => {
    const wrapper = mountForm(reactive({ items: [{ name: 'A' }, { name: 'B' }] }))
    await nextTick()

    const remove = wrapper.findAll('[data-gr-schema-row-remove]')
    expect(remove[0]!.attributes('aria-label')).toBe('Remove position 1')
    expect(remove[1]!.attributes('aria-label')).toBe('Remove position 2')
  })
})
