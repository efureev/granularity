import { mount } from '@vue/test-utils'
import { defineComponent, h, nextTick } from 'vue'
import { describe, expect, it } from 'vitest'

import GrAutocomplete from '../components/GrAutocomplete/GrAutocomplete.vue'
import GrCheckbox from '../components/GrCheckbox/GrCheckbox.vue'
import GrCheckboxGroup from '../components/GrCheckboxGroup/GrCheckboxGroup.vue'
import GrFileUpload from '../components/GrFileUpload/GrFileUpload.vue'
import GrFormField from '../components/GrFormField/GrFormField.vue'
import GrFormFile from '../components/GrFormFile/GrFormFile.vue'
import GrInput from '../components/GrInput/GrInput.vue'
import GrInputTag from '../components/GrInputTag/GrInputTag.vue'
import GrNumberInput from '../components/GrNumberInput/GrNumberInput.vue'
import GrRadioGroup from '../components/GrRadioGroup/GrRadioGroup.vue'
import GrRating from '../components/GrRating/GrRating.vue'
import GrSelect from '../components/GrSelect/GrSelect.vue'
import GrSlider from '../components/GrSlider/GrSlider.vue'
import GrSwitch from '../components/GrSwitch/GrSwitch.vue'
import GrTextarea from '../components/GrTextarea/GrTextarea.vue'

/**
 * Гейт контракта `GrFormField`.
 *
 * Поле обещает контролу три вещи: связь с подписью, `aria-describedby` с
 * текстом ошибки и `aria-invalid`. Обещание держится только на том, что контрол
 * читает `useGrFormFieldContext()` — и до этого гейта его читали 7 контролов из
 * 13. Для остальных `<label for>` указывал в пустоту: клик по подписи не
 * фокусировал контрол, а текст ошибки не был связан с полем ничем.
 *
 * Контракт проверяется снаружи, по отрендеренному DOM, а не по факту вызова
 * композабла: важно не «прочитал контекст», а «подпись и ошибка реально
 * доехали до элемента, с которым работает скринридер».
 */

const ERROR_TEXT = 'Поле обязательно'
const LABEL_TEXT = 'Подпись поля'

/** Контролы, у которых виджет — не labelable-элемент (span/div с ARIA-ролью). */
const ARIA_LABELLED = new Set(['GrCheckbox', 'GrCheckboxGroup', 'GrRadioGroup'])

const controls: { name: string, render: () => unknown }[] = [
  { name: 'GrInput', render: () => h(GrInput, { modelValue: '' }) },
  { name: 'GrTextarea', render: () => h(GrTextarea, { modelValue: '' }) },
  { name: 'GrNumberInput', render: () => h(GrNumberInput, { modelValue: null }) },
  { name: 'GrSelect', render: () => h(GrSelect, { modelValue: '', options: [] }) },
  { name: 'GrAutocomplete', render: () => h(GrAutocomplete, { modelValue: '', options: [] }) },
  { name: 'GrInputTag', render: () => h(GrInputTag, { modelValue: [] }) },
  { name: 'GrSlider', render: () => h(GrSlider, { modelValue: 0 }) },
  { name: 'GrRating', render: () => h(GrRating, { modelValue: 0 }) },
  { name: 'GrCheckbox', render: () => h(GrCheckbox, { modelValue: false }) },
  {
    name: 'GrCheckboxGroup',
    render: () => h(GrCheckboxGroup, {
      modelValue: [],
      options: [{ value: 'a', label: 'A' }],
    }),
  },
  { name: 'GrSwitch', render: () => h(GrSwitch, { modelValue: false }) },
  {
    name: 'GrRadioGroup',
    render: () => h(GrRadioGroup, {
      modelValue: 'a',
      options: [{ value: 'a', label: 'A' }, { value: 'b', label: 'B' }],
    }),
  },
  { name: 'GrFormFile', render: () => h(GrFormFile, { modelValue: null }) },
  { name: 'GrFileUpload', render: () => h(GrFileUpload) },
]

function mountInField(render: () => unknown) {
  const Harness = defineComponent({
    render: () => h(
      GrFormField,
      { label: LABEL_TEXT, error: ERROR_TEXT },
      { default: () => render() },
    ),
  })

  return mount(Harness, { attachTo: document.body })
}

describe('контракт GrFormField', () => {
  for (const control of controls) {
    describe(control.name, () => {
      it('подпись поля связана с контролом', async () => {
        const wrapper = mountInField(control.render)
        await nextTick()

        const label = wrapper.get('label')
        const root = wrapper.element as HTMLElement

        if (ARIA_LABELLED.has(control.name)) {
          // Виджет с ARIA-ролью не является labelable-элементом, поэтому
          // связь идёт через `aria-labelledby` на id подписи.
          const labelId = label.attributes('id')
          expect(labelId, 'подпись обязана иметь id').toBeTruthy()

          const named = root.querySelector(`[aria-labelledby~="${labelId}"]`)
          expect(named, `нет элемента с aria-labelledby="${labelId}"`).not.toBeNull()
        }
        else {
          const forId = label.attributes('for')
          expect(forId, 'у подписи обязан быть for').toBeTruthy()

          const target = root.querySelector(`[id="${forId}"]`)
          expect(target, `<label for="${forId}"> указывает в пустоту`).not.toBeNull()
        }

        wrapper.unmount()
      })

      it('текст ошибки связан с контролом через aria-describedby', async () => {
        const wrapper = mountInField(control.render)
        await nextTick()

        const root = wrapper.element as HTMLElement
        const errorId = wrapper.get('[data-gr-form-field-error]').attributes('id')

        const described = root.querySelector(`[aria-describedby~="${errorId}"]`)
        expect(described, `ни один элемент не ссылается на ошибку (${errorId})`).not.toBeNull()

        wrapper.unmount()
      })

      it('невалидность поля объявлена через aria-invalid', async () => {
        const wrapper = mountInField(control.render)
        await nextTick()

        const root = wrapper.element as HTMLElement
        expect(root.querySelector('[aria-invalid="true"]'), 'нет aria-invalid="true"').not.toBeNull()

        wrapper.unmount()
      })
    })
  }
})
