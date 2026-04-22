export type DsBadgeTone = 'neutral' | 'primary' | 'success' | 'warning' | 'danger' | 'info' | 'slate' | 'azure'
export type DsBadgeSize = 'sm' | 'md' | 'lg'
export type DsBadgeRadius = 'square' | 'semi' | 'round'
export const sizeClassBySize: Record<DsBadgeSize, string> = {
  sm: 'px-2 py-0.4 text-[11px]',
  md: 'px-2.5 py-0.5 text-[12px]',
  lg: 'px-3 py-1 text-[13px]',
}
export const semiRadiusClassBySize: Record<DsBadgeSize, string> = {
  sm: 'rounded-[3px]',
  md: 'rounded-[3px]',
  lg: 'rounded-[5px]',
}
export const lightToneClassByTone: Record<DsBadgeTone, string> = {
  neutral: 'bg-[var(--muted)] text-[var(--fg)] border-[var(--brd)]',
  primary:
    'bg-[var(--accent)] text-[var(--accent-fg)] border-[color-mix(in_srgb,var(--primary)_30%,var(--accent))]',
  success: 'bg-[var(--ds-success-light)] text-[var(--ds-success)] border-[color-mix(in_srgb,var(--ds-success)_30%,var(--ds-success-light))]',
  warning: 'bg-[var(--ds-warning-light)] text-[var(--ds-warning)] border-[color-mix(in_srgb,var(--ds-warning)_30%,var(--ds-warning-light))]',
  danger: 'bg-[var(--ds-danger-light)] text-[var(--ds-danger)] border-[color-mix(in_srgb,var(--ds-danger)_30%,var(--ds-danger-light))]',
  info: 'bg-[var(--ds-info-light)] text-[var(--ds-info)] border-[color-mix(in_srgb,var(--ds-info)_30%,var(--ds-info-light))]',
  slate: 'bg-[var(--ds-slate-light)] text-[var(--ds-slate-text)] border-[color-mix(in_srgb,var(--ds-slate)_30%,var(--ds-slate-light))]',
  azure: 'bg-[var(--ds-azure-light)] text-[var(--ds-azure-text)] border-[color-mix(in_srgb,var(--ds-azure)_30%,var(--ds-azure-light))]',
}
export const darkToneClassByTone: Record<DsBadgeTone, string> = {
  neutral: 'bg-[var(--fg)] text-[var(--bg)] border-[color-mix(in_srgb,var(--fg)_35%,var(--brd))]',
  primary: 'bg-[var(--primary)] text-[var(--primary-fg)] border-[var(--primary)]',
  success: 'bg-[var(--ds-success)] text-white border-[var(--ds-success)]',
  warning: 'bg-[var(--ds-warning)] text-white border-[var(--ds-warning)]',
  danger: 'bg-[var(--ds-danger)] text-white border-[var(--ds-danger)]',
  info: 'bg-[var(--ds-info)] text-white border-[var(--ds-info)]',
  slate: 'bg-[var(--ds-slate)] text-[var(--ds-slate-fg)] border-[var(--ds-slate)]',
  azure: 'bg-[var(--ds-azure)] text-[var(--ds-azure-fg)] border-[var(--ds-azure)]',
}
function radiusClass(radius: DsBadgeRadius, size: DsBadgeSize): string {
  if (radius === 'square') return 'rounded-[var(--ds-radius-none)]'
  if (radius === 'semi') return semiRadiusClassBySize[size]
  return 'rounded-full'
}
function toneClass(tone: DsBadgeTone, dark: boolean): string {
  return dark ? darkToneClassByTone[tone] : lightToneClassByTone[tone]
}
export function dsBadgeClass(options: { tone: DsBadgeTone, dark: boolean, size: DsBadgeSize, radius: DsBadgeRadius }): string {
  return [
    radiusClass(options.radius, options.size),
    sizeClassBySize[options.size],
    toneClass(options.tone, options.dark),
  ].join(' ')
}
