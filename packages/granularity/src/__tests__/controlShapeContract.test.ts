import { mount } from '@vue/test-utils'
import { h } from 'vue'
import { describe, expect, it } from 'vitest'

import GrColorPicker from '../components/GrColorPicker/GrColorPicker.vue'
import GrInput from '../components/GrInput/GrInput.vue'
import GrNumberInput from '../components/GrNumberInput/GrNumberInput.vue'
import GrSelect from '../components/GrSelect/GrSelect.vue'
import GrTreeSelect from '../components/GrTreeSelect/GrTreeSelect.vue'
import { componentSheet } from '@feugene/granularity-test-kit/vue'
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
 * Форму несёт рамка поля — элемент с атрибутами `grFieldLookAttrs`, — и рисует её
 * лист `GrInput`: скругление проверяется каскадом листа на этой рамке.
 */
const { look } = componentSheet('GrInput/GrInput.vue')
const BOX_MD = 'var(--gr-radius-control-md)'
const PILL = 'var(--gr-radius-full)'

const controls: { name: string, render: (shape?: 'box' | 'pill') => unknown }[] = [
  { name: 'GrInput', render: shape => h(GrInput, { modelValue: '', shape }) },
  { name: 'GrSelect', render: shape => h(GrSelect, { modelValue: '', options: [], shape }) },
  { name: 'GrNumberInput', render: shape => h(GrNumberInput, { modelValue: null, shape }) },
  { name: 'GrTreeSelect', render: shape => h(GrTreeSelect, { modelValue: '', data: [], shape }) },
  { name: 'GrColorPicker', render: shape => h(GrColorPicker, { modelValue: '#3b82f6', shape }) },
]

describe('контракт формы рамки', () => {
  for (const control of controls) {
    describe(control.name, () => {
      const radius = (wrapper: ReturnType<typeof mount>): string => look(wrapper.get('[data-gr-field]').element)['border-radius']

      it('по умолчанию — коробка со скруглением шкалы контролов', () => {
        const wrapper = mount({ render: () => control.render() })

        expect(radius(wrapper)).toBe(BOX_MD)
      })

      it('shape="pill" меняет скругление коробки', () => {
        const box = mount({ render: () => control.render('box') })
        const pill = mount({ render: () => control.render('pill') })

        expect(radius(box)).toBe(BOX_MD)
        expect(radius(pill)).toBe(PILL)
      })

      it('форма приходит из componentDefaults', () => {
        const wrapper = mount(
          { render: () => control.render() },
          { global: granularityGlobal({ componentDefaults: { [control.name]: { shape: 'pill' } } }) },
        )

        expect(radius(wrapper)).toBe(PILL)
      })
    })
  }
})
