export const treeSectionsRootClass = 'flex flex-col gap-4'

/**
 * Заголовок группы набирается капителью и отделяется линией: он объявляет
 * рубрику, а не узел, и должен читаться иначе, чем строки под ним.
 */
export const treeSectionsHeadClass = 'flex items-baseline gap-2 pb-1 text-[length:var(--gr-text-xs)] leading-[var(--gr-leading-xs)] uppercase tracking-wider text-[var(--gr-muted-fg)] border-b border-[var(--gr-brd)]'

export const treeSectionsCountClass = 'ml-auto text-[var(--gr-muted-fg)] [font-variant-numeric:tabular-nums]'

export const treeSectionsGroupClass = 'flex flex-col gap-1'
