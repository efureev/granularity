import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'

import GrCheckbox from '../components/GrCheckbox/GrCheckbox.vue'
import GrSwitch from '../components/GrSwitch/GrSwitch.vue'

import { controlUncheckedClass } from '../components/GrCheckbox/grCheckboxStyles'
import { grRadioControlUncheckedClass } from '../components/GrRadio/grRadioStyles'
import { getColorClassExpression } from './cssContrast'

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
  it.each([
    ['GrCheckbox', controlUncheckedClass],
    ['GrRadio', grRadioControlUncheckedClass],
  ])('%s: невыбранная рамка — `--gr-control-brd`', (_name, className) => {
    expect(getColorClassExpression(className, 'border-[')).toBe('var(--gr-control-brd)')
  })

  it('GrSwitch: рамка выключенной дорожки — `--gr-control-brd`, у недоступной — своя', () => {
    const off = mount(GrSwitch, { props: { modelValue: false, ariaLabel: 'Уведомления' } })
    const disabled = mount(GrSwitch, { props: { modelValue: false, disabled: true, ariaLabel: 'Уведомления' } })

    expect(off.get('[data-gr-switch-track]').attributes('style')).toContain('--gr-switch-track-brd: var(--gr-control-brd)')
    expect(disabled.get('[data-gr-switch-track]').attributes('style')).toContain('--gr-switch-track-brd: var(--gr-disabled-brd)')
    off.unmount()
    disabled.unmount()
  })

  it('GrCheckbox: только для чтения держит рамку 3:1, недоступный — приглушён', () => {
    const readonly = mount(GrCheckbox, { props: { modelValue: false, readonly: true, label: 'Согласие' } })
    const disabled = mount(GrCheckbox, { props: { modelValue: false, disabled: true, label: 'Согласие' } })

    expect(readonly.get('[role="checkbox"]').classes()).toContain('border-[var(--gr-control-brd)]')
    expect(disabled.get('[role="checkbox"]').classes()).not.toContain('border-[var(--gr-control-brd)]')
    readonly.unmount()
    disabled.unmount()
  })
})
