import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import { type Component, defineComponent, h, nextTick } from 'vue'

import GrCheckbox from '../components/GrCheckbox/GrCheckbox.vue'
import GrFormField from '../components/GrFormField/GrFormField.vue'
import GrRadio from '../components/GrRadio/GrRadio.vue'
import { controls } from './formControls'

/**
 * `aria-describedby` потребителя доходит до элемента с ролью и складывается с
 * описанием поля.
 *
 * Без `GrFormField` чекбокс с `aria-describedby="consent-terms-note"` отдавал
 * атрибут обёртке-`div`, а `span[role="checkbox"]` получал только id поля —
 * которого нет: подсказка под чекбоксом не объявлялась. У контролов, где
 * атрибуты и описание поля стоят на одном элементе, одно затирало другое.
 * Тот же путь у `aria-labelledby` (подпись из заголовка строки таблицы) и
 * `aria-errormessage`.
 */
const NOTE = 'consumer-note'
const HEADER = 'row-header'

/**
 * Элемент с ролью, если реестр называет виджетом контейнер: у `GrRating`
 * виджет реестра — корень, а роль `slider` несёт шкала внутри; у `GrFileUpload`
 * фокус и описание держит поле выбора файла.
 */
const ROLE_ELEMENT: Record<string, string> = {
  GrRating: '[data-gr-rating-scale]',
  GrFileUpload: '[data-gr-file-upload-input]',
}

function widgetOf(root: Element, meta: { name: string, widget: string, describedWidget?: string }): Element | null {
  const selector = ROLE_ELEMENT[meta.name] ?? meta.describedWidget ?? meta.widget

  return root.matches(selector) ? root : root.querySelector(selector)
}

function tokens(element: Element | null, name: string): string[] {
  return element?.getAttribute(name)?.split(/\s+/).filter(Boolean) ?? []
}

describe('ARIA-атрибуты потребителя доходят до виджета', () => {
  for (const { component, meta } of controls) {
    describe(meta.name, () => {
      it('без поля: `aria-describedby` — на виджете, а не на обёртке', async () => {
        const wrapper = mount(component as Component, {
          props: { ...meta.props, 'aria-describedby': NOTE, 'aria-labelledby': HEADER, 'aria-errormessage': 'consumer-error' },
          attachTo: document.body,
        })
        await nextTick()

        const widget = widgetOf(wrapper.element, meta)

        expect(tokens(widget, 'aria-describedby')).toContain(NOTE)
        expect(tokens(widget, 'aria-labelledby')).toContain(HEADER)
        expect(widget?.getAttribute('aria-errormessage')).toBe('consumer-error')
        // Обёртка без роли эти атрибуты не несёт: на ней они ничего не значат.
        const carriers = [...wrapper.element.ownerDocument.querySelectorAll(`[aria-describedby~="${NOTE}"]`)]

        expect(carriers).toEqual([widget])
        wrapper.unmount()
      })

      it('в поле: и id потребителя, и описание поля', async () => {
        const wrapper = mount(defineComponent({
          render: () => h(GrFormField, { label: 'Подпись', hint: 'Подсказка поля' }, {
            default: () => h(component as Component, { ...meta.props, 'aria-describedby': NOTE }),
          }),
        }), { attachTo: document.body })
        await nextTick()

        const hintId = wrapper.get('[data-gr-form-field-hint]').attributes('id')!
        const widget = widgetOf(wrapper.element, meta)

        expect(tokens(widget, 'aria-describedby')).toEqual(expect.arrayContaining([NOTE, hintId]))
        wrapper.unmount()
      })
    })
  }

  it('GrRadio: своё описание и id потребителя складываются', async () => {
    const wrapper = mount(GrRadio, {
      props: { 'value': 'a', 'aria-describedby': NOTE },
      slots: { default: () => 'Вариант', description: () => 'Пояснение' },
      attachTo: document.body,
    })
    await nextTick()

    const radio = wrapper.get('[role="radio"]')
    const descriptionId = wrapper.get('[data-gr-radio-description]').attributes('id')!

    expect(tokens(radio.element, 'aria-describedby')).toEqual([NOTE, descriptionId])
    wrapper.unmount()
  })

  it('id не дублируются', async () => {
    const wrapper = mount(GrCheckbox, { props: { 'modelValue': false, 'aria-describedby': `${NOTE} ${NOTE}` }, attachTo: document.body })
    await nextTick()

    expect(tokens(wrapper.element.querySelector('[role="checkbox"]'), 'aria-describedby')).toEqual([NOTE])
    wrapper.unmount()
  })
})
