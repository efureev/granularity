import type { GrBadgeRadius, GrBadgeTone } from '../GrBadge/grBadgeStyles'
import { grBadgeLookAttrs } from '../GrBadge/grBadgeStyles'

import type { GrComponentSize } from '../shared/sizes'

export type GrChipTone = GrBadgeTone
export type GrChipSize = GrComponentSize
export type GrChipRadius = GrBadgeRadius

const flag = (on: boolean | undefined): '' | undefined => (on ? '' : undefined)

/**
 * Вид чипа — атрибуты, а не классы (`docs/markup-weight.md`). Палитру и радиусы
 * задаёт лист `GrBadge` по тем же атрибутам, что у метки: в одном ряду они обязаны
 * совпадать. Размеры, интерактив и недоступность — лист `GrChip.vue`.
 *
 * Выбор поднимает вес заливки до плотного варианта того же тона (`data-gr-dark`),
 * а не меняет оттенок: набор фильтров не превращается в радугу, а перепад
 * светлоты переживает и монохром, и дальтонизм.
 */
export function grChipLookAttrs(options: {
  tone: GrChipTone
  dark: boolean
  size: GrChipSize
  radius: GrChipRadius
  interactive: boolean
  selected: boolean
  disabled: boolean
}): Record<string, string | undefined> {
  return {
    ...grBadgeLookAttrs({ tone: options.tone, size: options.size, radius: options.radius, dark: options.dark || options.selected }),
    'data-gr-interactive': flag(options.interactive && !options.disabled),
    'data-gr-selected': flag(options.selected),
    'data-gr-off': flag(options.disabled),
  }
}

/**
 * Ступень чипа, равная по кеглю ступени бейджа.
 *
 * Нужна там, где чип заменил собой бейдж внутри контрола (`GrInputTag`,
 * `GrAutocomplete`, `GrSelect`): проп `tagSize` у них публичный, и `md` обязан
 * означать для потребителя то же, что означал. Шкалы сдвинуты на ступень —
 * бейдж `md` это 13px, а чип 13px — это `sm`.
 */
export function chipSizeForBadgeScale(size: GrChipSize): GrChipSize {
  const byBadgeStep: Record<GrChipSize, GrChipSize> = { xs: 'xs', sm: 'xs', md: 'sm', lg: 'md' }

  return byBadgeStep[size]
}
