import type { GrTone } from '../shared/tones'

export type GrBadgeTone = GrTone
export type GrBadgeSize = 'xs' | 'sm' | 'md' | 'lg'
export type GrBadgeRadius = 'square' | 'semi' | 'round'
export const sizeClassBySize: Record<GrBadgeSize, string> = {
  xs: 'px-2 py-0.4 text-[11px]',
  sm: 'px-2.5 py-0.5 text-[12px]',
  md: 'px-3 py-1 text-[13px]',
  lg: 'px-3.5 py-1.5 text-[14px]',
}
export const semiRadiusClassBySize: Record<GrBadgeSize, string> = {
  xs: 'rounded-[3px]',
  sm: 'rounded-[3px]',
  md: 'rounded-[5px]',
  lg: 'rounded-[7px]',
}
export const lightToneClassByTone: Record<GrBadgeTone, string> = {
  neutral: 'bg-[var(--gr-muted)] text-[var(--gr-fg)] border-[var(--gr-brd)]',
  primary:
    'bg-[var(--gr-accent)] text-[var(--gr-accent-fg)] border-[color-mix(in_srgb,var(--gr-primary)_30%,var(--gr-accent))]',
  success: 'bg-[var(--gr-success-light)] text-[var(--gr-success)] border-[color-mix(in_srgb,var(--gr-success)_30%,var(--gr-success-light))]',
  warning: 'bg-[var(--gr-warning-light)] text-[var(--gr-warning)] border-[color-mix(in_srgb,var(--gr-warning)_30%,var(--gr-warning-light))]',
  danger: 'bg-[var(--gr-danger-light)] text-[var(--gr-danger)] border-[color-mix(in_srgb,var(--gr-danger)_30%,var(--gr-danger-light))]',
  info: 'bg-[var(--gr-info-light)] text-[var(--gr-info)] border-[color-mix(in_srgb,var(--gr-info)_30%,var(--gr-info-light))]',
  slate: 'bg-[var(--gr-slate-light)] text-[var(--gr-slate-text)] border-[color-mix(in_srgb,var(--gr-slate)_30%,var(--gr-slate-light))]',
  azure: 'bg-[var(--gr-azure-light)] text-[var(--gr-azure-text)] border-[color-mix(in_srgb,var(--gr-azure)_30%,var(--gr-azure-light))]',
}
export const darkToneClassByTone: Record<GrBadgeTone, string> = {
  neutral: 'bg-[var(--gr-fg)] text-[var(--gr-bg)] border-[color-mix(in_srgb,var(--gr-fg)_35%,var(--gr-brd))]',
  primary: 'bg-[var(--gr-primary)] text-[var(--gr-primary-fg)] border-[var(--gr-primary)]',
  success: 'bg-[var(--gr-success)] text-white border-[var(--gr-success)]',
  warning: 'bg-[var(--gr-warning)] text-white border-[var(--gr-warning)]',
  danger: 'bg-[var(--gr-danger)] text-white border-[var(--gr-danger)]',
  info: 'bg-[var(--gr-info)] text-white border-[var(--gr-info)]',
  slate: 'bg-[var(--gr-slate)] text-[var(--gr-slate-fg)] border-[var(--gr-slate)]',
  azure: 'bg-[var(--gr-azure)] text-[var(--gr-azure-fg)] border-[var(--gr-azure)]',
}
function radiusClass(radius: GrBadgeRadius, size: GrBadgeSize): string {
  if (radius === 'square') return 'rounded-[var(--gr-radius-none)]'
  if (radius === 'semi') return semiRadiusClassBySize[size]
  return 'rounded-full'
}
function toneClass(tone: GrBadgeTone, dark: boolean): string {
  return dark ? darkToneClassByTone[tone] : lightToneClassByTone[tone]
}
export function grBadgeClass(options: { tone: GrBadgeTone, dark: boolean, size: GrBadgeSize, radius: GrBadgeRadius }): string {
  return [
    radiusClass(options.radius, options.size),
    sizeClassBySize[options.size],
    toneClass(options.tone, options.dark),
  ].join(' ')
}
