export type GrCardPadding = 'none' | 'sm' | 'md' | 'lg'
export type GrCardVariant = 'elevated' | 'outlined' | 'ghost'

/**
 * Классы `GrCard`.
 *
 * `elevated` — дефолт и ровно тот вид, что был у карточки до появления пропов:
 * `GrCollapse` и `GrList` рендерят содержимое внутрь `GrCard`, и любое смещение
 * дефолта поехало бы у них.
 */

export const surfaceBaseClass = 'rounded-[var(--gr-radius-lg)] bg-[var(--gr-card)] text-[var(--gr-card-fg)]'

export const variantClass: Record<GrCardVariant, string> = {
  elevated: 'border border-[var(--gr-brd)] shadow-sm',
  outlined: 'border border-[var(--gr-brd)]',
  // Карточка внутри карточки: вторая рамка только шумит.
  ghost: '',
}

export const paddingClass: Record<GrCardPadding, string> = {
  none: '',
  sm: 'p-3',
  md: 'p-4',
  lg: 'p-6',
}

export const sectionDividerTopClass = 'border-t border-[var(--gr-brd)]'
export const sectionDividerBottomClass = 'border-b border-[var(--gr-brd)]'

/** Интерактивная карточка целиком: ссылка или кнопка во всю поверхность. */
export const interactiveClass = 'block w-full text-left transition-colors duration-[var(--gr-duration-fast)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--gr-ring)]'

export const hoverClass = 'cursor-pointer hover:bg-[var(--gr-muted)]'

export function grCardRootClass(options: {
  variant: GrCardVariant
  /** Падинг едет на корень, только пока нет секций — иначе лишняя обёртка. */
  padding: GrCardPadding
  interactive: boolean
  hoverable: boolean
}): string {
  return [
    surfaceBaseClass,
    variantClass[options.variant],
    paddingClass[options.padding],
    options.interactive ? interactiveClass : '',
    options.interactive || options.hoverable ? hoverClass : '',
  ].filter(Boolean).join(' ')
}
