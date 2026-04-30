export type GrSelectView = 'default' | 'link'
export type GrSelectSize = 'xs' | 'sm' | 'md' | 'lg'
export type GrSelectVariant = 'primary' | 'default' | 'muted' | 'danger'
export type GrSelectUnderline = 'auto' | 'always' | 'none'
export type GrSelectOptionsView = 'native' | 'panel'
export type GrSelectOption = { value: string, label: string }
export type GrSelectModelValue = string | string[]

export const defaultBaseClass = 'w-full rounded-md border border-[var(--brd)] bg-[var(--bg)] text-[var(--fg)] transition-colors duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]'
export const linkBaseClass = 'cursor-pointer inline-block w-auto align-baseline appearance-none bg-transparent border border-transparent px-0 py-0 rounded-[6px] transition-colors duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]'


export const selectSizeClassBySize: Record<GrSelectSize, string> = {
  xs: 'h-7 px-2.5 text-[12px]',
  sm: 'h-8 px-3 text-[13px]',
  md: 'h-10 px-3 text-[14px]',
  lg: 'h-11 px-4 text-[16px]',
}

export const selectLinkSizeClassBySize: Record<GrSelectSize, string> = {
  xs: 'text-[12px]',
  sm: 'text-[13px]',
  md: 'text-[14px]',
  lg: 'text-[16px]',
}

export const selectLinkVariantClassByVariant: Record<GrSelectVariant, string> = {
  primary: 'text-[var(--primary)] hover:text-[var(--primary-hover)] active:text-[var(--primary-active)]',
  default: 'text-[var(--fg)] hover:text-[var(--primary)] active:text-[var(--primary-active)]',
  muted: 'text-[var(--muted-fg)] hover:text-[var(--fg)] active:text-[var(--fg)]',
  danger: 'text-[var(--ds-danger)] hover:text-[var(--ds-danger-hover)] active:text-[var(--ds-danger-active)]',
}

function selectLinkUnderlineClass(options: { underline: GrSelectUnderline, disabled: boolean }): string {
  if (options.disabled) return 'no-underline'
  if (options.underline === 'always') return 'underline underline-offset-4'
  if (options.underline === 'none') return 'no-underline'
  return 'no-underline hover:underline hover:underline-offset-4'
}

export function grSelectClass(options: {
  view: GrSelectView
  size: GrSelectSize
  disabled: boolean
  variant: GrSelectVariant
  underline: GrSelectUnderline
}): string {
  if (options.view === 'link') {
    return [
      selectLinkSizeClassBySize[options.size],
      selectLinkUnderlineClass({ underline: options.underline, disabled: options.disabled }),
      selectLinkVariantClassByVariant[options.variant],
      'disabled:opacity-60 disabled:cursor-not-allowed disabled:text-[var(--muted-fg)] disabled:no-underline',
    ].join(' ')
  }

  return [
    selectSizeClassBySize[options.size],
    'disabled:opacity-50 disabled:cursor-not-allowed',
  ].join(' ')
}

export function grSelectNativeClass(options: {
  view: GrSelectView
  size: GrSelectSize
  disabled: boolean
  variant: GrSelectVariant
  underline: GrSelectUnderline
  showNativeChevron: boolean
}): string {
  return [
    grSelectClass(options),
    options.showNativeChevron ? 'appearance-none pr-9' : '',
  ]
    .filter(Boolean)
    .join(' ')
}

export function grSelectTriggerClass(options: {
  view: GrSelectView
  optionsView: GrSelectOptionsView
  size: GrSelectSize
  disabled: boolean
  variant: GrSelectVariant
  underline: GrSelectUnderline
}): string {
  if (options.optionsView !== 'panel') {
    return grSelectClass(options)
  }

  if (options.view === 'link') {
    return [
      grSelectClass(options),
      'inline-flex items-center gap-1 text-left',
    ].join(' ')
  }

  return [
    grSelectClass(options),
    'flex items-center justify-between text-left',
  ].join(' ')
}

export const grSelectPanelClasses = 'rounded-[var(--ds-radius-xl)] border border-[var(--brd)] bg-[var(--card)] text-[var(--card-fg)] shadow-[var(--ds-shadow-2)] overflow-hidden'
