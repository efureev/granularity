import { splitClassTokens } from '../shared/classTokens'

export type DsSelectView = 'default' | 'link'
export type DsSelectSize = 'xs' | 'sm' | 'md' | 'lg'
export type DsSelectVariant = 'primary' | 'default' | 'muted' | 'danger'
export type DsSelectUnderline = 'auto' | 'always' | 'none'
export type DsSelectOptionsView = 'native' | 'panel'
export type DsSelectOption = { value: string, label: string }
export type DsSelectModelValue = string | string[]

const defaultBaseClass = 'w-full rounded-md border border-[var(--brd)] bg-[var(--bg)] text-[var(--fg)] transition-colors duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]'
const linkBaseClass = 'cursor-pointer inline-block w-auto align-baseline appearance-none bg-transparent border border-transparent px-0 py-0 rounded-[6px] transition-colors duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]'

const templateStaticTokens = [
  'relative inline-block align-baseline',
  'relative w-full',
  'absolute top-1/2 -translate-y-1/2 right-3 text-[var(--muted-fg)] pointer-events-none',
  'min-w-0 flex-1',
  'block truncate',
  'shrink-0 h-4 w-4',
  'shrink-0 text-[var(--muted-fg)] pointer-events-none',
  'absolute top-1/2 -translate-y-1/2 right-3 h-6 w-6 inline-flex items-center justify-center rounded-md text-[var(--muted-fg)] hover:text-[var(--fg)] hover:bg-[color-mix(in_srgb,var(--muted)_25%,transparent)] disabled:opacity-50',
  'fixed w-full',
  'p-2 border-b border-[var(--brd)]',
  'p-1 overflow-auto',
  'w-full rounded-[10px] px-3 py-2 text-left text-[13px] hover:bg-[color-mix(in_srgb,var(--muted)_30%,transparent)]',
  'flex items-center gap-2 min-w-0',
  'h-4 w-4 shrink-0',
  'truncate',
  'i-lucide-chevron-down',
  'i-lucide-x',
  'transition ease-out duration-150',
  'transform opacity-0 scale-95',
  'transform opacity-100 scale-100',
  'transition ease-in duration-100',
  'i-lucide-check',
]

const selectSizeClassBySize: Record<DsSelectSize, string> = {
  xs: 'h-7 px-2.5 text-[12px]',
  sm: 'h-8 px-3 text-[13px]',
  md: 'h-10 px-3 text-[14px]',
  lg: 'h-11 px-4 text-[16px]',
}

const selectLinkSizeClassBySize: Record<DsSelectSize, string> = {
  xs: 'text-[12px]',
  sm: 'text-[13px]',
  md: 'text-[14px]',
  lg: 'text-[16px]',
}

const selectLinkVariantClassByVariant: Record<DsSelectVariant, string> = {
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

export const dsSelectSafelist = [...new Set([
  ...splitClassTokens(defaultBaseClass),
  ...splitClassTokens(linkBaseClass),
  ...Object.values(selectSizeClassBySize).flatMap(splitClassTokens),
  ...Object.values(selectLinkSizeClassBySize).flatMap(splitClassTokens),
  ...Object.values(selectLinkVariantClassByVariant).flatMap(splitClassTokens),
  ...['no-underline', 'underline underline-offset-4', 'no-underline hover:underline hover:underline-offset-4'].flatMap(splitClassTokens),
  ...splitClassTokens('disabled:opacity-60 disabled:cursor-not-allowed disabled:text-[var(--muted-fg)] disabled:no-underline'),
  ...splitClassTokens('disabled:opacity-50 disabled:cursor-not-allowed'),
  ...splitClassTokens('appearance-none pr-9'),
  ...splitClassTokens('inline-flex items-center gap-1 text-left'),
  ...splitClassTokens('flex items-center justify-between text-left'),
  ...splitClassTokens(dsSelectPanelClasses),
  ...templateStaticTokens.flatMap(splitClassTokens),
])]