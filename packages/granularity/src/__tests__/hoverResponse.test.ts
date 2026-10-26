import { windEngine } from '@feugene/granum-engine-wind'
import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'

import GrAutocomplete from '../components/GrAutocomplete/GrAutocomplete.vue'
import GrCheckbox from '../components/GrCheckbox/GrCheckbox.vue'
import GrInput from '../components/GrInput/GrInput.vue'
import GrInputTag from '../components/GrInputTag/GrInputTag.vue'
import GrNumberInput from '../components/GrNumberInput/GrNumberInput.vue'
import GrRadio from '../components/GrRadio/GrRadio.vue'
import GrSelect from '../components/GrSelect/GrSelect.vue'
import GrTextarea from '../components/GrTextarea/GrTextarea.vue'
import GrTreeSelect from '../components/GrTreeSelect/GrTreeSelect.vue'

/**
 * Отклик на указатель — у рабочего контрола и только у него.
 *
 * Рамка поля под указателем — роль `--gr-input-hover`, в фокусе — `--gr-input-focus-brd`; коробка отметки и кружок
 * радио — `--gr-control-brd-hover` и `--gr-selected-hover`. Тема без отклика
 * ставит в них значения покоя, поэтому классы есть всегда, а видны — там, где
 * тема их развела. У недоступного контрола откликаться нечему, а у ошибки и
 * подсветки `state` рамка — сообщение: наведение стирало бы его.
 */
const FIELD_HOVER = 'hover:not-focus-within:border-[var(--gr-input-hover)]'
const FIELD_FOCUS = 'focus-within:border-[var(--gr-input-focus-brd)]'

const fields = [
  ['GrInput', GrInput, { modelValue: '', ariaLabel: 'Поле' }, '[data-gr-input] > div'],
  ['GrTextarea', GrTextarea, { modelValue: '', ariaLabel: 'Поле' }, 'textarea'],
  ['GrNumberInput', GrNumberInput, { modelValue: 1, ariaLabel: 'Поле' }, '[data-gr-number-input]'],
  ['GrInputTag', GrInputTag, { modelValue: [], ariaLabel: 'Поле' }, '[data-gr-input-tag]'],
  ['GrAutocomplete', GrAutocomplete, { modelValue: '', options: [], ariaLabel: 'Поле' }, '[data-gr-autocomplete-shell]'],
  ['GrSelect', GrSelect, { modelValue: 'a', options: [{ value: 'a', label: 'A' }], ariaLabel: 'Поле' }, 'select'],
  ['GrTreeSelect', GrTreeSelect, { modelValue: null, data: [], ariaLabel: 'Поле' }, '[data-gr-tree-select-trigger]'],
] as const

describe('отклик рамки поля на указатель', () => {
  it.each(fields)('%s: у рабочего поля рамка покоя — `--gr-input`, под указателем — `--gr-input-hover`', (_name, component, props, selector) => {
    const wrapper = mount(component as never, { props } as never)
    const classes = wrapper.get(selector).classes()

    expect(classes).toContain('border-[var(--gr-input)]')
    expect(classes).toContain(FIELD_HOVER)
    expect(classes).toContain(FIELD_FOCUS)
    wrapper.unmount()
  })

  it.each(fields)('%s: только для чтения — своя рамка и без отклика', (_name, component, props, selector) => {
    const readonly = mount(component as never, { props: { ...props, readonly: true } } as never)
    const classes = readonly.get(selector).classes()

    expect(classes).toContain('border-[var(--gr-input-readonly-brd)]')
    expect(classes).not.toContain('border-[var(--gr-input)]')
    expect(classes).not.toContain(FIELD_HOVER)
    readonly.unmount()
  })

  it.each(fields)('%s: недоступное поле и поле с ошибкой не откликаются', (_name, component, props, selector) => {
    const disabled = mount(component as never, { props: { ...props, disabled: true } } as never)
    const invalid = mount(component as never, { props: { ...props, invalid: true } } as never)

    expect(disabled.get(selector).classes()).not.toContain(FIELD_HOVER)
    expect(invalid.get(selector).classes()).not.toContain(FIELD_HOVER)
    expect(invalid.get(selector).classes()).not.toContain(FIELD_FOCUS)
    disabled.unmount()
    invalid.unmount()
  })
})

describe('отклик отметки и радио на указатель', () => {
  it('GrCheckbox: подпись — именная группа, коробка откликается на неё', () => {
    const unchecked = mount(GrCheckbox, { props: { modelValue: false, label: 'Согласие' } })
    const checked = mount(GrCheckbox, { props: { modelValue: true, label: 'Согласие' } })

    expect(unchecked.classes()).toContain('group/checkbox')
    expect(unchecked.get('[role="checkbox"]').classes()).toContain('group-hover/checkbox:border-[var(--gr-control-brd-hover)]')
    expect(checked.get('[role="checkbox"]').classes()).toContain('group-hover/checkbox:bg-[var(--gr-selected-hover)]')
    unchecked.unmount()
    checked.unmount()
  })

  it.each([
    ['недоступная', { disabled: true }],
    ['только для чтения', { readonly: true }],
    ['с ошибкой', { invalid: true }],
  ])('GrCheckbox: %s не откликается', (_name, extra) => {
    const wrapper = mount(GrCheckbox, { props: { modelValue: true, label: 'Согласие', ...extra } })

    expect(wrapper.get('[role="checkbox"]').classes().some(name => name.startsWith('group-hover/'))).toBe(false)
    wrapper.unmount()
  })

  it('GrRadio: кружок откликается на всю подпись, недоступный — нет', () => {
    const enabled = mount(GrRadio, { props: { modelValue: 'a', value: 'a', label: 'Первый' } })
    const disabled = mount(GrRadio, { props: { modelValue: 'a', value: 'a', label: 'Первый', disabled: true } })

    expect(enabled.find('.group\\/radio').exists()).toBe(true)
    expect(enabled.get('[data-gr-radio-control]').classes()).toContain('group-hover/radio:bg-[var(--gr-radio-checked-hover-bg)]')
    expect(disabled.get('[data-gr-radio-control]').classes().some(name => name.startsWith('group-hover/'))).toBe(false)
    enabled.unmount()
    disabled.unmount()
  })
})

describe('толщина кольца фокуса поля', () => {
  const WIDTH = 'ring-[calc(var(--gr-input-focus-ring-width))]'

  it.each(fields)('%s: оболочка берёт толщину кольца из темы', (_name, component, props, selector) => {
    const wrapper = mount(component as never, { props } as never)

    expect(wrapper.get(selector).classes().some(name => name.endsWith(`:${WIDTH}`))).toBe(true)
    wrapper.unmount()
  })

  // Толщину задают два правила: `ring-2` рисует кольцо и ставит 2px, правило
  // темы перекрывает только толщину. Перекрытие держится на порядке правил в
  // CSS — если движок его сменит, кольцо молча вернётся к 2px.
  it.each(['focus-within', 'focus-visible'])('%s: правило толщины идёт после ring-2', async (variant) => {
    const { css } = await windEngine({ preflight: false }).generate({ classes: new Set([`${variant}:${WIDTH}`, `${variant}:ring-2`]) })

    expect(css.indexOf(`${variant}\\:ring-2`)).toBeGreaterThan(-1)
    expect(css.indexOf(`${variant}\\:ring-\\[calc`)).toBeGreaterThan(css.indexOf(`${variant}\\:ring-2`))
  })
})
