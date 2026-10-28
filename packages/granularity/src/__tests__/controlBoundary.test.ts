import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'

import GrCheckbox from '../components/GrCheckbox/GrCheckbox.vue'
import GrRadio from '../components/GrRadio/GrRadio.vue'
import GrSwitch from '../components/GrSwitch/GrSwitch.vue'

import { componentSheet } from '@feugene/granularity-test-kit/vue'

const { look: checkboxLook } = componentSheet('GrCheckbox/GrCheckbox.vue')
const { look: switchLook } = componentSheet('GrSwitch/GrSwitch.vue')
const { look: radioLook } = componentSheet('GrButton/GrButton.vue', 'GrRadio/GrRadio.vue')

/**
 * Граница переключаемого контрола — единственное, по чему его видно.
 *
 * Невыбранный чекбокс рисовался рамкой `--gr-brd` (#e2e8f0) на заливке
 * `--gr-bg`: на белой карточке это 1.2:1, и в матрице настроек пустые коробки
 * пропадали. Роль `--gr-control-brd` держит 3:1 к странице, карточке и
 * `--gr-muted` в каждой теме и режиме — это проверяет гейт `controlBoundary`
 * пакета токенов. Здесь — что контролы ядра рисуют рамку именно ею.
 */
describe('граница переключаемого контрола', () => {
  it('GrCheckbox: невыбранная рамка — `--gr-control-brd`', () => {
    const wrapper = mount(GrCheckbox, { props: { modelValue: false, label: 'Согласие' } })

    expect(checkboxLook(wrapper.get('[role="checkbox"]').element)['border-color']).toBe('var(--gr-control-brd)')
    wrapper.unmount()
  })

  it('GrRadio: невыбранная рамка — `--gr-control-brd`', () => {
    const wrapper = mount(GrRadio, { props: { modelValue: 'b', value: 'a', label: 'Первый' } })

    expect(radioLook(wrapper.get('[data-gr-radio-control]').element)['border-color']).toBe('var(--gr-control-brd)')
    wrapper.unmount()
  })

  it('GrSwitch: рамка выключенной дорожки — `--gr-control-brd`, у недоступной — своя', () => {
    const off = mount(GrSwitch, { props: { modelValue: false, ariaLabel: 'Уведомления' } })
    const disabled = mount(GrSwitch, { props: { modelValue: false, disabled: true, ariaLabel: 'Уведомления' } })

    expect(switchLook(off.get('[data-gr-switch-track]').element)['border-color']).toBe('var(--gr-control-brd)')
    expect(switchLook(disabled.get('[data-gr-switch-track]').element)['border-color']).toBe('var(--gr-disabled-brd)')
    off.unmount()
    disabled.unmount()
  })

  it('GrCheckbox: только для чтения держит рамку 3:1, недоступный — приглушён', () => {
    const readonly = mount(GrCheckbox, { props: { modelValue: false, readonly: true, label: 'Согласие' } })
    const disabled = mount(GrCheckbox, { props: { modelValue: false, disabled: true, label: 'Согласие' } })

    expect(checkboxLook(readonly.get('[role="checkbox"]').element)['border-color']).toBe('var(--gr-control-brd)')
    expect(checkboxLook(disabled.get('[role="checkbox"]').element)['border-color']).not.toBe('var(--gr-control-brd)')
    readonly.unmount()
    disabled.unmount()
  })
})
