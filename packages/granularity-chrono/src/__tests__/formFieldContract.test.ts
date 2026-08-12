import { mount } from '@vue/test-utils'
import { defineComponent, h, nextTick } from 'vue'
import { describe, expect, it } from 'vitest'

import GrFormField from '@feugene/granularity/components/GrFormField'

import GrDatePicker from '../components/GrDatePicker/GrDatePicker.vue'
import GrTimePicker from '../components/GrTimePicker/GrTimePicker.vue'

/**
 * Гейт контракта `GrFormField` — копия того, что живёт в ядре
 * (`packages/granularity/src/__tests__/formFieldContract.test.ts`).
 *
 * Поле обещает контролу три вещи: связь с подписью, `aria-describedby` с
 * текстом ошибки и `aria-invalid`. Обещание держится только на том, что контрол
 * читает контекст поля, и проверяется снаружи — по отрендеренному DOM: важно не
 * «прочитал контекст», а «подпись и ошибка доехали до элемента, с которым
 * работает скринридер».
 */

const ERROR_TEXT = 'Поле обязательно'
const LABEL_TEXT = 'Подпись поля'

interface Control {
  name: string
  render: () => unknown
  /** Виджет — не labelable-элемент, связь идёт через `aria-labelledby`. */
  ariaLabelled?: boolean
}

const controls: Control[] = [
  { name: 'GrDatePicker', render: () => h(GrDatePicker as never, { modelValue: null }) },
  { name: 'GrTimePicker', render: () => h(GrTimePicker as never, { modelValue: null }) },
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

        if (control.ariaLabelled) {
          const labelId = label.attributes('id')
          expect(labelId, 'подпись обязана иметь id').toBeTruthy()
          expect(
            root.querySelector(`[aria-labelledby~="${labelId}"]`),
            `нет элемента с aria-labelledby="${labelId}"`,
          ).not.toBeNull()
        }
        else {
          const forId = label.attributes('for')
          expect(forId, 'у подписи обязан быть for').toBeTruthy()
          expect(
            root.querySelector(`[id="${forId}"]`),
            `<label for="${forId}"> указывает в пустоту`,
          ).not.toBeNull()
        }

        wrapper.unmount()
      })

      it('текст ошибки связан с контролом через aria-describedby', async () => {
        const wrapper = mountInField(control.render)
        await nextTick()

        const root = wrapper.element as HTMLElement
        const errorId = wrapper.get('[data-gr-form-field-error]').attributes('id')

        expect(
          root.querySelector(`[aria-describedby~="${errorId}"]`),
          `ни один элемент не ссылается на ошибку (${errorId})`,
        ).not.toBeNull()

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
