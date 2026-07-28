import { mount } from '@vue/test-utils'
import { defineComponent } from 'vue'
import { describe, expect, it, vi } from 'vitest'

vi.mock('~icons/lucide/x', () => {
  return {
    default: defineComponent({
      name: 'IconClose',
      template: '<svg data-icon="x" />',
    }),
  }
})

import GrFormField from '../../GrFormField/GrFormField.vue'
import GrInputTag from '../GrInputTag.vue'

describe('GrInputTag', () => {
  it('добавляет тег по Enter', async () => {
    const wrapper = mount(GrInputTag, {
      props: {
        modelValue: [],
      },
    })

    const input = wrapper.get('[data-testid="gr-input-tag-input"]')
    await input.setValue('hello')
    await input.trigger('keydown', { key: 'Enter' })

    expect(wrapper.emitted('update:modelValue')?.[0]?.[0]).toEqual(['hello'])
    expect(wrapper.emitted('add')?.[0]?.[0]).toBe('hello')
  })

  it('по умолчанию игнорирует дубликаты', async () => {
    const wrapper = mount(GrInputTag, {
      props: {
        modelValue: [],
      },
    })

    const input = wrapper.get('[data-testid="gr-input-tag-input"]')
    await input.setValue('a')
    await input.trigger('keydown', { key: 'Enter' })

    const first = wrapper.emitted('update:modelValue')?.[0]?.[0] as string[]
    await wrapper.setProps({ modelValue: first })

    await input.setValue('a')
    await input.trigger('keydown', { key: 'Enter' })

    expect(wrapper.emitted('update:modelValue')?.length).toBe(1)
  })

  it('удаляет последний тег по Backspace при пустом input', async () => {
    const wrapper = mount(GrInputTag, {
      props: {
        modelValue: ['a', 'b'],
      },
    })

    const input = wrapper.get('[data-testid="gr-input-tag-input"]')
    await input.trigger('keydown', { key: 'Backspace' })

    expect(wrapper.emitted('update:modelValue')?.[0]?.[0]).toEqual(['a'])
    expect(wrapper.emitted('remove')?.[0]?.[0]).toBe('b')
  })

  it('удаляет тег по клику на крестик', async () => {
    const wrapper = mount(GrInputTag, {
      props: {
        modelValue: ['a', 'b'],
      },
    })

    const btn = wrapper.get('[data-testid="gr-input-tag-remove"][data-index="0"]')
    await btn.trigger('click')

    expect(wrapper.emitted('update:modelValue')?.[0]?.[0]).toEqual(['b'])
    expect(wrapper.emitted('remove')?.[0]).toEqual(['a', 0])
  })

  it('не добавляет теги, если достигнут max', async () => {
    const wrapper = mount(GrInputTag, {
      props: {
        modelValue: ['a', 'b'],
        max: 2,
      },
    })

    const input = wrapper.get('[data-testid="gr-input-tag-input"]')
    await input.setValue('c')
    await input.trigger('keydown', { key: 'Enter' })

    expect(wrapper.emitted('update:modelValue')).toBeUndefined()
  })

  // Placeholder именем не считается: до этой правки задать имя было нечем вообще —
  // ни пропа, ни связки с `GrFormField` (axe: `label`).
  it('берёт доступное имя из ariaLabel вне GrFormField', () => {
    const wrapper = mount(GrInputTag, {
      props: { modelValue: [], ariaLabel: 'Incident tags' },
    })

    expect(wrapper.get('[data-gr-input-tag-input]').attributes('aria-label')).toBe('Incident tags')
  })

  it('внутри GrFormField получает id, aria-describedby и aria-invalid из контекста', () => {
    const Harness = defineComponent({
      components: { GrFormField, GrInputTag },
      data: () => ({ tags: [] as string[] }),
      template: `
        <GrFormField label="Skills" hint="Через запятую" error="Обязательное поле" required>
          <GrInputTag v-model="tags" />
        </GrFormField>
      `,
    })

    const wrapper = mount(Harness)
    const input = wrapper.get('[data-gr-input-tag-input]')
    const id = input.attributes('id')

    expect(id).toBeTruthy()
    expect(wrapper.get(`label[for="${id}"]`).text()).toContain('Skills')
    expect(input.attributes('aria-describedby')).toBeTruthy()
    expect(input.attributes('aria-invalid')).toBe('true')
    expect(input.attributes('aria-required')).toBe('true')
  })

  it('не редактируется в disabled состоянии', async () => {
    const wrapper = mount(GrInputTag, {
      props: {
        modelValue: ['a'],
        disabled: true,
      },
    })

    const input = wrapper.get('[data-testid="gr-input-tag-input"]')
    await input.setValue('b')
    await input.trigger('keydown', { key: 'Enter' })

    expect(wrapper.emitted('update:modelValue')).toBeUndefined()
    expect(wrapper.find('[data-testid="gr-input-tag-remove"]').exists()).toBe(false)
  })
})