import { splitClassTokens } from '../../internal/classTokens'

export type GrRichTextSize = 'xs' | 'sm' | 'md' | 'lg'

/**
 * Кегль и минимальная высота поля — ступенями шкалы контролов.
 *
 * Межстрочный идёт парой с кеглем: утилита `text-*` в UnoCSS задаёт оба, и
 * кегль, переведённый на токен в одиночку, отдал бы интервал на откуп `body`
 * приложения. Высота — покомпонентным токеном, потому что она про площадь
 * ввода, а не про ступень контрола: её потребитель меняет чаще всего.
 */
export const sizeClasses = {
  xs: 'text-[length:var(--gr-control-text-xs)] leading-[var(--gr-control-leading-xs)]',
  sm: 'text-[length:var(--gr-control-text-sm)] leading-[var(--gr-control-leading-sm)]',
  md: 'text-[length:var(--gr-control-text-md)] leading-[var(--gr-control-leading-md)]',
  lg: 'text-[length:var(--gr-control-text-lg)] leading-[var(--gr-control-leading-lg)]',
} as const satisfies Record<GrRichTextSize, string>

/** Ступень кнопки тулбара — на ступень мельче поля: панель не спорит с текстом. */
export const toolbarButtonSize = {
  xs: 'xs',
  sm: 'xs',
  md: 'sm',
  lg: 'sm',
} as const satisfies Record<GrRichTextSize, 'xs' | 'sm'>

export const rootClass = 'relative overflow-hidden rounded-[var(--gr-radius-lg)] border border-[var(--gr-brd)] bg-[var(--gr-bg)] transition-colors duration-[var(--gr-duration-fast)] ease-[var(--gr-ease-out)]'

export const rootFocusClass = 'focus-within:border-[var(--gr-primary)] focus-within:ring-2 focus-within:ring-[var(--gr-ring)]'

export const rootInvalidClass = 'border-[var(--gr-invalid-brd)] focus-within:border-[var(--gr-invalid-brd)] focus-within:ring-[var(--gr-invalid-ring)]'

export const rootDisabledClass = 'bg-[var(--gr-muted)] cursor-not-allowed'

export const toolbarClass = 'flex flex-wrap items-center gap-1 border-b border-[var(--gr-brd)] bg-[var(--gr-muted)] px-2 py-1.5'

export const toolbarSeparatorClass = 'mx-1 h-4 w-px bg-[var(--gr-brd)]'

export const bubbleClass = 'flex items-center gap-1'

export const contentClass = 'px-3 py-2 outline-none'

/**
 * Классы из `.ts`-хелпера обязаны быть в safelist: бандлер выносит модуль в
 * общий `dist/chunks/`, а пресет сканирует только `dist/components/<Name>/**`.
 * Симптом пропуска — поле без рамки и фокус-кольца у того, кто импортировал
 * один компонент.
 */
export const grRichTextSafelist: string[] = [
  ...Object.values(sizeClasses).flatMap(splitClassTokens),
  ...splitClassTokens(rootClass),
  ...splitClassTokens(rootFocusClass),
  ...splitClassTokens(rootInvalidClass),
  ...splitClassTokens(rootDisabledClass),
  ...splitClassTokens(toolbarClass),
  ...splitClassTokens(toolbarSeparatorClass),
  ...splitClassTokens(bubbleClass),
  ...splitClassTokens(contentClass),
]
