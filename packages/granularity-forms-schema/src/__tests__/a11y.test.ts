import { mount } from '@vue/test-utils'
import axe from 'axe-core'
import { nextTick, reactive } from 'vue'
import { describe, expect, it } from 'vitest'

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
 * `color-contrast` выключен: цвета приходят токенами ядра, их контраст проверяет
 * ядро, а в jsdom они всё равно не вычисляются.
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

async function run(html: HTMLElement) {
  const results = await axe.run(html, {
    rules: { 'color-contrast': { enabled: false } },
  })

  return results.violations.filter(violation => violation.impact === 'serious' || violation.impact === 'critical')
}

describe('доступность', () => {
  it('сгенерированная форма проходит axe', async () => {
    const wrapper = mount(GrSchemaForm, {
      props: { schema, adapters: [jsonSchemaAdapter], modelValue: reactive({ items: [{ name: 'A' }] }) },
      attachTo: document.body,
    })
    await nextTick()
    await nextTick()

    const violations = await run(wrapper.element as HTMLElement)
    expect(violations.map(violation => `${violation.id}: ${violation.help}`)).toEqual([])

    wrapper.unmount()
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

    const violations = await run(wrapper.element as HTMLElement)
    expect(violations.map(violation => `${violation.id}: ${violation.help}`)).toEqual([])

    wrapper.unmount()
  })
})
