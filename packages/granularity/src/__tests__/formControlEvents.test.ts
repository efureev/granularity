import { mount } from '@vue/test-utils'
import { defineComponent } from 'vue'
import { describe, expect, it, vi } from 'vitest'

// Иконки резолвит `unplugin-icons` на сборке; в тестах их подменяем, иначе
// компонент получает `undefined` вместо vnode и не рендерит пункты.
vi.mock('~icons/lucide/check', () => ({
  default: defineComponent({ name: 'IconCheck', template: '<svg data-icon="check" />' }),
}))
vi.mock('~icons/lucide/loader-circle', () => ({
  default: defineComponent({ name: 'IconLoader', template: '<svg data-icon="loader" />' }),
}))

import GrCheckbox from '../components/GrCheckbox/GrCheckbox.vue'
import GrCheckboxGroup from '../components/GrCheckboxGroup/GrCheckboxGroup.vue'
import GrRadioGroup from '../components/GrRadioGroup/GrRadioGroup.vue'
import GrRating from '../components/GrRating/GrRating.vue'
import GrSegmented from '../components/GrSegmented/GrSegmented.vue'
import GrSlider from '../components/GrSlider/GrSlider.vue'
import GrSwitch from '../components/GrSwitch/GrSwitch.vue'

/**
 * События контракта приходят потребителю на живом взаимодействии.
 *
 * Гейт состава живёт в `formControlContract.test.ts` — там проверяется, что
 * эмит **объявлен**. Здесь проверяется, что он ещё и **разведён**: объявленный
 * emit уходит из `$attrs`, и нативное событие перестаёт протекать на корень.
 * Объяви его и не разведи — у контрола, чей корень и есть виджет, `@focus`
 * молча перестал бы работать у всех, кто его уже слушает.
 *
 * Поэтому тесты одиночных виджетов написаны так, чтобы проходить и до правки
 * (через fallthrough), и после (через emit).
 */

const OPTIONS = [
  { value: 'a', label: 'A' },
  { value: 'b', label: 'B' },
]

/** Контролы, у которых фокусируемый виджет один. */
const singleWidget = [
  ['GrSwitch', GrSwitch, { modelValue: false }, '[role="switch"]'],
  ['GrCheckbox', GrCheckbox, { modelValue: false }, '[role="checkbox"]'],
  ['GrRating', GrRating, { modelValue: 0 }, '[data-gr-rating-scale]'],
] as const

/**
 * Контролы, внутри которых фокус ходит между пунктами. Слайдер здесь из-за
 * диапазона: у него два бегунка, и переход между ними — тот же случай.
 */
const composite = [
  ['GrRadioGroup', GrRadioGroup, { modelValue: 'a', options: OPTIONS }, '[role="radio"]'],
  ['GrSegmented', GrSegmented, { modelValue: 'a', options: OPTIONS }, '[role="radio"]'],
  ['GrCheckboxGroup', GrCheckboxGroup, { modelValue: [], options: OPTIONS }, '[role="checkbox"]'],
  ['GrSlider', GrSlider, { modelValue: [10, 20], range: true }, '[role="slider"]'],
] as const

describe('события форм-контрола доходят до потребителя', () => {
  it.each(singleWidget)('%s: focus и blur на виджете', async (_name, component, props, widget) => {
    const wrapper = mount(component as never, { props: props as never, attachTo: document.body })
    const target = wrapper.get(widget)

    await target.trigger('focus')
    await target.trigger('blur')

    expect(wrapper.emitted('focus')).toHaveLength(1)
    expect(wrapper.emitted('blur')).toHaveLength(1)
    wrapper.unmount()
  })

  it.each(composite)('%s: фокус внутри группы события не порождает', async (_name, component, props, item) => {
    const wrapper = mount(component as never, { props: props as never, attachTo: document.body })
    const items = wrapper.findAll(item)
    expect(items.length).toBeGreaterThan(1)

    // Вход в группу — событие, переход между пунктами — нет.
    await items[0].trigger('focusin', { relatedTarget: null })
    await items[1].trigger('focusin', { relatedTarget: items[0].element })

    expect(wrapper.emitted('focus')).toHaveLength(1)
    expect(wrapper.emitted('blur')).toBeUndefined()

    // Выход за границу — blur, и ровно один.
    await items[1].trigger('focusout', { relatedTarget: document.body })

    expect(wrapper.emitted('blur')).toHaveLength(1)
    wrapper.unmount()
  })
})

describe('change приходит вместе с update:modelValue', () => {
  it('GrCheckbox', async () => {
    const wrapper = mount(GrCheckbox, { props: { modelValue: false } })

    await wrapper.get('[role="checkbox"]').trigger('keydown.space')

    expect(wrapper.emitted('update:modelValue')).toEqual([[true]])
    expect(wrapper.emitted('change')).toEqual([[true]])
    wrapper.unmount()
  })

  it('GrCheckboxGroup', async () => {
    const wrapper = mount(GrCheckboxGroup, { props: { modelValue: [], options: OPTIONS } })

    await wrapper.findAll('[role="checkbox"]')[0].trigger('keydown.space')

    expect(wrapper.emitted('update:modelValue')).toEqual([[['a']]])
    expect(wrapper.emitted('change')).toEqual([[['a']]])
    wrapper.unmount()
  })

  it('GrRadioGroup', async () => {
    const wrapper = mount(GrRadioGroup, { props: { modelValue: 'a', options: OPTIONS } })

    await wrapper.findAll('[role="radio"]')[1].trigger('click')

    expect(wrapper.emitted('update:modelValue')).toEqual([['b']])
    expect(wrapper.emitted('change')).toEqual([['b']])
    wrapper.unmount()
  })
})
