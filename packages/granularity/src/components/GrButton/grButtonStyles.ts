import type { GrTone } from '../shared/tones'

export type GrButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'ghost-border'
export type GrButtonTone = GrTone
export type GrButtonSize = 'xs' | 'sm' | 'md' | 'lg'

export type GrButtonClassOptions = {
  variant: GrButtonVariant
  tone: GrButtonTone
  size: GrButtonSize
  square: boolean
}

export type GrButtonToneTokens = {
  solidBackground: string
  solidBackgroundHover: string
  solidBackgroundActive: string
  solidForeground: string
  accentText: string
  softBackground: string
  softBackgroundHover: string
  softBackgroundActive: string
  softForeground: string
  border: string
  borderHover: string
  borderActive: string
}

export const base =
  'inline-flex items-center justify-center gap-2 select-none whitespace-nowrap rounded-md transition-colors duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--gr-ring)] disabled:opacity-50 disabled:cursor-not-allowed'

export const grButtonBaseClass = base

export const sizes: Record<GrButtonSize, string> = {
  xs: 'h-7 text-xs px-2.5',
  sm: 'h-8 text-sm px-3',
  md: 'h-10 text-sm px-4',
  lg: 'h-11 text-base px-5',
}

export const squareSizes: Record<GrButtonSize, string> = {
  xs: 'h-7 w-7 p-0',
  sm: 'h-8 w-8 p-0',
  md: 'h-10 w-10 p-0',
  lg: 'h-11 w-11 p-0',
}

