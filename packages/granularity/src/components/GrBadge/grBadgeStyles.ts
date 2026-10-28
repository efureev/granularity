import type { GrComponentSize } from '../shared/sizes'

import type { GrTone } from '../shared/tones'

export type GrBadgeTone = GrTone

/**
 * Тон маркера — отдельным литеральным перечислением, а не `GrTone`.
 *
 * Компилятор SFC выводит рантайм-типы пропов из TypeScript, но `GrTone` это
 * `typeof GR_TONES[number]`, и развернуть его в конструкторы он не умеет. У
 * `dot?: GrTone | boolean` из объединения выживал один `Boolean`, и строковый
 * тон отбраковывался предупреждением Vue у каждого потребителя — при том, что
 * компонент работал. Литеральное объединение разрешается и даёт
 * `type: [Boolean, String]`; так же написан `showTooltip` у `GrSlider`.
 *
 * От расхождения с `GR_TONES` держит `assertDotToneCoversTones` ниже: списки
 * обязаны совпадать в обе стороны, иначе `vue-tsc` роняет сборку.
 */
export type GrBadgeDotTone = 'primary' | 'neutral' | 'success' | 'warning' | 'danger' | 'info' | 'slate' | 'azure'

type AssertMutual<A, B> = [A] extends [B] ? ([B] extends [A] ? true : never) : never

export const assertDotToneCoversTones: AssertMutual<GrBadgeDotTone, GrTone> = true
export type GrBadgeSize = GrComponentSize
export type GrBadgeRadius = 'square' | 'semi' | 'round'
const flag = (on: boolean | undefined): '' | undefined => (on ? '' : undefined)

/**
 * Вид метки — атрибуты, а не классы: тон, ступень, форму и заливку читает лист
 * `GrBadge.vue` (`docs/markup-weight.md`). Тем же видом рисуется корень `GrChip`:
 * чип стоит с бейджем в одном ряду, и палитра с радиусами у них общие.
 */
export function grBadgeLookAttrs(options: { tone: GrBadgeTone, size: GrBadgeSize, radius: GrBadgeRadius, dark?: boolean }): Record<string, string | undefined> {
  return {
    'data-gr-tone': options.tone,
    'data-gr-size': options.size,
    'data-gr-radius': options.radius,
    'data-gr-dark': flag(options.dark),
  }
}
