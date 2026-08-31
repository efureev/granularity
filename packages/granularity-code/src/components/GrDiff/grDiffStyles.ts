import type { GrComponentSize } from '@feugene/granularity/components/GrConfigProvider'

import type { GrDiffOp } from '../../diff/diffLines'
import {
  codeSurfaceFontClass,
  codeSurfaceNowrapClass,
  codeSurfacePaddings,
  codeSurfaceScrollClass,
  codeSurfaceTextSizes,
  codeSurfaceWrapClass,
} from '../../internal/codeSurface'

/**
 * Оформление сравнения.
 *
 * Поверхность — та же, что у блока (`internal/codeSurface`): дифф и блок стоят
 * на одной странице, и разойдись кегль — семейство рассыпается. Своё здесь
 * только то, чего у блока нет: подложки добавленного и удалённого, пословная
 * подсветка и жёлоб со знаком.
 */

/** Классы-хуки для собственного `<style>`: CSS из них не порождается. */
export const diffHookClass = 'gr-diff'
export const diffRowClass = 'gr-diff__row'
export const diffGutterCellClass = 'gr-diff__gutter'

export const diffRootClass
  = 'min-w-0 rounded-[var(--gr-radius-md)] bg-[var(--gr-code-block-bg,var(--gr-muted))] text-[var(--gr-code-block-fg,var(--gr-fg))]'

export const diffScrollClass = codeSurfaceScrollClass
export const diffFontClass = codeSurfaceFontClass
export const diffWrapClass = codeSurfaceWrapClass
export const diffNowrapClass = codeSurfaceNowrapClass
export const diffPaddings = codeSurfacePaddings
export const diffTextSizes = codeSurfaceTextSizes

/** Сводка над диффом: живой регион, поэтому видимая, а не `sr-only`. */
export const diffSummaryClass = 'flex items-center gap-2 border-b border-[var(--gr-brd)] px-3 py-2 text-[var(--gr-muted-fg)]'

/**
 * Подложка строки по виду правки.
 *
 * Цвет — не единственный носитель смысла (иначе WCAG 1.4.1): вид строки
 * дублируется знаком в жёлобе. Дифф читают и на монохромной печати.
 */
export const diffRowTone: Record<GrDiffOp, string> = {
  equal: '',
  add: 'bg-[var(--gr-diff-added,var(--gr-success-light))]',
  remove: 'bg-[var(--gr-diff-removed,var(--gr-danger-light))]',
}

/**
 * Пословная подсветка внутри изменённой строки — плотнее строчной подложки.
 *
 * Без неё правка одного слова читается как «строка целиком другая», и дифф
 * перестаёт отвечать на свой вопрос.
 *
 * Текст на подложке — свой токен, а не роль темы: перекрасить подложку и не
 * иметь возможности перекрасить текст на ней значит развалить контраст ровно
 * там, где его труднее всего заметить.
 */
export const diffWordTone: Record<'add' | 'remove', string> = {
  add: 'bg-[var(--gr-diff-word-added,var(--gr-success))] text-[var(--gr-diff-word-added-fg,var(--gr-success-fg))]',
  remove: 'bg-[var(--gr-diff-word-removed,var(--gr-danger))] text-[var(--gr-diff-word-removed-fg,var(--gr-danger-fg))]',
}

/** Жёлоб: номера строк и знак правки. Не выделяется мышью — это не содержимое. */
export const diffGutterClass
  = 'select-none pr-2 text-right text-[var(--gr-diff-gutter,var(--gr-muted-fg))]'

export const diffSignClass = 'select-none px-1 text-center'

/**
 * Полоса пропуска: разделитель между показанными участками.
 *
 * Подложка — свой токен, а не роль темы: перекрасив палитру кода, полосу иначе
 * не достать, и внутри тёмного диффа она осталась бы светлым разрывом.
 */
export const diffGapRowClass
  = 'flex items-center gap-2 border-y border-[var(--gr-brd)] bg-[var(--gr-diff-gap-bg,var(--gr-bg))] px-3 py-1 text-[var(--gr-diff-gutter,var(--gr-muted-fg))]'

/** Пропуск, который открывается целиком одним нажатием: кнопка во всю полосу. */
export const diffGapClass
  = 'w-full text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--gr-ring)] hover:text-[var(--gr-fg)]'

/**
 * Кнопка края.
 *
 * Цель нажатия обязана быть крупнее глифа: полоса пропуска низкая, и стрелка
 * без собственных отступов оказалась бы мишенью в несколько пикселей.
 */
export const diffGapEdgeClass
  = 'shrink-0 rounded-[var(--gr-radius-sm)] px-2 py-0.5 hover:bg-[var(--gr-muted)] hover:text-[var(--gr-fg)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--gr-ring)]'

/** Счётчик между кнопками: занимает остаток полосы, поэтому кнопки по краям. */
export const diffGapCountClass = 'flex-1 text-center'

/** Колонка в режиме `split`: половина ширины, со своей прокруткой по горизонтали. */
export const diffSplitCellClass = 'w-1/2 align-top'

export function diffSizeClass(size: GrComponentSize): string {
  return `${diffTextSizes[size]} ${diffPaddings[size]}`
}
