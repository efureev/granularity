import type { GrComponentSize } from '../shared/sizes'

export type GrSwitchSize = GrComponentSize

/** Сторона подписи относительно дорожки — логическая, не физическая (RTL). */
export const GR_SWITCH_LABEL_POSITIONS = ['start', 'end'] as const
export type GrSwitchLabelPosition = typeof GR_SWITCH_LABEL_POSITIONS[number]

/**
 * Ступени, на которых подпись состояния помещается внутрь дорожки; расчёт места —
 * `docs/components/GrSwitch.md`, §«Подпись состояния живёт не на всех ступенях».
 */
export const GR_SWITCH_STATE_TEXT_SIZES = ['md', 'lg'] as const
export type GrSwitchStateTextSize = typeof GR_SWITCH_STATE_TEXT_SIZES[number]

/**
 * Вид переключателя — атрибуты корня, а не классы (`docs/markup-weight.md`):
 * ступень, сторона подписи и режим подписи состояния. Включённость, ошибку и
 * недоступность лист читает по `aria-checked`, `aria-invalid` и `:disabled` —
 * они в разметке есть и так.
 */
export function grSwitchLookAttrs(options: {
  size: GrSwitchSize
  labelPosition: GrSwitchLabelPosition
  stateText?: { autoWidth: boolean }
}): Record<string, string | undefined> {
  return {
    'data-gr-size': options.size,
    'data-gr-label': options.labelPosition === 'start' ? 'start' : undefined,
    'data-gr-text': options.stateText ? (options.stateText.autoWidth ? 'auto' : 'fixed') : undefined,
  }
}

/**
 * Зазор бегунка со всех сторон, px.
 *
 * Дорожка — `border-box` с рамкой 1px, и по вертикали зазор задан геометрией:
 * `(content-height − thumb) / 2` даёт ровно 1 на всех ступенях. Значит и по
 * горизонтали он обязан быть тем же: иначе бегунок в покое выглядит вдавленным
 * внутрь, а в крайнем положении прижатым к краю — именно так и было, зазоры
 * расходились на 1–2px у `xs`, `sm` и `lg`.
 *
 * Бегунок выведен из высоты дорожки формулой (лист `GrSwitch.vue`), поэтому зазор
 * сходится в любой теме; гейт `__tests__/GrSwitch.test.ts` держит формулу и
 * место под подпись в каждой теме каталога.
 */
export const SWITCH_THUMB_GAP = 1

export function isGrSwitchStateTextSize(size: GrSwitchSize): size is GrSwitchStateTextSize {
  return (GR_SWITCH_STATE_TEXT_SIZES as readonly GrSwitchSize[]).includes(size)
}
