import { windEngine } from '@feugene/granum-engine-wind'
import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'

import GrAutocomplete from '../components/GrAutocomplete/GrAutocomplete.vue'
import GrCheckbox from '../components/GrCheckbox/GrCheckbox.vue'
import GrColorPicker from '../components/GrColorPicker/GrColorPicker.vue'
import GrInput from '../components/GrInput/GrInput.vue'
import GrInputTag from '../components/GrInputTag/GrInputTag.vue'
import GrNumberInput from '../components/GrNumberInput/GrNumberInput.vue'
import GrRadio from '../components/GrRadio/GrRadio.vue'
import GrSelect from '../components/GrSelect/GrSelect.vue'
import GrTextarea from '../components/GrTextarea/GrTextarea.vue'
import GrTreeSelect from '../components/GrTreeSelect/GrTreeSelect.vue'
import { componentSheet } from './componentSheet'

const { look: fieldLook } = componentSheet('GrInput/GrInput.vue')
const { look: checkboxLook } = componentSheet('GrCheckbox/GrCheckbox.vue')
const { look: radioLook } = componentSheet('GrButton/GrButton.vue', 'GrRadio/GrRadio.vue')

/**
 * Отклик на указатель — у рабочего контрола и только у него.
 *
 * Рамка поля под указателем — роль `--gr-input-hover`, в фокусе — `--gr-input-focus-brd`; коробка отметки и кружок
 * радио — `--gr-control-brd-hover` и `--gr-selected-hover`. Тема без отклика
 * ставит в них значения покоя, поэтому правила есть всегда, а видны — там, где
 * тема их развела. У недоступного контрола откликаться нечему, а у ошибки и
 * подсветки `state` рамка — сообщение: наведение стирало бы его.
 */
/** Рамку всех полей рисует лист `GrInput` по атрибутам их оболочки (`grFieldLookAttrs`). */
const border = (element: Element, state = {}) => fieldLook(element, state)['border-color']

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
  it.each(fields)('%s: у рабочего поля рамка покоя — `--gr-input`, под указателем — `--gr-input-hover`, в фокусе — `--gr-input-focus-brd`', (_name, component, props, selector) => {
    const wrapper = mount(component as never, { props } as never)
    const shell = wrapper.get(selector).element

    expect(shell.hasAttribute('data-gr-field')).toBe(true)
    expect(border(shell)).toBe('var(--gr-input)')
    expect(border(shell, { hover: true })).toBe('var(--gr-input-hover)')
    expect(border(shell, { focus: true })).toBe('var(--gr-input-focus-brd)')
    wrapper.unmount()
  })

  it.each(fields)('%s: только для чтения — своя рамка и без отклика', (_name, component, props, selector) => {
    const readonly = mount(component as never, { props: { ...props, readonly: true } } as never)
    const shell = readonly.get(selector).element

    expect(border(shell)).toBe('var(--gr-input-readonly-brd)')
    expect(border(shell, { hover: true })).toBe('var(--gr-input-readonly-brd)')
    readonly.unmount()
  })

  it.each(fields)('%s: недоступное поле и поле с ошибкой не откликаются', (_name, component, props, selector) => {
    const disabled = mount(component as never, { props: { ...props, disabled: true } } as never)
    const invalid = mount(component as never, { props: { ...props, invalid: true } } as never)

    expect(border(disabled.get(selector).element, { hover: true })).toBe(border(disabled.get(selector).element))
    expect(border(invalid.get(selector).element, { hover: true })).toBe('var(--gr-invalid-brd)')
    expect(border(invalid.get(selector).element, { focus: true })).toBe('var(--gr-invalid-brd)')
    disabled.unmount()
    invalid.unmount()
  })
})

