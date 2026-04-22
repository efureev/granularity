export type DsSelectView = 'default' | 'link'
export type DsSelectSize = 'xs' | 'sm' | 'md' | 'lg'
export type DsSelectVariant = 'primary' | 'default' | 'muted' | 'danger'
export type DsSelectUnderline = 'auto' | 'always' | 'none'
export type DsSelectOptionsView = 'native' | 'panel'
export type DsSelectOption = { value: string, label: string }
export type DsSelectModelValue = string | string[]

export const defaultBaseClass = 'w-full rounded-md border border-[var(--brd)] bg-[var(--bg)] text-[var(--fg)] transition-colors duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]'
export const linkBaseClass = 'cursor-pointer inline-block w-auto align-baseline appearance-none bg-transparent border border-transparent px-0 py-0 rounded-[6px] transition-colors duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]'


export const selectSizeClassBySize: Record<DsSelectSize, string> = {
  xs: 'h-7 px-2.5 text-[12px]',
  sm: 'h-8 px-3 text-[13px]',
  md: 'h-10 px-3 text-[14px]',
  lg: 'h-11 px-4 text-[16px]',
}

export const selectLinkSizeClassBySize: Record<DsSelectSize, string> = {
  xs: 'text-[12px]',
  sm: 'text-[13px]',
  md: 'text-[14px]',
  lg: 'text-[16px]',
}

export const selectLinkVariantClassByVariant: Record<DsSelectVariant, string> = {
  primary: 'text-[var(--primary)] hover:text-[var(--primary-hover)] active:text-[var(--primary-active)]',
  default: 'text-[var(--fg)] hover:text-[var(--primary)] active:text-[var(--primary-active)]',
  muted: 'text-[var(--muted-fg)] hover:text-[var(--fg)] active:text-[var(--fg)]',
  danger: 'text-[var(--ds-danger)] hover:text-[var(--ds-danger-hover)] active:text-[var(--ds-danger-active)]',
}

function selectLinkUnderlineClass(options: { underline: DsSelectUnderline, disabled: boolean }): string {
  if (options.disabled) return 'no-underline'
  if (options.underline === 'always') return 'underline underline-offset-4'
  if (options.underline === 'none') return 'no-underline'
  return 'no-underline hover:underline hover:underline-offset-4'
}

export function dsSelectClass(options: {
  view: DsSelectView
  size: DsSelectSize
  disabled: boolean
  variant: DsSelectVariant
  underline: DsSelectUnderline
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

export function dsSelectNativeClass(options: {
  view: DsSelectView
  size: DsSelectSize
  disabled: boolean
  variant: DsSelectVariant
  underline: DsSelectUnderline
  showNativeChevron: boolean
}): string {
  return [
    dsSelectClass(options),
    options.showNativeChevron ? 'appearance-none pr-9' : '',
  ]
    .filter(Boolean)
    .join(' ')
}

export function dsSelectTriggerClass(options: {
  view: DsSelectView
  optionsView: DsSelectOptionsView
  size: DsSelectSize
  disabled: boolean
  variant: DsSelectVariant
  underline: DsSelectUnderline
}): string {
  if (options.optionsView !== 'panel') {
    return dsSelectClass(options)
  }

  if (options.view === 'link') {
    return [
      dsSelectClass(options),
      'inline-flex items-center gap-1 text-left',
    ].join(' ')
  }

  return [
    dsSelectClass(options),
    'flex items-center justify-between text-left',
  ].join(' ')
}

export const dsSelectPanelClasses = 'rounded-[var(--ds-radius-xl)] border border-[var(--brd)] bg-[var(--card)] text-[var(--card-fg)] shadow-[var(--ds-shadow-2)] overflow-hidden'
