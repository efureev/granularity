import type { GrComponentSize } from '../shared/sizes'

export type GrTabsSize = GrComponentSize

/**
 * `pills` — вкладки-таблетки в общей обойме, `line` — классический ряд с
 * подчёркиванием активной. Имя `pills` общее с `GrSegmented`: у компонентов
 * одна роль, и вид с таким названием у них совпадает.
 */
export const GR_TABS_VARIANTS = ['pills', 'line'] as const
export type GrTabsVariant = typeof GR_TABS_VARIANTS[number]

export type GrTabsOrientation = 'horizontal' | 'vertical'

/**
 * Вид вкладок — атрибуты ряда, а не классы (`docs/markup-weight.md`): вариант и
 * ступень. Ориентацию, выбор и недоступность лист `GrTabs.vue` читает по
 * `aria-orientation`, `aria-selected` и `aria-disabled` — они в разметке есть и так.
 */
export function grTabsLookAttrs(options: { variant: GrTabsVariant, size: GrTabsSize }): Record<string, string> {
  return {
    'data-gr-variant': options.variant,
    'data-gr-size': options.size,
  }
}