describe('отклик триггера GrColorPicker', () => {
  // Триггер — поле, но откликается на указатель своей ручкой темы, а на фокус —
  // только кольцом; у ошибки рамка — сообщение, как у остальных полей.
  const { look: triggerLook } = componentSheet('GrInput/GrInput.vue', 'GrColorPicker/GrColorPicker.vue')
  const trigger = (props: Record<string, unknown> = {}) => mount(GrColorPicker, { props: { modelValue: '#3b82f6', ariaLabel: 'Цвет', ...props } })

  it('под указателем — ручка `--gr-color-picker-trigger-hover-brd`, в фокусе рамка покоя', () => {
    const wrapper = trigger()
    const shell = wrapper.get('[data-gr-color-picker-trigger]').element

    expect(triggerLook(shell, { hover: true })['border-color']).toBe('var(--gr-color-picker-trigger-hover-brd)')
    expect(triggerLook(shell, { focus: true })['border-color']).toBe('var(--gr-input)')
    wrapper.unmount()
  })

  it('с ошибкой под указателем держит рамку ошибки', () => {
    const wrapper = trigger({ invalid: true })

    expect(triggerLook(wrapper.get('[data-gr-color-picker-trigger]').element, { hover: true })['border-color']).toBe('var(--gr-invalid-brd)')
    wrapper.unmount()
  })
})

describe('отклик отметки и радио на указатель', () => {
  it('GrCheckbox: подпись — именная группа, коробка откликается на неё', () => {
    const unchecked = mount(GrCheckbox, { props: { modelValue: false, label: 'Согласие' } })
    const checked = mount(GrCheckbox, { props: { modelValue: true, label: 'Согласие' } })

    // Указатель над подписью — `:hover` у корня, и коробка откликается на него.
    const box = (wrapper: typeof unchecked) => wrapper.get('[role="checkbox"]').element
    expect(checkboxLook(box(unchecked), {})['border-color']).toBe('var(--gr-control-brd)')
    expect(checkboxLook(box(unchecked), { hover: true })['border-color']).toBe('var(--gr-control-brd-hover)')
    expect(checkboxLook(box(checked), { hover: true })['background-color']).toBe('var(--gr-selected-hover)')
    unchecked.unmount()
    checked.unmount()
  })

  it.each([
    ['недоступная', { disabled: true }],
    ['только для чтения', { readonly: true }],
    ['с ошибкой', { invalid: true }],
  ])('GrCheckbox: %s не откликается', (_name, extra) => {
    const wrapper = mount(GrCheckbox, { props: { modelValue: true, label: 'Согласие', ...extra } })

    const box = wrapper.get('[role="checkbox"]').element
    expect(checkboxLook(box, { hover: true })['border-color']).toBe(checkboxLook(box)['border-color'])
    expect(checkboxLook(box, { hover: true })['background-color']).toBe(checkboxLook(box)['background-color'])
    wrapper.unmount()
  })

  it('GrRadio: кружок откликается на всю подпись, недоступный — нет', () => {
    const enabled = mount(GrRadio, { props: { modelValue: 'a', value: 'a', label: 'Первый' } })
    const disabled = mount(GrRadio, { props: { modelValue: 'a', value: 'a', label: 'Первый', disabled: true } })

    // Указатель над подписью — `:hover` у корня, и кружок откликается на него.
    expect(radioLook(enabled.get('[data-gr-radio-control]').element, { hover: true })['background-color']).toBe('var(--gr-radio-checked-hover-bg)')
    const box = disabled.get('[data-gr-radio-control]').element
    expect(radioLook(box, { hover: true })).toEqual(radioLook(box))
    enabled.unmount()
    disabled.unmount()
  })
})

describe('толщина кольца фокуса поля', () => {
  const WIDTH = 'ring-[calc(var(--gr-input-focus-ring-width))]'

  it.each(fields)('%s: оболочка берёт толщину кольца из темы', (_name, component, props, selector) => {
    const wrapper = mount(component as never, { props } as never)

    expect(fieldLook(wrapper.get(selector).element, { focus: true })['box-shadow']).toContain('var(--gr-input-focus-ring-width)')
    wrapper.unmount()
  })

  // Ячейки `GrOtpInput` рисуют кольцо утилитами: `ring-2` ставит 2px, правило
  // темы перекрывает только толщину. Перекрытие держится на порядке правил в
  // CSS — если движок его сменит, кольцо молча вернётся к 2px.
  it.each(['focus-within', 'focus-visible'])('%s: правило толщины идёт после ring-2', async (variant) => {
    const { css } = await windEngine({ preflight: false }).generate({ classes: new Set([`${variant}:${WIDTH}`, `${variant}:ring-2`]) })

    expect(css.indexOf(`${variant}\\:ring-2`)).toBeGreaterThan(-1)
    expect(css.indexOf(`${variant}\\:ring-\\[calc`)).toBeGreaterThan(css.indexOf(`${variant}\\:ring-2`))
  })
})
