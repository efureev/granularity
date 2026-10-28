import {
  grButtonLookAttrs,
  type GrButtonSize,
  type GrButtonTone,
  type GrButtonVariant,
} from '../GrButton/grButtonStyles'

export type GrRadioVariant = 'radiobox' | 'button'

const flag = (on: boolean | undefined): '' | undefined => (on ? '' : undefined)

/**
 * Вид радио — атрибуты корня, а не классы (`docs/markup-weight.md`): ступень и
 * «только для чтения». Выбор, недоступность и ошибку лист `GrRadio.vue` читает по
 * `aria-checked`, `aria-disabled` и `aria-invalid` — они в разметке есть и так.
 * Только для чтения у недоступного не ставится: недоступность сильнее.
 */
export function grRadioLookAttrs(options: { size: GrButtonSize, disabled: boolean, readonly: boolean }): Record<string, string | undefined> {
  return {
    'data-gr-size': options.size,
    'data-gr-readonly': flag(options.readonly && !options.disabled),
  }
}

export interface GrRadioButtonLookOptions {
  checked: boolean
  disabled: boolean
  readonly: boolean
  size: GrButtonSize
  buttonVariant: GrButtonVariant
  buttonTone: GrButtonTone
  selectedButtonVariant: GrButtonVariant
  selectedButtonTone: GrButtonTone
}

/**
 * Вид `button` — вид кнопки по атрибутам её листа. Недоступный переключатель
 * тона не получает: вес кнопки не включается, остаются основа и ступень, а цвета
 * недоступного ставит лист радио — выбор в недоступной группе обязан оставаться виден.
 */
export function grRadioButtonLook(options: GrRadioButtonLookOptions): Record<string, string | undefined> {
  return {
    ...grButtonLookAttrs({
      variant: options.checked ? options.selectedButtonVariant : options.buttonVariant,
      tone: options.disabled ? undefined : options.checked ? options.selectedButtonTone : options.buttonTone,
      size: options.size,
    }),
    'data-gr-readonly': flag(options.readonly && !options.disabled),
  }
}
