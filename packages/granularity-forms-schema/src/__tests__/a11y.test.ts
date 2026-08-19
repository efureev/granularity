import { mount } from '@vue/test-utils'
import { nextTick, reactive } from 'vue'
import { describe, expect, it } from 'vitest'

import { axeViolations } from '@feugene/granularity-test-kit/a11y'

import type { JsonSchemaDocument } from '../adapters/json-schema'
import { jsonSchemaAdapter } from '../adapters/json-schema'
import GrSchemaForm from '../components/GrSchemaForm/GrSchemaForm.vue'

/**
 * Гейт доступности сгенерированной формы.
 *
 * Проверять её отдельно нужно именно потому, что разметку никто не писал руками:
 * подпись без поля, поле без имени и кнопка без текста здесь появляются не от
 * невнимательности, а от неверного маппинга — и сразу во всех формах приложения.
 *
 * `color-contrast` `axeViolations` гасит по умолчанию: в jsdom цвета не
 * вычисляются вовсе. Их контраст проверяет ядро, а в браузере то же правило
 * включено.
 */
const schema: JsonSchemaDocument = {
  type: 'object',
  properties: {
    email: { type: 'string', format: 'email', title: 'Почта' },
    age: { type: 'integer', title: 'Возраст' },
    agree: { type: 'boolean', title: 'Согласие' },
    role: { type: 'string', enum: ['admin', 'user'], title: 'Роль' },
    items: {
      type: 'array',
      title: 'Позиции',
      items: { type: 'object', properties: { name: { type: 'string', title: 'Название' } } },
    },
  },
  required: ['email'],
}

describe('доступность', () => {
  it('сгенерированная форма проходит axe', async () => {
    const wrapper = mount(GrSchemaForm, {
      props: { schema, adapters: [jsonSchemaAdapter], modelValue: reactive({ items: [{ name: 'A' }] }) },
      attachTo: document.body,
    })
    await nextTick()
    await nextTick()

    expect(await axeViolations(wrapper.element as Element)).toEqual([])
  })

  it('повторитель с несколькими строками проходит axe', async () => {
    const wrapper = mount(GrSchemaForm, {
      props: {
        schema,
        adapters: [jsonSchemaAdapter],
        modelValue: reactive({ items: [{ name: 'A' }, { name: 'B' }, { name: 'C' }] }),
      },
      attachTo: document.body,
    })
    await nextTick()
    await nextTick()

    expect(await axeViolations(wrapper.element as Element)).toEqual([])
  })
})
