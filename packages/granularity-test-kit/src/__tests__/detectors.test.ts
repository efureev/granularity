import { describe, expect, it } from 'vitest'

import { offenders, stripComments, type SourceFile } from '../sources'
import {
  IMPORTANT_UTILITY,
  MS_LITERAL,
  PX_LITERAL_SCALE,
  UNO_DURATION_SCALE,
  UNO_EASE_SCALE,
  UNO_RADIUS_SCALE,
  TONE_ROLES,
  toneAsTextPattern,
  toneMixedInTextPattern,
  UNO_TEXT_SCALE,
} from '../gates/styleTokens'

/**
 * Детектор проверяется отдельно от гейта, который его применяет: `rounded` и
 * `text` — обычные английские слова, и детектор, ловящий их в прозе или в имени
 * пропа, врёт ровно так же, как детектор, не ловящий ничего.
 *
 * Фикстура собрана из тех мест библиотеки, на которых наивная версия ошибалась.
 */
const fixture: SourceFile[] = [{
  path: 'fixture.vue',
  source: stripComments([
    '// If the target has rounded corners, we must clip its content',
    'export interface GrSkeletonProps { rounded?: string }',
    'const resolved = computed(() => props.rounded ?? roundedByVariant[props.variant])',
    ':style="{ height, width, borderRadius: rounded }"',
    ':rounded="resolvedShape === \'circle\' ? \'var(--gr-radius-full)\' : \'10px\'"',
    'class="rounded-[var(--gr-radius-control)] rounded-l-[var(--gr-radius-md)]"',
    'class="text-left text-center text-transparent text-[length:var(--gr-text-sm)]"',
    'transition: opacity var(--gr-duration-fast) var(--gr-ease-out);',
  ].join('\n')),
}]

describe('детекторы стилевых литералов', () => {
  it('отличают утилиту от прозы и от имени пропа', () => {
    expect(offenders(UNO_RADIUS_SCALE, fixture)).toEqual([])
    expect(offenders(UNO_TEXT_SCALE, fixture)).toEqual([])
    expect(offenders(PX_LITERAL_SCALE, fixture)).toEqual([])
    expect(offenders(UNO_DURATION_SCALE, fixture)).toEqual([])
    expect(offenders(UNO_EASE_SCALE, fixture)).toEqual([])
    expect(offenders(MS_LITERAL, fixture)).toEqual([])
  })

  it('ловят утилиты uno-шкалы, включая направленные', () => {
    const broken: SourceFile[] = [{ path: 'broken.vue', source: 'class="rounded-md rounded-l-lg text-sm text-2xl"' }]

    expect(offenders(UNO_RADIUS_SCALE, broken)).toEqual([
      'rounded-l-lg (broken.vue)',
      'rounded-md (broken.vue)',
    ])
    expect(offenders(UNO_TEXT_SCALE, broken)).toEqual([
      'text-2xl (broken.vue)',
      'text-sm (broken.vue)',
    ])
  })

  it('ловят пиксельные литералы кегля и радиуса', () => {
    const broken: SourceFile[] = [{ path: 'broken.vue', source: 'class="text-[14px] rounded-[6px]"' }]

    expect(offenders(PX_LITERAL_SCALE, broken)).toEqual([
      'rounded-[6px] (broken.vue)',
      'text-[14px] (broken.vue)',
    ])
  })

  it('ловят время и кривую мимо токенов', () => {
    const broken: SourceFile[] = [{
      path: 'broken.vue',
      source: 'class="duration-150 ease-in-out"\ntransition: opacity 200ms linear;',
    }]

    expect(offenders(UNO_DURATION_SCALE, broken)).toEqual(['duration-150 (broken.vue)'])
    expect(offenders(UNO_EASE_SCALE, broken)).toEqual(['ease-in-out (broken.vue)'])
    expect(offenders(MS_LITERAL, broken)).toEqual(['200ms (broken.vue)'])
  })

  it('нарушения дедуплицируются и сортируются', () => {
    const repeated: SourceFile[] = [
      { path: 'b.vue', source: 'class="text-sm text-sm"' },
      { path: 'a.vue', source: 'class="text-sm"' },
    ]

    expect(offenders(UNO_TEXT_SCALE, repeated)).toEqual(['text-sm (a.vue)', 'text-sm (b.vue)'])
  })
})

/**
 * Детектор роли тона отделён от гейта по той же причине: `text-[var(--gr-…)]`
 * — обычная форма записи цвета, и ловить в ней надо ровно тона, не задевая ни
 * парную `-text`-роль, ни фон, ни рамку, ни заливку иконки.
 */
const toneFixture: SourceFile[] = [{
  path: 'tone.vue',
  source: stripComments([
    'class="text-[var(--gr-danger)]"',
    'class="text-[var(--gr-success)] text-[var(--gr-warning)]"',
    // Законное: роль текста, фон, рамка, заливка и обводка иконки.
    'class="text-[var(--gr-danger-text)] bg-[var(--gr-danger)] border-[var(--gr-success)]"',
    'class="fill-[var(--gr-warning)] stroke-[var(--gr-info)]"',
    // Тон в имени переменной и в свойстве — не утилита.
    'const danger = tokens["--gr-danger"]',
    'style="color: var(--gr-slate)"',
  ].join('\n')),
}]

describe('детектор тона в роли текста', () => {
  it('ловит тон и не трогает парную роль, фон, рамку и заливку', () => {
    expect(offenders(toneAsTextPattern(TONE_ROLES), toneFixture)).toEqual([
      'text-[var(--gr-danger)] (tone.vue)',
      'text-[var(--gr-success)] (tone.vue)',
      'text-[var(--gr-warning)] (tone.vue)',
    ])
  })

  it('подмешанный тон ловится отдельным правилом', () => {
    const mixed: SourceFile[] = [{
      path: 'mixed.vue',
      source: 'class="text-[color-mix(in_srgb,var(--gr-danger)_40%,var(--gr-fg))]"',
    }]

    expect(offenders(toneMixedInTextPattern(TONE_ROLES), mixed)).toHaveLength(1)
    // Прямое правило подмес не трогает: там доля решает всё.
    expect(offenders(toneAsTextPattern(TONE_ROLES), mixed)).toEqual([])
  })

  it('важность ловится на любой утилите', () => {
    const important: SourceFile[] = [{
      path: 'important.vue',
      source: stripComments([
        'class="!text-[var(--gr-fg)] !bg-white"',
        // Отрицание в шаблоне и логическое «не» — не утилиты.
        'v-if="!disabled"',
        'const next = !state.open',
      ].join('\n')),
    }]

    expect(offenders(IMPORTANT_UTILITY, important)).toEqual([
      '!bg-white (important.vue)',
      '!text-[var(--gr-fg)] (important.vue)',
    ])
  })
})
