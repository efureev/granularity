import type { GrComponentSize } from '../shared/sizes'

export type GrEmptyStateSize = GrComponentSize

/** Поверхность карточки. `ghost` — для встраивания в уже существующую карточку. */
export const GR_EMPTY_STATE_VARIANTS = ['outlined', 'ghost'] as const
export type GrEmptyStateVariant = typeof GR_EMPTY_STATE_VARIANTS[number]

/**
 * Уровень заголовка. `h1` намеренно нет: пустое состояние живёт внутри уже
 * существующей структуры страницы, а не задаёт её.
 */
export const GR_EMPTY_STATE_HEADING_LEVELS = [2, 3, 4, 5, 6] as const
export type GrEmptyStateHeadingLevel = typeof GR_EMPTY_STATE_HEADING_LEVELS[number]

export const rootBaseClass = 'text-center'

export const variantClass: Record<GrEmptyStateVariant, string> = {
  outlined: 'rounded-[var(--gr-radius-lg)] border border-[var(--gr-brd)] bg-[var(--gr-card)]',
  // Карточка внутри карточки: вторая рамка только шумит (тот же смысл, что у `GrCard`).
  ghost: '',
}

export const rootPaddingBySize: Record<GrEmptyStateSize, string> = {
  xs: 'p-3',
  sm: 'p-4',
  md: 'p-6',
  lg: 'p-8',
}

export const iconBoxBaseClass = 'flex items-center justify-center border border-[var(--gr-brd)] bg-[var(--gr-muted)] text-[var(--gr-muted-fg)]'

export const iconBoxBySize: Record<GrEmptyStateSize, string> = {
  xs: 'h-8 w-8 rounded-[var(--gr-radius-md)]',
  sm: 'h-10 w-10 rounded-[var(--gr-radius-md)]',
  md: 'h-12 w-12 rounded-[var(--gr-radius-lg)]',
  lg: 'h-14 w-14 rounded-[var(--gr-radius-lg)]',
}

/** Размер самой иконки в пикселях — `GrIcon` принимает число. */
export const iconSizeBySize: Record<GrEmptyStateSize, number> = {
  xs: 16,
  sm: 20,
  md: 24,
  lg: 28,
}

/**
 * `mb-0` гасит браузерный отступ снизу у настоящего заголовка: без сброса
 * карточка разъезжается по вертикали.
 */
export const titleBaseClass = 'mb-0 font-700'

export const titleBySize: Record<GrEmptyStateSize, string> = {
  xs: 'mt-2 text-[length:var(--gr-text-xs)] leading-[var(--gr-leading-xs)]',
  sm: 'mt-3 text-[length:var(--gr-text-sm)] leading-[var(--gr-leading-sm)]',
  md: 'mt-4 text-[length:var(--gr-text-sm)] leading-[var(--gr-leading-sm)]',
  lg: 'mt-5 text-[length:var(--gr-text-base)] leading-[var(--gr-leading-base)]',
}

export const descriptionBaseClass = 'text-[var(--gr-muted-fg)]'

export const descriptionBySize: Record<GrEmptyStateSize, string> = {
  xs: 'mt-0.5 text-[length:var(--gr-text-xs)] leading-[var(--gr-leading-xs)]',
  sm: 'mt-1 text-[length:var(--gr-text-xs)] leading-[var(--gr-leading-xs)]',
  md: 'mt-1 text-[length:var(--gr-text-sm)] leading-[var(--gr-leading-sm)]',
  lg: 'mt-2 text-[length:var(--gr-text-sm)] leading-[var(--gr-leading-sm)]',
}

export const actionsBaseClass = 'flex justify-center'

export const actionsBySize: Record<GrEmptyStateSize, string> = {
  xs: 'mt-2',
  sm: 'mt-3',
  md: 'mt-4',
  lg: 'mt-5',
}

export function grEmptyStateRootClass(options: {
  variant: GrEmptyStateVariant
  size: GrEmptyStateSize
}): string {
  return [rootBaseClass, variantClass[options.variant], rootPaddingBySize[options.size]]
    .filter(Boolean)
    .join(' ')
}
