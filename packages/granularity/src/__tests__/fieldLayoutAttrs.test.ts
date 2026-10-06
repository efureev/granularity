import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import { type Component, nextTick } from 'vue'

import GrAutocomplete from '../components/GrAutocomplete/GrAutocomplete.vue'
import GrInput from '../components/GrInput/GrInput.vue'
import GrInputTag from '../components/GrInputTag/GrInputTag.vue'
import GrNumberInput from '../components/GrNumberInput/GrNumberInput.vue'
import GrOtpInput from '../components/GrOtpInput/GrOtpInput.vue'
import GrSelect from '../components/GrSelect/GrSelect.vue'
import GrTextarea from '../components/GrTextarea/GrTextarea.vue'
import GrTreeSelect from '../components/GrTreeSelect/GrTreeSelect.vue'
import { ownsWidth } from '../composables/internal/useControlAria'

/**
 * Раскладка потребителя — на корень, остальное — на поле.
 *
 * `GrInput` отдавал `class` и `style` нативному `<input>`: `style="width:
 * min(100%, 16rem)"` сужал поле внутри, а рамка оставалась во всю строку. Корень
 * держит рамку и ширину — ему и `class`/`style`; `aria-*` и `data-*` значат
 * что-то только на самом поле. А `w-full` корня — умолчание: свою ширину
 * потребитель задаёт без борьбы с порядком утилит.
 *
 * Раскладки в jsdom нет, поэтому «корень шириной 200px» проверяется тем, от
 * чего ширина зависит: стиль на корне, у поля его нет, и `w-full` не спорит.
 */

interface Case {
  name: string
  component: Component
  props: Record<string, unknown>
  root: string
  /** Нативное поле, если оно не корень. */
  field?: string
}

const cases: Case[] = [
  { name: 'GrInput', component: GrInput, props: { modelValue: '' }, root: '[data-gr-input]', field: 'input' },
  { name: 'GrTextarea со счётчиком', component: GrTextarea, props: { modelValue: '', showCount: true }, root: '[data-gr-textarea-wrap]', field: 'textarea' },
  { name: 'GrTextarea', component: GrTextarea, props: { modelValue: '' }, root: '[data-gr-textarea-wrap]', field: 'textarea' },
  { name: 'GrNumberInput', component: GrNumberInput, props: { modelValue: 1 }, root: '[data-gr-number-input]', field: 'input' },
  { name: 'GrSelect', component: GrSelect, props: { modelValue: null, options: [{ value: 'a', label: 'A' }] }, root: '[data-gr-select]' },
  { name: 'GrInputTag', component: GrInputTag, props: { modelValue: [] }, root: '[data-gr-input-tag]' },
  { name: 'GrOtpInput', component: GrOtpInput, props: { modelValue: '' }, root: '[data-gr-otp-input]' },
  { name: 'GrAutocomplete', component: GrAutocomplete, props: { modelValue: '', options: [] }, root: '[data-gr-autocomplete]' },
  { name: 'GrTreeSelect', component: GrTreeSelect, props: { modelValue: null, data: [] }, root: '[data-gr-tree-select]' },
]

describe('class и style потребителя — на корне контрола', () => {
  for (const item of cases) {
    describe(item.name, () => {
      it('`style="width: 200px"` ложится на корень, а не на поле', async () => {
        const wrapper = mount(item.component, { props: item.props, attrs: { 'style': 'width: 200px', 'data-test': 'own' }, attachTo: document.body })
        await nextTick()

        const root = wrapper.element as HTMLElement
        expect(root.matches(item.root)).toBe(true)
        expect(root.style.width).toBe('200px')
        expect(root.classList.contains('w-full')).toBe(false)

        if (item.field) {
          const field = root.querySelector<HTMLElement>(item.field)!
          expect(field.style.width).toBe('')
          // Остальные атрибуты — на поле: там они что-то значат.
          expect(field.getAttribute('data-test')).toBe('own')
        }
        wrapper.unmount()
      })

      it('класс потребителя — тоже на корень', async () => {
        const wrapper = mount(item.component, { props: item.props, attrs: { class: 'w-48 mt-2' }, attachTo: document.body })
        await nextTick()

        const root = wrapper.element as HTMLElement
        expect(root.classList.contains('w-48')).toBe(true)
        expect(root.classList.contains('w-full')).toBe(false)
        if (item.field)
          expect(root.querySelector(item.field)!.classList.contains('w-48')).toBe(false)
        wrapper.unmount()
      })
    })
  }

  it('без своей ширины корень по-прежнему во всю строку', () => {
    for (const item of cases.filter(entry => entry.name !== 'GrOtpInput' && entry.name !== 'GrTreeSelect')) {
      const wrapper = mount(item.component, { props: item.props, attrs: { class: 'mt-2' } })
      expect((wrapper.element as HTMLElement).classList.contains('w-full'), item.name).toBe(true)
      wrapper.unmount()
    }
  })

  it('GrTextarea без счётчика: класс потребителя на обёртке не стирает классы поля', () => {
    const wrapper = mount(GrTextarea, { props: { modelValue: '' }, attrs: { class: 'mt-2', style: 'width: 200px' } })
    const root = wrapper.element as HTMLElement
    const field = root.querySelector('textarea')!

    expect(root.hasAttribute('data-gr-textarea-wrap')).toBe(true)
    expect(root.classList.contains('mt-2')).toBe(true)
    expect(root.style.width).toBe('200px')
    expect(root.classList.contains('w-full')).toBe(false)
    expect(field.classList.contains('border')).toBe(true)
    expect(field.classList.contains('mt-2')).toBe(false)
  })
})

describe('ownsWidth', () => {
  it.each([
    ['w-48', undefined, true],
    ['sm:w-1/2', undefined, true],
    ['!w-[16rem]', undefined, true],
    ['min-w-0 max-w-xs', undefined, false],
    ['mt-2', 'width: min(100%, 16rem)', true],
    [undefined, { width: '200px' }, true],
    [undefined, 'min-width: 10rem; max-width: 20rem', false],
    [['flex-1', { 'w-full': false }], undefined, false],
  ])('%j + %j → %s', (cls, style, expected) => {
    expect(ownsWidth(cls, style)).toBe(expected)
  })
})
