import type { GrComponentSize } from '../shared/sizes'

/**
 * Классы `GrKbd`.
 *
 * Шкала полная (`xs…lg`), а не «sm и всё остальное»: тип пропа обещает четыре
 * ступени, и `xs`/`lg` не должны молча рендериться как `md`.
 */

export const GR_KBD_VARIANTS = ['merged', 'split', 'sequence'] as const

/**
 * `merged` — сочетание одной плашкой (`⌘K`), как его пишут сами системы;
 * `split` — по плашке на клавишу; `sequence` — аккорд «G затем I».
 */
export type GrKbdVariant = typeof GR_KBD_VARIANTS[number]

export const keyBaseClass = 'inline-flex items-center justify-center rounded-[var(--gr-radius-control)] border border-[var(--gr-brd)] bg-[var(--gr-muted)] font-medium leading-none text-[var(--gr-muted-fg)] shadow-[var(--gr-shadow-1)] tabular-nums'

export const keySizes: Record<GrComponentSize, string> = {
  xs: 'min-w-[1.25rem] h-5 px-1 text-[length:var(--gr-control-text-3xs)]',
  sm: 'min-w-[1.5rem] h-6 px-1.5 text-[length:var(--gr-control-text-xs)]',
  md: 'min-w-[1.75rem] h-7 px-2 text-[length:var(--gr-control-text-md)]',
  lg: 'min-w-[2rem] h-8 px-2.5 text-[length:var(--gr-control-text-lg)]',
}

/**
 * Клавиша внутри общей плашки: ни рамки, ни фона, ни собственной ширины —
 * иначе `⌘K` разъехалось бы зазорами внутри одного чипа.
 */
export const mergedKeyClass = 'inline-flex items-center justify-center'

/** Обёртка `split`: сама рамки не имеет — её рисуют вложенные клавиши. */
export const comboBaseClass = 'inline-flex items-center align-middle'

export const comboGaps: Record<GrComponentSize, string> = {
  xs: 'gap-0.5',
  sm: 'gap-1',
  md: 'gap-1',
  lg: 'gap-1.5',
}

/** Зазор внутри общей плашки: между глифами он меньше, чем между плашками. */
export const mergedGaps: Record<GrComponentSize, string> = {
  xs: 'gap-0',
  sm: 'gap-0.5',
  md: 'gap-0.5',
  lg: 'gap-1',
}

export const separatorClass = 'select-none text-[var(--gr-muted-fg)]'

/** Слово-разделитель аккорда стоит между плашками и не липнет к ним. */
export const sequenceSeparatorClass = 'select-none px-1 text-[var(--gr-muted-fg)]'

export function grKbdKeyClass(size: GrComponentSize): string {
  return `${keyBaseClass} ${keySizes[size]}`
}

export function grKbdComboClass(size: GrComponentSize, variant: GrKbdVariant): string {
  return variant === 'merged'
    ? `${keyBaseClass} ${keySizes[size]} ${mergedGaps[size]}`
    : `${comboBaseClass} ${comboGaps[size]}`
}

/** Класс клавиши внутри сочетания: в общей плашке она без собственной рамки. */
export function grKbdInnerKeyClass(size: GrComponentSize, variant: GrKbdVariant): string {
  return variant === 'merged' ? mergedKeyClass : grKbdKeyClass(size)
}
