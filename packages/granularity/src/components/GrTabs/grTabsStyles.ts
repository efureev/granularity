import type { GrComponentSize } from '../shared/sizes'

export type GrTabsSize = GrComponentSize

/**
 * `pills` — вкладки-таблетки в общей обойме, `line` — классический ряд с
 * подчёркиванием активной. Имя `pills` общее с `GrSegmented`: у компонентов
 * одна роль, и вид с таким названием у них совпадает.
 */
export const GR_TABS_VARIANTS = ['pills', 'line'] as const
export type GrTabsVariant = typeof GR_TABS_VARIANTS[number]

export type GrTabsOrientation = 'horizontal' | 'vertical'

/** Высота вкладки повторяет шкалу `GrButton`: вкладки часто стоят с ним в один ряд. */
export const tabSizes: Record<GrTabsSize, string> = {
  xs: 'h-7 px-2 text-[length:var(--gr-text-xs)]',
  sm: 'h-8 px-2.5 text-[length:var(--gr-text-xs)]',
  md: 'h-9 px-3 text-[length:var(--gr-text-sm)]',
  lg: 'h-10 px-4 text-[length:var(--gr-text-base)]',
}

/** Счётчик у вкладки: на ступень мельче подписи. */
export const tabBadgeSizes: Record<GrTabsSize, string> = {
  xs: 'text-[length:var(--gr-text-2xs)] px-1 py-0.5',
  sm: 'text-[length:var(--gr-text-2xs)] px-1.5 py-0.5',
  md: 'text-[length:var(--gr-text-2xs)] px-1.5 py-0.5',
  lg: 'text-[length:var(--gr-text-xs)] px-2 py-0.5',
}

/** Обойма вокруг вкладок: на мелких ступенях рамка съедала бы высоту. */
export const tablistSizes: Record<GrTabsSize, string> = {
  xs: 'gap-0.5 p-0.5',
  sm: 'gap-1 p-1',
  md: 'gap-1 p-1',
  lg: 'gap-1 p-1.5',
}

/** `line` живёт без обоймы, поэтому и без внутренних отступов. */
export const tablistLineSizes: Record<GrTabsSize, string> = {
  xs: 'gap-1',
  sm: 'gap-2',
  md: 'gap-2',
  lg: 'gap-3',
}

export const tablistBase = 'inline-flex max-w-full'

export const tablistVariants: Record<GrTabsVariant, string> = {
  pills: 'rounded-[var(--gr-radius-lg)] border border-[var(--gr-brd)] bg-[var(--gr-muted)]',
  line: 'border-b border-[var(--gr-brd)]',
}

/**
 * Вертикальный `line` подчёркивает вкладку сбоку, а не снизу: линия должна идти
 * вдоль списка, иначе она отделяет вкладки друг от друга вместо ряда целиком.
 */
export const tablistVerticalVariants: Record<GrTabsVariant, string> = {
  pills: '',
  line: 'border-b-0 border-r border-[var(--gr-brd)]',
}

/**
 * Переполнение прокручивается, а не переносится строкой: перенос ломает ряд и
 * уводит вкладки под панель. Полоса прокрутки скрыта — ряд ведёт клавиатура и
 * автоскролл к активной вкладке.
 */
export const tablistScrollClass = 'overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden'

/** Вертикальный ряд — колонка; прокрутки ему не нужно: он растёт вниз. */
export const tablistColumnClass = 'flex-col'

export const tabBase = 'shrink-0 font-600 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--gr-ring)]'

// Цвет подчёркивания задаёт только состояние: `border-transparent` в базе имеет
// ту же специфичность, что и цвет активной вкладки, и побеждал бы через раз —
// по порядку правил в сгенерированном CSS, а не по порядку классов в атрибуте.
export const tabVariantBase: Record<GrTabsVariant, string> = {
  pills: 'rounded-[var(--gr-radius-md)]',
  line: 'rounded-[var(--gr-radius-md)] rounded-b-[var(--gr-radius-none)] border-b-2 -mb-px',
}

export const tabStateClasses: Record<GrTabsVariant, { active: string, idle: string, disabled: string }> = {
  pills: {
    active: 'bg-[var(--gr-card)] text-[var(--gr-fg)] border border-[var(--gr-brd)]',
    idle: 'text-[var(--gr-muted-fg)] hover:text-[var(--gr-fg)] hover:bg-[color-mix(in_srgb,var(--gr-card)_70%,transparent)]',
    disabled: 'cursor-not-allowed text-[var(--gr-disabled-fg)]',
  },
  line: {
    active: 'border-[var(--gr-primary)] text-[var(--gr-fg)]',
    idle: 'border-transparent text-[var(--gr-muted-fg)] hover:text-[var(--gr-fg)] hover:border-[var(--gr-brd)]',
    disabled: 'border-transparent cursor-not-allowed text-[var(--gr-disabled-fg)]',
  },
}

export const tabIconClass = 'h-4 w-4 shrink-0'

export const tabContentClass = 'inline-flex items-center gap-2'

export const tabBadgeBase = 'rounded-[var(--gr-radius-full)] bg-[var(--gr-secondary)] text-[var(--gr-secondary-fg)]'

export function grTabsListClass(options: {
  variant: GrTabsVariant
  size: GrTabsSize
  orientation: GrTabsOrientation
}): string {
  const vertical = options.orientation === 'vertical'

  return [
    tablistBase,
    tablistVariants[options.variant],
    vertical ? tablistVerticalVariants[options.variant] : '',
    options.variant === 'pills' ? tablistSizes[options.size] : tablistLineSizes[options.size],
    vertical ? tablistColumnClass : tablistScrollClass,
  ].filter(Boolean).join(' ')
}

export function grTabsTabClass(options: {
  variant: GrTabsVariant
  size: GrTabsSize
  active: boolean
  disabled: boolean
}): string {
  const state = tabStateClasses[options.variant]

  return [
    tabBase,
    tabVariantBase[options.variant],
    tabSizes[options.size],
    options.disabled ? state.disabled : options.active ? state.active : state.idle,
  ].join(' ')
}

export function grTabsBadgeClass(size: GrTabsSize): string {
  return [tabBadgeBase, tabBadgeSizes[size]].join(' ')
}
