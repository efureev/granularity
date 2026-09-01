// @vitest-environment jsdom
import { mount } from '@vue/test-utils'
import { describe, expect, it, vi } from 'vitest'
import { defineComponent, h, nextTick } from 'vue'

import { GrFormField } from '@feugene/granularity'

import SeverityField from '../demos/extra/granularity-forms-schema/SeverityField.vue'

/**
 * Демо «свой виджет» показывает приём, который потребитель повторит у себя,
 * поэтому нарушать контракт поля ему нельзя вдвойне. До правки виджет не читал
 * контекст: `<label for>` указывал на id, которого внутри поля не было, и
 * страница печатала предупреждение `GrFormField` при каждом заходе.
 */
function mountInField(props: Record<string, unknown> = {}) {
  const Harness = defineComponent({
    setup: () => () => h(GrFormField, { label: 'Важность', ...props }, {
      default: () => h(SeverityField),
    }),
  })

  return mount(Harness)
}

describe('SeverityField: демо своего виджета держит контракт поля', () => {
  it('подпись поля указывает на сам контрол', () => {
    const wrapper = mountInField()

    expect(wrapper.get('[role="group"]').attributes('id')).toBe(wrapper.get('label').attributes('for'))
  })

  it('группа названа подписью поля, а не осталась безымянной', () => {
    const wrapper = mountInField()

    expect(wrapper.get('[role="group"]').attributes('aria-labelledby'))
      .toBe(wrapper.get('label').attributes('id'))
  })

  it('текст ошибки связан с контролом', () => {
    const wrapper = mountInField({ error: 'Выберите важность' })
    const describedBy = wrapper.get('[role="group"]').attributes('aria-describedby')

    expect(describedBy).toBeTruthy()
    expect(wrapper.get(`#${describedBy}`).text()).toContain('Выберите важность')
  })

  it('атрибуты, недопустимые у роли группы, не вешаются', () => {
    // `aria-invalid` и `aria-required` живут у ролей вроде `radiogroup`;
    // на `group` они дают `aria-allowed-attr` уровня critical.
    const group = mountInField({ error: 'Ошибка', required: true }).get('[role="group"]')

    expect(group.attributes('aria-invalid')).toBeUndefined()
    expect(group.attributes('aria-required')).toBeUndefined()
  })

  it('поле молчит: контракт соблюдён', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})

    mountInField()
    // Проверка поля откладывается до монтирования: синхронное утверждение
    // проходило бы всегда — то есть не проверяло бы ничего.
    await nextTick()

    expect(warn.mock.calls.map(call => String(call[0])).join('\n')).not.toContain('GrFormField')

    warn.mockRestore()
  })
})
