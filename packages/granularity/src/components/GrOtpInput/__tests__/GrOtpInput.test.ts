import { mount } from '@vue/test-utils'
import { defineComponent, nextTick } from 'vue'
import { afterEach, describe, expect, it, vi } from 'vitest'

import GrConfigProvider from '../../GrConfigProvider/GrConfigProvider.vue'
import GrOtpInput from '../GrOtpInput.vue'

type Wrapper = ReturnType<typeof mount>

function field(wrapper: Wrapper) {
  return wrapper.get('[data-testid="gr-otp-input-field"]')
}

function cells(wrapper: Wrapper): string[] {
  return wrapper.findAll('[data-testid="gr-otp-input-cell"]').map(cell => cell.text())
}

/** Печать в поле: браузер уже применил вставку, компонент нормализует её. */
async function type(wrapper: Wrapper, raw: string, caret = raw.length) {
  const el = field(wrapper).element as HTMLInputElement
  el.value = raw
  el.setSelectionRange(caret, caret)
  await field(wrapper).trigger('input')
}

describe('GrOtpInput', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('рисует ячейки по длине и раскладывает по ним значение', () => {
    const wrapper = mount(GrOtpInput, { props: { modelValue: '123', length: 6 } })

    expect(cells(wrapper)).toEqual(['1', '2', '3', '', '', ''])
  })

  it('значение — одно настоящее поле, а ячейки скрыты от диктора', () => {
    const wrapper = mount(GrOtpInput, { props: { modelValue: '12', ariaLabel: 'Код из SMS' } })

    // Ради этого компонент и устроен одним полем: диктор читает «12», а не
    // шесть безымянных узлов подряд.
    expect(field(wrapper).element.tagName).toBe('INPUT')
    expect(field(wrapper).attributes('aria-label')).toBe('Код из SMS')
    for (const cell of wrapper.findAll('[data-testid="gr-otp-input-cell"]'))
      expect(cell.attributes('aria-hidden')).toBe('true')
  })

  it('чужие символы отбрасываются молча: вставка «123-456» даёт код', async () => {
    const wrapper = mount(GrOtpInput, { props: { modelValue: '' } })

    await type(wrapper, '123-456')

    expect(wrapper.emitted('update:modelValue')?.at(-1)).toEqual(['123456'])
    expect(wrapper.emitted('change')?.at(-1)).toEqual(['123456'])
  })

  it('печать в занятую ячейку заменяет символ, а не двигает хвост', async () => {
    const wrapper = mount(GrOtpInput, { props: { modelValue: '123456' } })

    // Каретка после «12», напечатали «9» — браузер вставил, компонент перезаписал.
    await type(wrapper, '1293456', 3)

    expect(wrapper.emitted('update:modelValue')?.at(-1)).toEqual(['129456'])
  })

  it('complete шлётся один раз на значение', async () => {
    const wrapper = mount(GrOtpInput, { props: { modelValue: '' } })

    await wrapper.setProps({ modelValue: '123456' })
    await wrapper.setProps({ modelValue: '123456' })

    expect(wrapper.emitted('complete')).toEqual([['123456']])

    // Стёрли и набрали то же самое — это новое событие: пользователь ждёт
    // повторной проверки.
    await wrapper.setProps({ modelValue: '12345' })
    await wrapper.setProps({ modelValue: '123456' })
    expect(wrapper.emitted('complete')).toHaveLength(2)
  })

  it('masked прячет символы, не трогая значение', () => {
    const wrapper = mount(GrOtpInput, { props: { modelValue: '1234', masked: true } })

    expect(cells(wrapper).slice(0, 4)).toEqual(['•', '•', '•', '•'])
    // Значение поля остаётся настоящим: маска визуальная, иначе сломался бы
    // `one-time-code`.
    expect((field(wrapper).element as HTMLInputElement).value).toBe('1234')
  })

  it('placeholder стоит только в пустых ячейках', () => {
    const wrapper = mount(GrOtpInput, { props: { modelValue: '12', placeholder: '·' } })

    expect(cells(wrapper)).toEqual(['1', '2', '·', '·', '·', '·'])
  })

  it('groups расставляют разделители, а мимо длины — игнорируются', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})

    const ok = mount(GrOtpInput, { props: { modelValue: '', groups: [3, 3] } })
    expect(ok.findAll('[data-gr-otp-input-separator]')).toHaveLength(1)

    const broken = mount(GrOtpInput, { props: { modelValue: '', groups: [3, 2] } })
    expect(broken.findAll('[data-gr-otp-input-separator]')).toHaveLength(0)
    expect(warn).toHaveBeenCalledTimes(1)
  })

  it('алфавит идёт за типом', async () => {
    const wrapper = mount(GrOtpInput, { props: { modelValue: '', type: 'alphanumeric' } })

    await type(wrapper, 'ab12')

    // Коды печатают капсом, и «то ли a, то ли A» тут только мешает.
    expect(wrapper.emitted('update:modelValue')?.at(-1)).toEqual(['AB12'])
  })

  it('своя регулярка перекрывает тип и регистр не трогает', async () => {
    const wrapper = mount(GrOtpInput, {
      props: { modelValue: '', type: 'alphanumeric', pattern: '[a-f0-9]' },
    })

    await type(wrapper, 'aF3')

    expect(wrapper.emitted('update:modelValue')?.at(-1)).toEqual(['a3'])
  })

  it('inputmode и autocomplete идут за назначением поля', () => {
    const numeric = mount(GrOtpInput, { props: { modelValue: '' } })
    expect(field(numeric).attributes('inputmode')).toBe('numeric')
    // Ради этого атрибута и выбрано одно поле: iOS подставляет код из SMS сам.
    expect(field(numeric).attributes('autocomplete')).toBe('one-time-code')

    const text = mount(GrOtpInput, { props: { modelValue: '', type: 'text', oneTimeCode: false } })
    expect(field(text).attributes('inputmode')).toBe('text')
    expect(field(text).attributes('autocomplete')).toBe('off')
  })

  it('disabled и readonly доезжают до настоящего поля', () => {
    const disabled = mount(GrOtpInput, { props: { modelValue: '', disabled: true } })
    expect(field(disabled).attributes('disabled')).toBeDefined()

    const readonly = mount(GrOtpInput, { props: { modelValue: '', readonly: true } })
    expect(field(readonly).attributes('readonly')).toBeDefined()
  })

  it('активная ячейка появляется только под фокусом', async () => {
    const wrapper = mount(GrOtpInput, { props: { modelValue: '12' } })
    const active = () => wrapper.findAll('[data-gr-otp-input-caret]').length

    expect(active()).toBe(0)

    await field(wrapper).trigger('focus')
    await nextTick()
    expect(active()).toBe(1)

    await field(wrapper).trigger('blur')
    expect(active()).toBe(0)
  })

  it('слот ячейки получает свой скоуп', () => {
    const wrapper = mount(GrOtpInput, {
      props: { modelValue: '1' },
      slots: {
        cell: `<template #cell="{ char, index, filled }">
          <i :data-index="index" :data-filled="filled">{{ char || '·' }}</i>
        </template>`,
      },
    })

    const first = wrapper.findAll('[data-index]')
    expect(first[0].attributes('data-filled')).toBe('true')
    expect(first[1].attributes('data-filled')).toBe('false')
    expect(first[1].text()).toBe('·')
  })

  it('clear() чистит значение', async () => {
    const wrapper = mount(GrOtpInput, { props: { modelValue: '123456' } })

    ;(wrapper.vm as unknown as { clear: () => void }).clear()
    await nextTick()

    expect(wrapper.emitted('update:modelValue')?.at(-1)).toEqual([''])
  })

  it('length и masked приходят из GrConfigProvider', () => {
    const Harness = defineComponent({
      components: { GrConfigProvider, GrOtpInput },
      template: `
        <GrConfigProvider :component-defaults="{ GrOtpInput: { length: 4, masked: true } }">
          <GrOtpInput model-value="12" />
        </GrConfigProvider>
      `,
    })

    const wrapper = mount(Harness)
    expect(wrapper.findAll('[data-testid="gr-otp-input-cell"]')).toHaveLength(4)
    expect(wrapper.findAll('[data-testid="gr-otp-input-cell"]')[0].text()).toBe('•')
  })
})
