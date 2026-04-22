export type DsLinkVariant = 'primary' | 'default' | 'muted' | 'danger'
export type DsLinkUnderline = 'auto' | 'always' | 'none'
export type DsLinkSize = 'sm' | 'md' | 'lg'

// Базовые классы корневого элемента (`<a>`/`<span>`). Вынесены сюда,
// чтобы быть единственным источником истины как для шаблона, так и для safelist.
export const baseRootClass = 'inline-flex items-center gap-1 rounded-[6px] transition-colors duration-150'
export const focusRingClass = 'focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]'

export const sizeClassBySize: Record<DsLinkSize, string> = {
  sm: 'text-sm',
  md: 'text-[14px]',
  lg: 'text-base',
}

export const variantClassByVariant: Record<DsLinkVariant, string> = {
  primary:
    'text-[var(--primary)] visited:text-[var(--primary)] hover:text-[var(--primary-hover)] active:text-[var(--primary-active)]',
  default: 'text-[var(--fg)] hover:text-[var(--primary)] active:text-[var(--primary-active)]',
  muted: 'text-[var(--muted-fg)] hover:text-[var(--fg)] active:text-[var(--fg)]',
  danger: 'text-[var(--ds-danger)] hover:text-[var(--ds-danger-hover)] active:text-[var(--ds-danger-active)]',
}

export const disabledStateClass = 'cursor-not-allowed opacity-60 text-[var(--muted-fg)]'

const UNDERLINE_VALUES: readonly DsLinkUnderline[] = ['auto', 'always', 'none']

function underlineClass(underline: DsLinkUnderline, disabled: boolean): string {
  if (disabled) return 'no-underline'
  if (underline === 'always') return 'underline underline-offset-4'
  if (underline === 'none') return 'no-underline'
  return 'no-underline hover:underline hover:underline-offset-4'
}

// Derived from `underlineClass` so that there is a single source of truth:
// any change/extension of the underline logic is automatically reflected
// in the safelist without manual updates.
export const underlineClasses: readonly string[] = [...new Set(
  UNDERLINE_VALUES.flatMap(u => [underlineClass(u, false), underlineClass(u, true)]),
)]

function disabledClass(disabled: boolean): string {
  return disabled ? disabledStateClass : ''
}

export function dsLinkClass(options: { size: DsLinkSize, underline: DsLinkUnderline, variant: DsLinkVariant, disabled: boolean }): string {
  return [
    sizeClassBySize[options.size],
    underlineClass(options.underline, options.disabled),
    variantClassByVariant[options.variant],
    disabledClass(options.disabled),
  ]
    .filter(Boolean)
    .join(' ')
}