export const tones: Record<GrButtonTone, GrButtonToneTokens> = {
  primary: {
    solidBackground: 'var(--gr-button-primary-bg,var(--gr-primary))',
    solidBackgroundHover: 'var(--gr-button-primary-bg-hover,var(--gr-primary-hover))',
    solidBackgroundActive: 'var(--gr-button-primary-bg-active,var(--gr-primary-active))',
    solidForeground: 'var(--gr-button-primary-fg,var(--gr-primary-fg))',
    accentText: 'var(--gr-accent-fg)',
    softBackground: 'var(--gr-button-primary-soft-bg)',
    softBackgroundHover: 'var(--gr-button-primary-soft-bg-hover)',
    softBackgroundActive: 'var(--gr-button-primary-soft-bg-active)',
    softForeground: 'var(--gr-accent-fg)',
    border: 'var(--gr-primary)',
    borderHover: 'var(--gr-primary-hover)',
    borderActive: 'var(--gr-primary-active)',
  },
  neutral: {
    solidBackground: 'var(--gr-secondary)',
    solidBackgroundHover: 'var(--gr-secondary-hover)',
    solidBackgroundActive: 'var(--gr-secondary-active)',
    solidForeground: 'var(--gr-secondary-fg)',
    accentText: 'var(--gr-fg)',
    softBackground: 'var(--gr-secondary)',
    softBackgroundHover: 'var(--gr-secondary-hover)',
    softBackgroundActive: 'var(--gr-secondary-active)',
    softForeground: 'var(--gr-secondary-fg)',
    border: 'var(--gr-brd)',
    borderHover: 'var(--gr-brd-hover,var(--gr-brd))',
    borderActive: 'var(--gr-brd-active,var(--gr-brd))',
  },
  success: {
    solidBackground: 'var(--gr-button-success-bg,var(--gr-success))',
    solidBackgroundHover: 'var(--gr-button-success-bg-hover,var(--gr-success-hover))',
    solidBackgroundActive: 'var(--gr-button-success-bg-active,var(--gr-success-active))',
    solidForeground: 'var(--gr-button-success-fg,var(--gr-success-fg,var(--gr-fg)))',
    accentText: 'var(--gr-success-text,var(--gr-success))',
    softBackground: 'var(--gr-button-success-soft-bg)',
    softBackgroundHover: 'var(--gr-button-success-soft-bg-hover)',
    softBackgroundActive: 'var(--gr-button-success-soft-bg-active)',
    softForeground: 'var(--gr-success-text,var(--gr-success))',
    border: 'var(--gr-success)',
    borderHover: 'var(--gr-success-hover)',
    borderActive: 'var(--gr-success-active)',
  },
  warning: {
    solidBackground: 'var(--gr-button-warning-bg,var(--gr-warning))',
    solidBackgroundHover: 'var(--gr-button-warning-bg-hover,var(--gr-warning-hover))',
    solidBackgroundActive: 'var(--gr-button-warning-bg-active,var(--gr-warning-active))',
    solidForeground: 'var(--gr-button-warning-fg,var(--gr-warning-fg,var(--gr-fg)))',
    accentText: 'var(--gr-warning-text,var(--gr-warning))',
    softBackground: 'var(--gr-button-warning-soft-bg)',
    softBackgroundHover: 'var(--gr-button-warning-soft-bg-hover)',
    softBackgroundActive: 'var(--gr-button-warning-soft-bg-active)',
    softForeground: 'var(--gr-warning-text,var(--gr-warning))',
    border: 'var(--gr-warning)',
    borderHover: 'var(--gr-warning-hover)',
    borderActive: 'var(--gr-warning-active)',
  },
  danger: {
    solidBackground: 'var(--gr-button-danger-bg,var(--gr-danger))',
    solidBackgroundHover: 'var(--gr-button-danger-bg-hover,var(--gr-danger-hover))',
    solidBackgroundActive: 'var(--gr-button-danger-bg-active,var(--gr-danger-active))',
    solidForeground: 'var(--gr-button-danger-fg,var(--gr-danger-fg,var(--gr-fg)))',
    accentText: 'var(--gr-danger-text,var(--gr-danger))',
    softBackground: 'var(--gr-button-danger-soft-bg)',
    softBackgroundHover: 'var(--gr-button-danger-soft-bg-hover)',
    softBackgroundActive: 'var(--gr-button-danger-soft-bg-active)',
    softForeground: 'var(--gr-danger-text,var(--gr-danger))',
    border: 'var(--gr-danger)',
    borderHover: 'var(--gr-danger-hover)',
    borderActive: 'var(--gr-danger-active)',
  },
  info: {
    solidBackground: 'var(--gr-button-info-bg,var(--gr-info))',
    solidBackgroundHover: 'var(--gr-button-info-bg-hover,var(--gr-info-hover))',
    solidBackgroundActive: 'var(--gr-button-info-bg-active,var(--gr-info-active))',
    solidForeground: 'var(--gr-button-info-fg,var(--gr-info-fg,var(--gr-fg)))',
    accentText: 'var(--gr-info-text,var(--gr-info))',
    softBackground: 'var(--gr-button-info-soft-bg)',
    softBackgroundHover: 'var(--gr-button-info-soft-bg-hover)',
    softBackgroundActive: 'var(--gr-button-info-soft-bg-active)',
    softForeground: 'var(--gr-info-text,var(--gr-info))',
    border: 'var(--gr-info)',
    borderHover: 'var(--gr-info-hover)',
    borderActive: 'var(--gr-info-active)',
  },
  slate: {
    solidBackground: 'var(--gr-button-slate-bg,var(--gr-slate))',
    solidBackgroundHover: 'var(--gr-button-slate-bg-hover,var(--gr-slate-hover))',
    solidBackgroundActive: 'var(--gr-button-slate-bg-active,var(--gr-slate-active))',
    solidForeground: 'var(--gr-button-slate-fg,var(--gr-slate-fg,var(--gr-fg)))',
    accentText: 'var(--gr-slate-text,var(--gr-slate))',
    softBackground: 'var(--gr-button-slate-soft-bg)',
    softBackgroundHover: 'var(--gr-button-slate-soft-bg-hover)',
    softBackgroundActive: 'var(--gr-button-slate-soft-bg-active)',
    softForeground: 'var(--gr-slate-text,var(--gr-slate))',
    border: 'var(--gr-slate)',
    borderHover: 'var(--gr-slate-hover)',
    borderActive: 'var(--gr-slate-active)',
  },
  azure: {
    solidBackground: 'var(--gr-button-azure-bg,var(--gr-azure))',
    solidBackgroundHover: 'var(--gr-button-azure-bg-hover,var(--gr-azure-hover))',
    solidBackgroundActive: 'var(--gr-button-azure-bg-active,var(--gr-azure-active))',
    solidForeground: 'var(--gr-button-azure-fg,var(--gr-azure-fg,var(--gr-fg)))',
    accentText: 'var(--gr-azure-text,var(--gr-azure))',
    softBackground: 'var(--gr-button-azure-soft-bg)',
    softBackgroundHover: 'var(--gr-button-azure-soft-bg-hover)',
    softBackgroundActive: 'var(--gr-button-azure-soft-bg-active)',
    softForeground: 'var(--gr-azure-text,var(--gr-azure))',
    border: 'var(--gr-azure)',
    borderHover: 'var(--gr-azure-hover)',
    borderActive: 'var(--gr-azure-active)',
  },
}

