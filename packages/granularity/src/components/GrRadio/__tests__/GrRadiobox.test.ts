import { mount } from '@vue/test-utils'
import { defineComponent, nextTick } from 'vue'
import { describe, expect, it } from 'vitest'

import GrRadioGroup from '../../GrRadioGroup/GrRadioGroup.vue'
import GrRadio from '../GrRadio.vue'
import { grRadioSafelist } from '../safelist'

describe('GrRadio (radiobox)', () => {
  it('держит в safelist базовые классы точки, чтобы dot не пропадал в собранных стилях', () => {
    expect(grRadioSafelist).toContain('h-[6px]')
    expect(grRadioSafelist).toContain('w-[6px]')
    expect(grRadioSafelist).toContain('rounded-[var(--gr-radius-full)]')
    expect(grRadioSafelist).toContain('transition-[transform,opacity,background-color]')
  })

  it('использует primary-цвет для кружочка (dot)', () => {
    const wrapper = mount(GrRadio, {
      props: {
        modelValue: 'a',
        value: 'a',
      },
      slots: {
        default: 'Option A',
      },
    })

    const root = wrapper.get('[role="radio"]')
    expect(root.attributes('aria-checked')).toBe('true')

    const dot = wrapper.get('[data-gr-radio-dot]')
    expect(dot.attributes('class')).toContain('bg-[var(--gr-primary)]')
  })

  it('скрывает dot когда не выбрано', () => {
    const wrapper = mount(GrRadio, {
      props: {
        modelValue: 'a',
        value: 'b',
      },
      slots: {
        default: 'Option B',
      },
    })

    const root = wrapper.get('[role="radio"]')
    expect(root.attributes('aria-checked')).toBe('false')

    const dot = wrapper.get('[data-gr-radio-dot]')
    expect(dot.attributes('class')).toContain('opacity-0')
  })

  // Внутрь `role="radio"` нельзя вкладывать интерактивные элементы: роль объявляет
  // потомков презентационными, скринридер теряет виджет, axe падает на
  // `nested-interactive`. Значение в нативную форму уходит скрытым input'ом.
  it('не держит внутри себя интерактивных потомков', () => {
    const wrapper = mount(GrRadio, {
      props: { modelValue: 'a', value: 'a', name: 'plan' },
      slots: { default: 'Option A' },
    })

    expect(wrapper.find('input[type="radio"]').exists()).toBe(false)
    expect(wrapper.get('[role="radio"]').findAll('button, a, select, textarea, [tabindex]')).toHaveLength(0)
  })

  it('отправляет значение нативной формой только когда выбран, не disabled и есть name', () => {
    const checkedWrapper = mount(GrRadio, {
      props: { modelValue: 'a', value: 'a', name: 'plan' },
      slots: { default: 'Option A' },
    })

    const hidden = checkedWrapper.get('input[type="hidden"]')
    expect(hidden.attributes('name')).toBe('plan')
    expect(hidden.attributes('value')).toBe('a')

    const uncheckedWrapper = mount(GrRadio, {
      props: { modelValue: 'a', value: 'b', name: 'plan' },
      slots: { default: 'Option B' },
    })
    expect(uncheckedWrapper.find('input[type="hidden"]').exists()).toBe(false)

    const disabledWrapper = mount(GrRadio, {
      props: { modelValue: 'a', value: 'a', name: 'plan', disabled: true },
      slots: { default: 'Option A' },
    })
    expect(disabledWrapper.find('input[type="hidden"]').exists()).toBe(false)

    const namelessWrapper = mount(GrRadio, {
      props: { modelValue: 'a', value: 'a' },
      slots: { default: 'Option A' },
    })
    expect(namelessWrapper.find('input[type="hidden"]').exists()).toBe(false)
  })

  it('переносит id и required на сам radio-элемент', () => {
    const wrapper = mount(GrRadio, {
      props: { modelValue: 'a', value: 'a', id: 'plan-a', required: true },
      slots: { default: 'Option A' },
    })

    const root = wrapper.get('[role="radio"]')
    expect(root.attributes('id')).toBe('plan-a')
    expect(root.attributes('aria-required')).toBe('true')
  })

  it('эмитит update:modelValue при выборе', async () => {
    const wrapper = mount(GrRadio, {
      props: {
        modelValue: 'a',
        value: 'b',
      },
      slots: {
        default: 'Option B',
      },
    })

    await wrapper.get('[role="radio"]').trigger('click')

    const events = wrapper.emitted('update:modelValue')
    expect(events).toBeTruthy()
    expect(events![0]).toEqual(['b'])
  })
})

function mountGroup(props: Record<string, unknown> = {}, options: string[] = ['a', 'b', 'c']) {
  const Harness = defineComponent({
    components: { GrRadioGroup, GrRadio },
    props: { extra: { type: Object, default: () => ({}) } },
    data: () => ({ value: 'a', options }),
    template: `
      <GrRadioGroup v-model="value" v-bind="extra">
        <GrRadio v-for="opt in options" :key="opt" :value="opt">{{ opt }}</GrRadio>
      </GrRadioGroup>
    `,
  })

  return mount(Harness, { props: { extra: props }, attachTo: document.body })
}

