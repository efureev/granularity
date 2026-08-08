/**
 * Уровень заголовка секции. `h1` намеренно нет: страница задаёт его сама, а
 * секция формы — это подраздел внутри уже существующей структуры.
 */
export const GR_FORM_SECTION_HEADING_LEVELS = [2, 3, 4, 5, 6] as const

export type GrFormSectionHeadingLevel = typeof GR_FORM_SECTION_HEADING_LEVELS[number]

export const formSectionRootClass = 'grid gap-4'

/** Шапка: заголовок с описанием слева, действия справа. */
export const formSectionHeaderClass = 'flex flex-wrap items-start justify-between gap-3'

// `m-0` — у нативного заголовка есть браузерные отступы, и без сброса секция
// разъезжается по вертикали.
export const formSectionTitleClass = 'm-0 text-[length:var(--gr-text-sm)] font-700'

export const formSectionDescriptionClass = 'mt-1 text-[length:var(--gr-text-sm)] text-[var(--gr-muted-fg)]'

export const formSectionActionsClass = 'flex shrink-0 items-center gap-2'
