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

/**
 * Шрифт задаётся явно, и это не косметика.
 *
 * Своей типографики у клавиши не было вовсе: `<kbd>` красит моноширинным
 * UA-стиль браузера (и ресеты вроде `tailwind-compat` поверх него), то есть вид
 * компонента решал хост. А в моноширинных символы модификаторов нарисованы
 * мелкими: замер в `JetBrains Mono` — `⌘` 73 % высоты буквы, `⇧` 76 %, `⌥` 66 %;
 * рядом с `K` это читается как значок другого кегля, и на `xs` особенно. В
 * `--gr-font-ui` те же глифы дают 103 %, 103 % и 100 % — вровень с буквой.
 */
export const keyBaseClass = 'inline-flex items-center justify-center rounded-[var(--gr-radius-control)] border border-[var(--gr-brd)] bg-[var(--gr-muted)] font-[var(--gr-font-ui)] font-medium leading-none text-[var(--gr-muted-fg)] shadow-[var(--gr-shadow-1)] tabular-nums'

/**
 * Межстрочный здесь не парный: у клавиши он задан осознанно (`leading-none` в
 * `keyBaseClass`), и вторая декларация того же веса подралась бы с ним за
 * порядок в стилях. Правило — `docs/sizes.md`.
 */
export const keySizes: Record<GrComponentSize, string> = {
  xs: 'min-w-[1.25rem] h-5 px-1 text-[length:var(--gr-control-text-3xs)]',
  sm: 'min-w-[1.5rem] h-6 px-1.5 text-[length:var(--gr-control-text-xs)]',
  md: 'min-w-[1.75rem] h-7 px-2 text-[length:var(--gr-control-text-md)]',
  lg: 'min-w-[2rem] h-8 px-2.5 text-[length:var(--gr-control-text-lg)]',
}

/**
 * Клавиша внутри общей плашки: ни рамки, ни фона, ни собственной ширины —
 * иначе `⌘K` разъехалось бы зазорами внутри одного чипа.
 *
 * Семейство шрифта повторяется здесь, хотя внешняя плашка его уже задала:
 * внутренняя клавиша — тоже `<kbd>`, а ресет хоста красит их по имени тега, и
 * правило на элементе бьёт наследование от родителя. Без этой строки глифы
 * оставались бы моноширинными внутри плашки, набранной UI-шрифтом.
 */
export const mergedKeyClass = 'inline-flex items-center justify-center font-[var(--gr-font-ui)]'

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