describe('GrRadio — клавиатура группы', () => {
  it('в таб-порядке ровно один переключатель', () => {
    const wrapper = mountGroup()
    const tabbable = wrapper.findAll('[data-gr-radio]').filter(el => el.attributes('tabindex') === '0')

    expect(tabbable).toHaveLength(1)
    wrapper.unmount()
  })

  it('стрелки двигают выбор по кругу', async () => {
    const wrapper = mountGroup()
    const radios = wrapper.findAll('[data-gr-radio]')

    await radios[0].trigger('keydown', { key: 'ArrowDown' })
    expect((wrapper.vm as unknown as { value: string }).value).toBe('b')

    await radios[1].trigger('keydown', { key: 'ArrowUp' })
    expect((wrapper.vm as unknown as { value: string }).value).toBe('a')

    // По кругу: с первого влево — на последний.
    await radios[0].trigger('keydown', { key: 'ArrowLeft' })
    expect((wrapper.vm as unknown as { value: string }).value).toBe('c')

    wrapper.unmount()
  })

  // Паттерн radiogroup требует и края набора: в эталонном `GrSegmented` они есть.
  it('Home и End прыгают на края набора', async () => {
    const wrapper = mountGroup()
    const radios = wrapper.findAll('[data-gr-radio]')

    await radios[0].trigger('keydown', { key: 'End' })
    expect((wrapper.vm as unknown as { value: string }).value).toBe('c')

    await radios[2].trigger('keydown', { key: 'Home' })
    expect((wrapper.vm as unknown as { value: string }).value).toBe('a')

    wrapper.unmount()
  })

  it('фокус переезжает вслед за выбором', async () => {
    const wrapper = mountGroup()
    const radios = wrapper.findAll('[data-gr-radio]')

    await radios[0].trigger('keydown', { key: 'ArrowDown' })
    await nextTick()

    expect(document.activeElement).toBe(radios[1].element)
    wrapper.unmount()
  })
})

describe('GrRadio — подпись, описание и состояния', () => {
  // Приглушённая подпись у выбранного варианта не выделяла его вовсе.
  it('подпись выбранного контрастнее остальных', () => {
    const wrapper = mountGroup()
    const labels = wrapper.findAll('[data-gr-radio-label]')

    expect(labels[0].classes()).toContain('text-[var(--gr-fg)]')
    expect(labels[1].classes()).toContain('text-[var(--gr-muted-fg)]')
    wrapper.unmount()
  })

  it('описание связывается с переключателем через aria-describedby', () => {
    const wrapper = mount(GrRadio, {
      props: { value: 'a', modelValue: 'a' },
      slots: { default: 'Тариф', description: 'Списывается ежемесячно' },
    })

    const id = wrapper.get('[data-gr-radio-description]').attributes('id')
    expect(id).toBeTruthy()
    expect(wrapper.get('[role="radio"]').attributes('aria-describedby')).toBe(id)
  })

  it('без слота описания лишнего атрибута не появляется', () => {
    const wrapper = mount(GrRadio, { props: { value: 'a' }, slots: { default: 'Тариф' } })

    expect(wrapper.get('[role="radio"]').attributes('aria-describedby')).toBeUndefined()
  })

  it('invalid приходит и от пропа, и от группы', () => {
    const own = mount(GrRadio, { props: { value: 'a', invalid: true }, slots: { default: 'A' } })
    expect(own.get('[role="radio"]').attributes('aria-invalid')).toBe('true')
    expect(own.get('[data-gr-radio-control]').classes()).toContain('border-[var(--gr-danger)]')

    const group = mountGroup({ invalid: true })
    expect(group.findAll('[data-gr-radio]')[1].attributes('aria-invalid')).toBe('true')
    group.unmount()
  })

  // Отключённая группа обязана показывать, что в ней выбрано: `GrButton` своим
  // disabled-видом состояние стирает, поэтому у радио пара своя.
  it('отключённая кнопка-радио сохраняет видимый выбор', () => {
    const checked = mount(GrRadio, {
      props: { value: 'a', modelValue: 'a', disabled: true, variant: 'button' },
      slots: { default: 'A' },
    })
    const unchecked = mount(GrRadio, {
      props: { value: 'b', modelValue: 'a', disabled: true, variant: 'button' },
      slots: { default: 'B' },
    })

    expect(checked.get('[data-gr-radio]').classes()).toContain('bg-[var(--gr-muted)]')
    expect(unchecked.get('[data-gr-radio]').classes()).toContain('bg-transparent')
    expect(checked.get('[data-gr-radio]').classes().some(cls => cls.startsWith('opacity-'))).toBe(false)
  })

  it('disabled гасится токенами, а не прозрачностью', () => {
    const wrapper = mount(GrRadio, { props: { value: 'a', disabled: true }, slots: { default: 'A' } })
    const root = wrapper.get('[role="radio"]')

    expect(root.classes()).toContain('text-[var(--gr-muted-fg)]')
    expect(root.classes().some(cls => cls.startsWith('opacity-'))).toBe(false)
  })
})

describe('GrRadio — значения не только строкой', () => {
  it('число сравнивается по значению и уходит в форму строкой', async () => {
    const Harness = defineComponent({
      components: { GrRadioGroup, GrRadio },
      data: () => ({ value: 2 }),
      template: `
        <GrRadioGroup v-model="value" name="plan">
          <GrRadio :value="1">Первый</GrRadio>
          <GrRadio :value="2">Второй</GrRadio>
        </GrRadioGroup>
      `,
    })

    const wrapper = mount(Harness)
    const radios = wrapper.findAll('[data-gr-radio]')

    expect(radios[1].attributes('aria-checked')).toBe('true')
    expect(wrapper.get('input[type="hidden"]').attributes('value')).toBe('2')

    await radios[0].trigger('click')
    expect((wrapper.vm as unknown as { value: number }).value).toBe(1)
  })

  it('булево значение тоже работает', () => {
    const wrapper = mount(GrRadio, { props: { value: false, modelValue: false }, slots: { default: 'Нет' } })

    expect(wrapper.get('[role="radio"]').attributes('aria-checked')).toBe('true')
    expect(wrapper.get('[role="radio"]').attributes('data-value')).toBe('false')
  })
})