function withVar(token: string): string {
  return `[${token}]`
}

export function variantClass(variant: GrButtonVariant, tone: GrButtonTone): string {
  const tokens = tones[tone]

  if (variant === 'primary') {
    return [
      `bg-${withVar(tokens.solidBackground)}`,
      `text-${withVar(tokens.solidForeground)}`,
      `border border-${withVar(tokens.solidBackground)}`,
      `hover:bg-${withVar(tokens.solidBackgroundHover)}`,
      `hover:border-${withVar(tokens.solidBackgroundHover)}`,
      `active:bg-${withVar(tokens.solidBackgroundActive)}`,
      `hover:active:bg-${withVar(tokens.solidBackgroundActive)}`,
      `active:border-${withVar(tokens.solidBackgroundActive)}`,
      `hover:active:border-${withVar(tokens.solidBackgroundActive)}`,
    ].join(' ')
  }

  if (variant === 'secondary') {
    return [
      `bg-${withVar(tokens.softBackground)}`,
      `text-${withVar(tokens.softForeground)}`,
      `border border-${withVar(tokens.border)}`,
      `hover:bg-${withVar(tokens.softBackgroundHover)}`,
      `hover:border-${withVar(tokens.borderHover)}`,
      `active:bg-${withVar(tokens.softBackgroundActive)}`,
      `hover:active:bg-${withVar(tokens.softBackgroundActive)}`,
      `active:border-${withVar(tokens.borderActive)}`,
      `hover:active:border-${withVar(tokens.borderActive)}`,
    ].join(' ')
  }

  if (variant === 'outline') {
    return [
      'bg-transparent',
      `text-${withVar(tokens.accentText)}`,
      `border border-${withVar(tokens.border)}`,
      `hover:bg-${withVar(tokens.softBackgroundHover)}`,
      `hover:border-${withVar(tokens.borderHover)}`,
      `active:bg-${withVar(tokens.softBackgroundActive)}`,
      `hover:active:bg-${withVar(tokens.softBackgroundActive)}`,
      `active:border-${withVar(tokens.borderActive)}`,
      `hover:active:border-${withVar(tokens.borderActive)}`,
    ].join(' ')
  }

  if (variant === 'ghost') {
    return [
      'bg-transparent',
      `text-${withVar(tokens.accentText)}`,
      `hover:bg-${withVar(tokens.softBackgroundHover)}`,
      `active:bg-${withVar(tokens.softBackgroundActive)}`,
      `hover:active:bg-${withVar(tokens.softBackgroundActive)}`,
    ].join(' ')
  }

  return [
    'bg-transparent',
    `text-${withVar(tokens.accentText)}`,
    'border border-transparent',
    `hover:bg-${withVar(tokens.softBackgroundHover)}`,
    `hover:border-${withVar(tokens.borderHover)}`,
    `active:bg-${withVar(tokens.softBackgroundActive)}`,
    `hover:active:bg-${withVar(tokens.softBackgroundActive)}`,
    `active:border-${withVar(tokens.borderActive)}`,
    `hover:active:border-${withVar(tokens.borderActive)}`,
  ].join(' ')
}

export function grButtonClass(options: GrButtonClassOptions): string {
  return [
    options.square ? squareSizes[options.size] : sizes[options.size],
    variantClass(options.variant, options.tone),
  ].join(' ')
}
