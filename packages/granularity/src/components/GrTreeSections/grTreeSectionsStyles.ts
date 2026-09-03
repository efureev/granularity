export const treeSectionsRootClass = 'flex flex-col gap-4'

/**
 * Заголовок группы набирается капителью и отделяется линией: он объявляет
 * рубрику, а не узел, и должен читаться иначе, чем строки под ним.
 */
export const treeSectionsHeadClass = 'flex items-baseline gap-2 pb-1 text-[length:var(--gr-text-xs)] leading-[var(--gr-leading-xs)] uppercase tracking-wider text-[var(--gr-muted-fg)] border-b border-[var(--gr-brd)]'

export const treeSectionsCountClass = 'ml-auto text-[var(--gr-muted-fg)] [font-variant-numeric:tabular-nums]'

export const treeSectionsGroupClass = 'flex flex-col gap-1'

/**
 * Собственный вид строк секций. Задаётся на самом дереве, а не на обёртке:
 * `GrTree` объявляет значения по умолчанию на своём корне, и переменная,
 * выставленная предком, до строки не доходит вовсе — её перекрывает
 * собственное объявление дерева.
 *
 * Полоса у выбранной строки несёт то же, что заголовок группы, —
 * принадлежность: подложка выбора отступает на отступ уровня, и на вложенных
 * строках выбор переставал попадать в один вертикальный ряд с остальными.
 */
export const treeSectionsRowVars = {
  '--gr-tree-row-min-height': '32px',
  '--gr-tree-row-radius': '7px',
  '--gr-tree-row-current-bar-width': '2px',
} as const
