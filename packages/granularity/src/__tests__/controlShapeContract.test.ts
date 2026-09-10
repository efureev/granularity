import { mount } from '@vue/test-utils'
import { h } from 'vue'
import { describe, expect, it } from 'vitest'

import GrColorPicker from '../components/GrColorPicker/GrColorPicker.vue'
import GrInput from '../components/GrInput/GrInput.vue'
import GrNumberInput from '../components/GrNumberInput/GrNumberInput.vue'
import GrSelect from '../components/GrSelect/GrSelect.vue'
import GrTreeSelect from '../components/GrTreeSelect/GrTreeSelect.vue'
import { controlShapeRadiusClass } from '../components/shared/controlShape'
import { granularityGlobal } from '../testing'

/**
 * Форма рамки — ось, общая для полей-коробок, и проверяется она общим гейтом,
 * а не копией теста у каждого контрола: разъехавшись, контролы дадут форму, в
 * которой поля скруглены по-разному, и заметить это можно только глазами.
 *
 * Список рукописный: компонент, забывший проп, тест не поймает — но поймает
 * компонент, у которого проп есть и не работает. Растущие поля (`GrTextarea`,
 * `GrAutocomplete`, `GrInputTag`) сюда не входят намеренно — см. их доки.
 */
/**
 * `shaped` — элемент, несущий форму. Нужен там, где тот же радиус встречается в
 * разметке ещё раз и проверка по всему поддереву зеленела бы впустую: у
 * `GrColorPicker` `--gr-radius-full` носит ползунок области цвета.
 */
const controls: { name: string, shaped?: string, render: (shape?: 'box' | 'pill') => unknown }[] = [
  { name: 'GrInput', render: shape => h(GrInput, { modelValue: '', shape }) },
  { name: 'GrSelect', render: shape => h(GrSelect, { modelValue: '', options: [], shape }) },
  { name: 'GrNumberInput', render: shape => h(GrNumberInput, { modelValue: null, shape }) },
  { name: 'GrTreeSelect', render: shape => h(GrTreeSelect, { modelValue: '', data: [], shape }) },
  {
    name: 'GrColorPicker',
    shaped: '[data-gr-color-picker-trigger]',
    render: shape => h(GrColorPicker, { modelValue: '#3b82f6', shape }),
  },
]

describe('контракт формы рамки', () => {
  for (const control of controls) {
    describe(control.name, () => {
      const markup = (wrapper: ReturnType<typeof mount>): string =>
        control.shaped ? wrapper.get(control.shaped).classes().join(' ') : wrapper.html()

      it('по умолчанию — коробка со скруглением шкалы контролов', () => {
        const wrapper = mount({ render: () => control.render() })

        expect(markup(wrapper)).toContain(controlShapeRadiusClass.box)
      })

      it('shape="pill" меняет скругление коробки', () => {
        const box = mount({ render: () => control.render('box') })
        const pill = mount({ render: () => control.render('pill') })

        expect(markup(pill)).toContain(controlShapeRadiusClass.pill)
        expect(markup(pill), 'коробка и пилюля отрисовались одинаково').not.toBe(markup(box))
      })

      it('форма приходит из componentDefaults', () => {
        const wrapper = mount(
          { render: () => control.render() },
          { global: granularityGlobal({ componentDefaults: { [control.name]: { shape: 'pill' } } }) },
        )

        expect(markup(wrapper)).toContain(controlShapeRadiusClass.pill)
      })
    })
  }
})
