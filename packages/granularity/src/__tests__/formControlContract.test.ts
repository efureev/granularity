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
import GrSegmented from '../components/GrSegmented/GrSegmented.vue'
import GrSelect from '../components/GrSelect/GrSelect.vue'
import GrSlider from '../components/GrSlider/GrSlider.vue'
import GrSwitch from '../components/GrSwitch/GrSwitch.vue'
import GrTextarea from '../components/GrTextarea/GrTextarea.vue'
import GrTreeSelect from '../components/GrTreeSelect/GrTreeSelect.vue'

/**
 * Гейт контракта форм-контрола (шаг 2).
 *
 * До него контракт был выборочным: `readonly` знали 3 контрола из 15,
 * `required` — 2, `focus()` — 3, `blur()` — ни один, а `invalid` был реализован
 * тремя несовместимыми способами. Практическое следствие: «форма только на
 * чтение» делалась через `disabled`, что меняет и семантику (значение не
 * отправляется), и контраст.
 *
 * Контракт проверяется по отрендеренному DOM и публичному API компонента —
 * не по факту вызова композабла.
 */

/**
 * Атрибут может стоять и на корне компонента (у `GrTextarea` корень — сам
 * `<textarea>`), и на вложенном виджете. `querySelector` корень не проверяет.
 */
function hasAttr(root: Element, selector: string): boolean {
  return root.matches?.(selector) || root.querySelector?.(selector) !== null
}

type Control = {
  name: string
  props: Record<string, unknown>
  /** Селектор элемента-виджета, на котором ожидаются ARIA-атрибуты. */
  widget: string
  /** Контрол не редактируется в принципе — `readonly` к нему неприменим. */
  noReadonly?: boolean
}

const controls: { component: unknown, meta: Control }[] = [
  { component: GrInput, meta: { name: 'GrInput', props: { modelValue: '' }, widget: 'input' } },
  { component: GrTextarea, meta: { name: 'GrTextarea', props: { modelValue: '' }, widget: 'textarea' } },
  { component: GrNumberInput, meta: { name: 'GrNumberInput', props: { modelValue: '' }, widget: 'input' } },
  { component: GrSelect, meta: { name: 'GrSelect', props: { modelValue: '', options: [] }, widget: '[data-gr-select-native]' } },
  { component: GrAutocomplete, meta: { name: 'GrAutocomplete', props: { modelValue: '', options: [] }, widget: 'input' } },
  { component: GrTreeSelect, meta: { name: 'GrTreeSelect', props: { modelValue: null, data: [], nodeKey: 'id' }, widget: '[data-gr-tree-select-trigger]' } },
  { component: GrInputTag, meta: { name: 'GrInputTag', props: { modelValue: [] }, widget: 'input' } },
  { component: GrCheckbox, meta: { name: 'GrCheckbox', props: { modelValue: false }, widget: '[role="checkbox"]' } },
  { component: GrCheckboxGroup, meta: { name: 'GrCheckboxGroup', props: { modelValue: [], options: [{ value: 'a', label: 'A' }] }, widget: '[role="group"]' } },
  { component: GrRadioGroup, meta: { name: 'GrRadioGroup', props: { modelValue: 'a', options: [{ value: 'a', label: 'A' }] }, widget: '[role="radiogroup"]' } },
  { component: GrSwitch, meta: { name: 'GrSwitch', props: { modelValue: false }, widget: '[role="switch"]' } },
  { component: GrSlider, meta: { name: 'GrSlider', props: { modelValue: 0 }, widget: '[role="slider"]' } },
  { component: GrRating, meta: { name: 'GrRating', props: { modelValue: 0 }, widget: '[data-gr-rating]' } },
  { component: GrSegmented, meta: { name: 'GrSegmented', props: { modelValue: 'a', options: [{ value: 'a', label: 'A' }] }, widget: '[role="radiogroup"]' } },
  { component: GrFormFile, meta: { name: 'GrFormFile', props: { modelValue: null }, widget: '[data-gr-form-file]' } },
  { component: GrFileUpload, meta: { name: 'GrFileUpload', props: {}, widget: '[data-gr-file-upload]' } },
]

describe('контракт форм-контрола', () => {
  for (const { component, meta } of controls) {
    describe(meta.name, () => {
      // Объявленную поверхность пропов проверяем по `component.props`, а не по DOM:
      // необъявленный проп «протекает» на корень через fallthrough и в разметке
      // выглядит реализованным. `ariaLabel` Vue вдобавок сама нормализует в
      // `aria-label` — на глаз такой контрол неотличим от настоящего.
      it('объявляет пропы контракта, а не полагается на fallthrough', () => {
        const declared = Object.keys((component as { props?: Record<string, unknown> }).props ?? {})

        for (const prop of ['disabled', 'readonly', 'invalid', 'required', 'ariaLabel']) {
          expect(declared, `нет пропа ${prop}`).toContain(prop)
        }
      })

      it('принимает invalid и объявляет его через aria-invalid', async () => {
        const wrapper = mount(component as never, {
          props: { ...meta.props, invalid: true } as never,
        })
        await nextTick()

        expect(
          hasAttr(wrapper.element as Element, '[aria-invalid="true"]'),
          'aria-invalid="true" не выставлен',
        ).toBe(true)
      })

      it('принимает required и объявляет его через aria-required', async () => {
        const wrapper = mount(component as never, {
          props: { ...meta.props, required: true } as never,
        })
        await nextTick()

        expect(
          hasAttr(wrapper.element as Element, '[aria-required="true"]'),
          'aria-required="true" не выставлен',
        ).toBe(true)
      })

      it('readonly не выключает контрол, в отличие от disabled', async () => {
        const wrapper = mount(component as never, { props: { ...meta.props, readonly: true } as never })
        await nextTick()

        // Значение readonly-контрола по-прежнему уходит в форму и читается AT.
        expect(wrapper.html().includes('disabled=""'), 'readonly не должен выключать контрол').toBe(false)
      })

      it('наследует readonly от GrFormField', async () => {
        if (meta.noReadonly) return

        const wrapper = mount(defineComponent({
          render: () => h(GrFormField, { label: 'Поле', readonly: true }, {
            default: () => h(component as never, meta.props),
          }),
        }))
        await nextTick()

        expect(
          /aria-readonly="true"|readonly=""|readonly="readonly"/.test(wrapper.html()),
          'контрол не прочитал readonly из контекста поля',
        ).toBe(true)
      })

      it('экспонирует focus() и blur()', () => {
        const wrapper = mount(component as never, { props: meta.props as never })
        const vm = wrapper.vm as unknown as Record<string, unknown>

        expect(typeof vm.focus, 'focus() не экспонирован').toBe('function')
        expect(typeof vm.blur, 'blur() не экспонирован').toBe('function')
      })
    })
  }
})
