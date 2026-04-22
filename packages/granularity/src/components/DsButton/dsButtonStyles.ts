export type DsButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'ghost-border'
export type DsButtonTone = 'primary' | 'neutral' | 'success' | 'warning' | 'danger' | 'info' | 'slate' | 'azure'
export type DsButtonSize = 'xs' | 'sm' | 'md' | 'lg'

export type DsButtonClassOptions = {
  variant: DsButtonVariant
  tone: DsButtonTone
  size: DsButtonSize
  square: boolean
}

export type DsButtonToneTokens = {
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
  'inline-flex items-center justify-center gap-2 select-none whitespace-nowrap rounded-md transition-colors duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] disabled:opacity-50 disabled:cursor-not-allowed'

export const dsButtonBaseClass = base

export const sizes: Record<DsButtonSize, string> = {
  xs: 'h-7 text-xs px-2.5',
  sm: 'h-8 text-sm px-3',
  md: 'h-10 text-sm px-4',
  lg: 'h-11 text-base px-5',
}

export const squareSizes: Record<DsButtonSize, string> = {
  xs: 'h-7 w-7 p-0',
  sm: 'h-8 w-8 p-0',
  md: 'h-10 w-10 p-0',
  lg: 'h-11 w-11 p-0',
}

export const tones: Record<DsButtonTone, DsButtonToneTokens> = {
  primary: {
    solidBackground: 'var(--ds-button-primary-bg,var(--primary))',
    solidBackgroundHover: 'var(--ds-button-primary-bg-hover,var(--primary-hover))',
    solidBackgroundActive: 'var(--ds-button-primary-bg-active,var(--primary-active))',
    solidForeground: 'var(--ds-button-primary-fg,var(--primary-fg))',
    accentText: 'var(--accent-fg)',
    softBackground: 'var(--ds-button-primary-soft-bg)',
    softBackgroundHover: 'var(--ds-button-primary-soft-bg-hover)',
    softBackgroundActive: 'var(--ds-button-primary-soft-bg-active)',
    softForeground: 'var(--accent-fg)',
    border: 'var(--primary)',
    borderHover: 'var(--primary-hover)',
    borderActive: 'var(--primary-active)',
  },
  neutral: {
    solidBackground: 'var(--secondary)',
    solidBackgroundHover: 'var(--secondary-hover)',
    solidBackgroundActive: 'var(--secondary-active)',
    solidForeground: 'var(--secondary-fg)',
    accentText: 'var(--fg)',
    softBackground: 'var(--secondary)',
    softBackgroundHover: 'var(--secondary-hover)',
    softBackgroundActive: 'var(--secondary-active)',
    softForeground: 'var(--secondary-fg)',
    border: 'var(--brd)',
    borderHover: 'var(--brd-hover,var(--brd))',
    borderActive: 'var(--brd-active,var(--brd))',
  },
  success: {
    solidBackground: 'var(--ds-button-success-bg,var(--ds-success))',
    solidBackgroundHover: 'var(--ds-button-success-bg-hover,var(--ds-success-hover))',
    solidBackgroundActive: 'var(--ds-button-success-bg-active,var(--ds-success-active))',
    solidForeground: 'var(--ds-button-success-fg,var(--ds-success-fg,var(--fg)))',
    accentText: 'var(--ds-success-text,var(--ds-success))',
    softBackground: 'var(--ds-button-success-soft-bg)',
    softBackgroundHover: 'var(--ds-button-success-soft-bg-hover)',
    softBackgroundActive: 'var(--ds-button-success-soft-bg-active)',
    softForeground: 'var(--ds-success-text,var(--ds-success))',
    border: 'var(--ds-success)',
    borderHover: 'var(--ds-success-hover)',
    borderActive: 'var(--ds-success-active)',
  },
  warning: {
    solidBackground: 'var(--ds-button-warning-bg,var(--ds-warning))',
    solidBackgroundHover: 'var(--ds-button-warning-bg-hover,var(--ds-warning-hover))',
    solidBackgroundActive: 'var(--ds-button-warning-bg-active,var(--ds-warning-active))',
    solidForeground: 'var(--ds-button-warning-fg,var(--ds-warning-fg,var(--fg)))',
    accentText: 'var(--ds-warning-text,var(--ds-warning))',
    softBackground: 'var(--ds-button-warning-soft-bg)',
    softBackgroundHover: 'var(--ds-button-warning-soft-bg-hover)',
    softBackgroundActive: 'var(--ds-button-warning-soft-bg-active)',
    softForeground: 'var(--ds-warning-text,var(--ds-warning))',
    border: 'var(--ds-warning)',
    borderHover: 'var(--ds-warning-hover)',
    borderActive: 'var(--ds-warning-active)',
  },
  danger: {
    solidBackground: 'var(--ds-button-danger-bg,var(--ds-danger))',
    solidBackgroundHover: 'var(--ds-button-danger-bg-hover,var(--ds-danger-hover))',
    solidBackgroundActive: 'var(--ds-button-danger-bg-active,var(--ds-danger-active))',
    solidForeground: 'var(--ds-button-danger-fg,var(--ds-danger-fg,var(--fg)))',
    accentText: 'var(--ds-danger-text,var(--ds-danger))',
    softBackground: 'var(--ds-button-danger-soft-bg)',
    softBackgroundHover: 'var(--ds-button-danger-soft-bg-hover)',
    softBackgroundActive: 'var(--ds-button-danger-soft-bg-active)',
    softForeground: 'var(--ds-danger-text,var(--ds-danger))',
    border: 'var(--ds-danger)',
    borderHover: 'var(--ds-danger-hover)',
    borderActive: 'var(--ds-danger-active)',
  },
  info: {
    solidBackground: 'var(--ds-button-info-bg,var(--ds-info))',
    solidBackgroundHover: 'var(--ds-button-info-bg-hover,var(--ds-info-hover))',
    solidBackgroundActive: 'var(--ds-button-info-bg-active,var(--ds-info-active))',
    solidForeground: 'var(--ds-button-info-fg,var(--ds-info-fg,var(--fg)))',
    accentText: 'var(--ds-info-text,var(--ds-info))',
    softBackground: 'var(--ds-button-info-soft-bg)',
    softBackgroundHover: 'var(--ds-button-info-soft-bg-hover)',
    softBackgroundActive: 'var(--ds-button-info-soft-bg-active)',
    softForeground: 'var(--ds-info-text,var(--ds-info))',
    border: 'var(--ds-info)',
    borderHover: 'var(--ds-info-hover)',
    borderActive: 'var(--ds-info-active)',
  },
  slate: {
    solidBackground: 'var(--ds-button-slate-bg,var(--ds-slate))',
    solidBackgroundHover: 'var(--ds-button-slate-bg-hover,var(--ds-slate-hover))',
    solidBackgroundActive: 'var(--ds-button-slate-bg-active,var(--ds-slate-active))',
    solidForeground: 'var(--ds-button-slate-fg,var(--ds-slate-fg,var(--fg)))',
    accentText: 'var(--ds-slate-text,var(--ds-slate))',
    softBackground: 'var(--ds-button-slate-soft-bg)',
    softBackgroundHover: 'var(--ds-button-slate-soft-bg-hover)',
    softBackgroundActive: 'var(--ds-button-slate-soft-bg-active)',
    softForeground: 'var(--ds-slate-text,var(--ds-slate))',
    border: 'var(--ds-slate)',
    borderHover: 'var(--ds-slate-hover)',
    borderActive: 'var(--ds-slate-active)',
  },
  azure: {
    solidBackground: 'var(--ds-button-azure-bg,var(--ds-azure))',
    solidBackgroundHover: 'var(--ds-button-azure-bg-hover,var(--ds-azure-hover))',
    solidBackgroundActive: 'var(--ds-button-azure-bg-active,var(--ds-azure-active))',
    solidForeground: 'var(--ds-button-azure-fg,var(--ds-azure-fg,var(--fg)))',
    accentText: 'var(--ds-azure-text,var(--ds-azure))',
    softBackground: 'var(--ds-button-azure-soft-bg)',
    softBackgroundHover: 'var(--ds-button-azure-soft-bg-hover)',
    softBackgroundActive: 'var(--ds-button-azure-soft-bg-active)',
    softForeground: 'var(--ds-azure-text,var(--ds-azure))',
    border: 'var(--ds-azure)',
    borderHover: 'var(--ds-azure-hover)',
    borderActive: 'var(--ds-azure-active)',
  },
}

function withVar(token: string): string {
  return `[${token}]`
}

export function variantClass(variant: DsButtonVariant, tone: DsButtonTone): string {
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

export function dsButtonClass(options: DsButtonClassOptions): string {
  return [
    options.square ? squareSizes[options.size] : sizes[options.size],
    variantClass(options.variant, options.tone),
  ].join(' ')
}
