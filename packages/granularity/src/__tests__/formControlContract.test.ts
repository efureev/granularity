import { mount } from '@vue/test-utils'
import { defineComponent, h, nextTick } from 'vue'
import { describe, expect, it } from 'vitest'

import GrAutocomplete from '../components/GrAutocomplete/GrAutocomplete.vue'
import GrCheckbox from '../components/GrCheckbox/GrCheckbox.vue'
import GrCheckboxGroup from '../components/GrCheckboxGroup/GrCheckboxGroup.vue'
import GrColorPicker from '../components/GrColorPicker/GrColorPicker.vue'
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

/**
 * Текст, на который ссылается `aria-describedby` виджета. Пусто — состояние
 * никем не объявлено.
 */
function describedText(root: Element, widget: string): string {
  const node = root.matches?.(widget) ? root : root.querySelector(widget)
  const ids = node?.getAttribute('aria-describedby')?.split(/\s+/) ?? []

  // Селектор по атрибуту, а не `#id`: `CSS.escape` в jsdom нет, а авто-id
  // приходят из `useId()` и экранирования всё равно требовать не должны.
  return ids
    .map(id => root.querySelector(`[id="${id}"]`)?.textContent ?? '')
    .join(' ')
}

type Control = {
  name: string
  props: Record<string, unknown>
  /** Селектор элемента-виджета, на котором ожидаются ARIA-атрибуты. */
  widget: string
  /** Контрол не редактируется в принципе — `readonly` к нему неприменим. */
  noReadonly?: boolean
  /**
   * Виджет — `<button>`, а роль `button` не поддерживает ни `aria-required`,
   * ни `aria-readonly`: axe роняет их как critical `aria-allowed-attr`.
   * Такие контролы объявляют состояние текстом в описании (`aria-describedby`).
   */
  stateInDescription?: boolean
  /**
   * Элемент, чьё описание проверяется при `stateInDescription`. Не задан —
   * сам `widget`; у `GrFormFile` виджет-корень, а подпись и описание живут на
   * кнопке выбора файла.
   */
  describedWidget?: string
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
  { component: GrColorPicker, meta: { name: 'GrColorPicker', props: { modelValue: '#3b82f6' }, widget: '[data-gr-color-picker-trigger]', stateInDescription: true } },
  { component: GrFormFile, meta: { name: 'GrFormFile', props: { modelValue: null }, widget: '[data-gr-form-file]', stateInDescription: true, describedWidget: '[data-gr-form-file-upload-btn]' } },
  { component: GrFileUpload, meta: { name: 'GrFileUpload', props: {}, widget: '[data-gr-file-upload]' } },
]

/**
 * Состав эмитов контракта.
 *
 * До гейта родственные контролы расходились: полный набор был у двух, `focus` и
 * `blur` — у трёх из шестнадцати, при том что методы `focus()`/`blur()` есть у
 * всех. Потребитель не мог написать одну обёртку на все контролы.
 *
 * `clear` — односторонне: объявлен `clearable`, значит обязано быть и событие.
 * Обратное неверно — `GrFormFile` очищается кнопкой всегда, когда файл выбран,
 * и пропа-выключателя у него нет намеренно.
 */
const BASE_EMITS = ['update:modelValue', 'change', 'focus', 'blur'] as const

function declaredEmits(component: unknown): string[] {
  const emits = (component as { emits?: string[] | Record<string, unknown> }).emits ?? []
  return Array.isArray(emits) ? emits : Object.keys(emits)
}

function declaredProps(component: unknown): string[] {
  return Object.keys((component as { props?: Record<string, unknown> }).props ?? {})
}

describe('состав эмитов форм-контрола', () => {
  it.each(controls.map(({ component, meta }) => [meta.name, component] as const))(
    '%s объявляет update:modelValue, change, focus и blur',
    (_name, component) => {
      const emits = declaredEmits(component)

      for (const emitName of BASE_EMITS) {
        expect(emits, `нет эмита ${emitName}`).toContain(emitName)
      }
    },
  )

  it.each(controls.map(({ component, meta }) => [meta.name, component] as const))(
    '%s объявляет clear, если у него есть clearable',
    (_name, component) => {
      if (!declaredProps(component).includes('clearable')) return

      expect(declaredEmits(component)).toContain('clear')
    },
  )
})

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

      it('принимает required и объявляет его', async () => {
        const wrapper = mount(component as never, {
          props: { ...meta.props, required: true } as never,
        })
        await nextTick()

        if (meta.stateInDescription) {
          // На кнопке `aria-required` запрещён — состояние уходит в описание.
          expect(
            hasAttr(wrapper.element as Element, '[aria-required="true"]'),
            'на кнопке `aria-required` недопустим — axe роняет его как critical',
          ).toBe(false)
          expect(
            describedText(wrapper.element as Element, meta.describedWidget ?? meta.widget),
            'обязательность не объявлена ни атрибутом, ни описанием',
          ).toContain('required')
          return
        }

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

        if (meta.stateInDescription) {
          expect(
            describedText(wrapper.element as Element, meta.describedWidget ?? meta.widget),
            'контрол не прочитал readonly из контекста поля',
          ).toContain('Read only')
          return
        }

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

/**
 * Ошибка валидации и декоративный тон — разные каналы.
 *
 * До этого гейта `invalid` переиспользовал класс-строку тона `danger`: тема,
 * желающая покрасить ошибку иначе, чем «просто красный акцент», не могла этого
 * сделать в принципе, а разработчик, поставивший `state="danger"` как подсветку,
 * визуально сообщал о непройденной валидации.
 */
describe('invalid не равен тону danger', () => {
  const stateful = new Set(['GrInput', 'GrTextarea', 'GrNumberInput', 'GrSelect', 'GrTreeSelect', 'GrInputTag'])
  const colored = controls.filter(({ meta }) => stateful.has(meta.name) || meta.name === 'GrAutocomplete')

  for (const { component, meta } of colored) {
    it(`${meta.name}: invalid красится ролью --gr-invalid-*`, async () => {
      const wrapper = mount(component as never, { props: { ...meta.props, invalid: true } as never })
      await nextTick()

      expect(wrapper.html()).toContain('--gr-invalid-brd')
    })

    if (!stateful.has(meta.name))
      continue

    it(`${meta.name}: state="danger" остаётся тоном danger`, async () => {
      const wrapper = mount(component as never, { props: { ...meta.props, state: 'danger' } as never })
      await nextTick()

      const html = wrapper.html()
      expect(html).toContain('--gr-danger')
      expect(html, 'декоративный тон не должен выглядеть вердиктом валидации').not.toContain('--gr-invalid-brd')
    })
  }
})
