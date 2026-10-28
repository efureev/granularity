import type { GrControlShape } from '../shared/controlShape'
import type { GrComponentSize, GrControlState } from '../shared/sizes'

/**
 * Высота рамки по ступени: точная у однострочного поля, минимальная у поля, где
 * чипы переносятся на новую строку, и никакая у многострочного текста и редактора.
 */
export type GrFieldKind = 'line' | 'wrap' | 'area'

export interface GrFieldLookOptions {
  size: GrComponentSize
  kind?: GrFieldKind
  shape?: GrControlShape
  state?: GrControlState
  invalid?: boolean
  disabled?: boolean
  readonly?: boolean
  /**
   * Рамка сама получает фокус — триггер списка, поле пикера. Кольцо тогда
   * загорается по `:focus-visible` рамки, а не по `:focus-within`: щелчок мышью
   * по триггеру кольца не зажигает, как и у кнопки.
   */
  trigger?: boolean
}

/**
 * Вид рамки поля — атрибуты элемента, который несёт рамку; рисует их лист
 * `GrInput` (`docs/field.md`). Компонент, который ставит эти атрибуты, обязан
 * объявить `GrInput` в `dependencies`: иначе лист поля не попадёт в приложение.
 *
 * Ошибка сильнее подсветки: при `invalid` атрибута `data-gr-state` нет, и правила
 * рамки не спорят друг с другом.
 */
export function grFieldLookAttrs(options: GrFieldLookOptions): Record<string, string | undefined> {
  const state = options.state && options.state !== 'default' && !options.invalid ? options.state : undefined
  return {
    'data-gr-field': options.kind ?? 'line',
    'data-gr-size': options.size,
    'data-gr-shape': options.shape === 'pill' ? 'pill' : undefined,
    'data-gr-state': state,
    'data-gr-invalid': options.invalid ? '' : undefined,
    'data-gr-off': options.disabled ? '' : undefined,
    'data-gr-readonly': options.readonly && !options.disabled ? '' : undefined,
    'data-gr-trigger': options.trigger ? '' : undefined,
  }
}
