import { splitClassTokens } from '../shared/classTokens'

export type DsLinkVariant = 'primary' | 'default' | 'muted' | 'danger'
export type DsLinkUnderline = 'auto' | 'always' | 'none'
export type DsLinkSize = 'sm' | 'md' | 'lg'

const sizeClassBySize: Record<DsLinkSize, string> = {
  sm: 'text-sm',
  md: 'text-[14px]',
  lg: 'text-base',
}

const variantClassByVariant: Record<DsLinkVariant, string> = {
  primary:
    'text-[var(--primary)] visited:text-[var(--primary)] hover:text-[var(--primary-hover)] active:text-[var(--primary-active)]',
  default: 'text-[var(--fg)] hover:text-[var(--primary)] active:text-[var(--primary-active)]',
  muted: 'text-[var(--muted-fg)] hover:text-[var(--fg)] active:text-[var(--fg)]',
  danger: 'text-[var(--ds-danger)] hover:text-[var(--ds-danger-hover)] active:text-[var(--ds-danger-active)]',
}

function underlineClass(underline: DsLinkUnderline, disabled: boolean): string {
  if (disabled) return 'no-underline'
  if (underline === 'always') return 'underline underline-offset-4'
  if (underline === 'none') return 'no-underline'
  return 'no-underline hover:underline hover:underline-offset-4'
}

function disabledClass(disabled: boolean): string {
  return disabled ? 'cursor-not-allowed opacity-60 text-[var(--muted-fg)]' : ''
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

export const dsLinkSafelist = [...new Set([
  ...Object.values(sizeClassBySize).flatMap(splitClassTokens),
  ...['no-underline', 'underline underline-offset-4', 'no-underline hover:underline hover:underline-offset-4'].flatMap(splitClassTokens),
  ...Object.values(variantClassByVariant).flatMap(splitClassTokens),
  ...splitClassTokens('cursor-not-allowed opacity-60 text-[var(--muted-fg)]'),
])]