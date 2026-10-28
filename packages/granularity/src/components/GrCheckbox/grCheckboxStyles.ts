import type { GrButtonSize } from '../GrButton/grButtonStyles'

/** Размерная шкала общая с формным рядом (`GrRadio`, `GrInput`, `GrButton`). */
export type GrCheckboxSize = GrButtonSize

/** Сторона подписи относительно контрола — логическая, не физическая (RTL). */
export const GR_CHECKBOX_LABEL_POSITIONS = ['start', 'end'] as const
export type GrCheckboxLabelPosition = typeof GR_CHECKBOX_LABEL_POSITIONS[number]

const flag = (on: boolean | undefined): '' | undefined => (on ? '' : undefined)

/**
 * Вид чекбокса — атрибуты корня, а не классы (`docs/markup-weight.md`): ступень,
 * недоступность, ошибка и сторона подписи. Отметку лист читает по `aria-checked`
 * и `aria-readonly` индикатора — они в разметке есть и так.
 *
 * Порядок состояний — приоритет: недоступный контрол не показывает ни ошибку, ни
 * акцент, иначе «выключено» читается как «требует внимания». Поэтому ошибка у
 * недоступного не ставится вовсе.
 */
export function grCheckboxLookAttrs(options: {
  size: GrCheckboxSize
  disabled: boolean
  invalid: boolean
  labelPosition: GrCheckboxLabelPosition
}): Record<string, string | undefined> {
  return {
    'data-gr-size': options.size,
    'data-gr-off': flag(options.disabled),
    'data-gr-invalid': flag(options.invalid && !options.disabled),
    'data-gr-label': options.labelPosition === 'start' ? 'start' : undefined,
  }
}
