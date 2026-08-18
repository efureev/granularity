import type { GrComponentSize } from '../shared/sizes'

import type { GrTone } from '../shared/tones'

export type GrBadgeTone = GrTone
export type GrBadgeSize = GrComponentSize
export type GrBadgeRadius = 'square' | 'semi' | 'round'
export const sizeClassBySize: Record<GrBadgeSize, string> = {
  xs: 'px-2 py-0.4 text-[length:var(--gr-control-text-2xs)]',
  sm: 'px-2.5 py-0.5 text-[length:var(--gr-control-text-xs)]',
  md: 'px-3 py-1 text-[length:var(--gr-control-text-sm)]',
  lg: 'px-3.5 py-1.5 text-[length:var(--gr-control-text-md)]',
}
export const semiRadiusClassBySize: Record<GrBadgeSize, string> = {
  xs: 'rounded-[var(--gr-badge-semi-radius-xs,3px)]',
  sm: 'rounded-[var(--gr-badge-semi-radius-sm,3px)]',
  md: 'rounded-[var(--gr-badge-semi-radius-md,5px)]',
  lg: 'rounded-[var(--gr-badge-semi-radius-lg,7px)]',
}
export const lightToneClassByTone: Record<GrBadgeTone, string> = {
  neutral: 'bg-[var(--gr-muted)] text-[var(--gr-fg)] border-[var(--gr-brd)]',
  primary:
    'bg-[var(--gr-accent)] text-[var(--gr-accent-fg)] border-[color-mix(in_srgb,var(--gr-primary)_30%,var(--gr-accent))]',
  // Текст на тонированной подложке — только `-text`, никогда не насыщенный тон:
  // `--gr-success` на `--gr-success-light` даёт 2.24:1, `-text` — 6.78:1.
  // slate/azure ниже уже были сделаны правильно.
  success: 'bg-[var(--gr-success-light)] text-[var(--gr-success-text)] border-[color-mix(in_srgb,var(--gr-success)_30%,var(--gr-success-light))]',
  warning: 'bg-[var(--gr-warning-light)] text-[var(--gr-warning-text)] border-[color-mix(in_srgb,var(--gr-warning)_30%,var(--gr-warning-light))]',
  danger: 'bg-[var(--gr-danger-light)] text-[var(--gr-danger-text)] border-[color-mix(in_srgb,var(--gr-danger)_30%,var(--gr-danger-light))]',
  info: 'bg-[var(--gr-info-light)] text-[var(--gr-info-text)] border-[color-mix(in_srgb,var(--gr-info)_30%,var(--gr-info-light))]',
  slate: 'bg-[var(--gr-slate-light)] text-[var(--gr-slate-text)] border-[color-mix(in_srgb,var(--gr-slate)_30%,var(--gr-slate-light))]',
  azure: 'bg-[var(--gr-azure-light)] text-[var(--gr-azure-text)] border-[color-mix(in_srgb,var(--gr-azure)_30%,var(--gr-azure-light))]',
}
/**
 * Заливка filled-бейджа идёт через покомпонентный слой `--gr-badge-{tone}-*`, а
 * не напрямую из роли тона, потому что нужный вес у тем разный.
 *
 * В светлой теме `--gr-{tone}` — это яркая заливка под **тёмный** текст (`-fg`
 * там обязан быть тёмным: белый на `--gr-success` даёт 2.54:1), и filled-бейдж
 * читался как тяжёлая почти чёрная плашка. Слой уводит его на `-solid`/`-solid-fg`
 * — заливку кнопочного веса под светлый текст, ту же, что у solid-кнопок.
 * В тёмной теме пастельная заливка с тёмным текстом — штатная конвенция, и слой
 * оставляет прежние роли. Значения — `themes/{light,dark}.css`.
 */
export const darkToneClassByTone: Record<GrBadgeTone, string> = {
  // Нейтральный вес — инверсия страницы, а не тон: `-solid`-роли у него нет.
  neutral: 'bg-[var(--gr-badge-neutral-bg,var(--gr-fg))] text-[var(--gr-badge-neutral-fg,var(--gr-bg))] border-[color-mix(in_srgb,var(--gr-fg)_35%,var(--gr-brd))]',
  primary: 'bg-[var(--gr-badge-primary-bg,var(--gr-primary-solid))] text-[var(--gr-badge-primary-fg,var(--gr-primary-solid-fg))] border-[var(--gr-badge-primary-bg,var(--gr-primary-solid))]',
  success: 'bg-[var(--gr-badge-success-bg,var(--gr-success-solid))] text-[var(--gr-badge-success-fg,var(--gr-success-solid-fg))] border-[var(--gr-badge-success-bg,var(--gr-success-solid))]',
  warning: 'bg-[var(--gr-badge-warning-bg,var(--gr-warning-solid))] text-[var(--gr-badge-warning-fg,var(--gr-warning-solid-fg))] border-[var(--gr-badge-warning-bg,var(--gr-warning-solid))]',
  danger: 'bg-[var(--gr-badge-danger-bg,var(--gr-danger-solid))] text-[var(--gr-badge-danger-fg,var(--gr-danger-solid-fg))] border-[var(--gr-badge-danger-bg,var(--gr-danger-solid))]',
  info: 'bg-[var(--gr-badge-info-bg,var(--gr-info-solid))] text-[var(--gr-badge-info-fg,var(--gr-info-solid-fg))] border-[var(--gr-badge-info-bg,var(--gr-info-solid))]',
  slate: 'bg-[var(--gr-badge-slate-bg,var(--gr-slate-solid))] text-[var(--gr-badge-slate-fg,var(--gr-slate-solid-fg))] border-[var(--gr-badge-slate-bg,var(--gr-slate-solid))]',
  azure: 'bg-[var(--gr-badge-azure-bg,var(--gr-azure-solid))] text-[var(--gr-badge-azure-fg,var(--gr-azure-solid-fg))] border-[var(--gr-badge-azure-bg,var(--gr-azure-solid))]',
}
/**
 * Экспортируются ради `GrChip`: у чипа те же три радиуса и та же палитра тонов,
 * и копия этих двух ветвлений разошлась бы с оригиналом молча. Свои у чипа
 * только размеры — он интерактивен, и цель нажатия у него не метки, а контрола.
 */
export function radiusClass(radius: GrBadgeRadius, size: GrBadgeSize): string {
  if (radius === 'square') return 'rounded-[var(--gr-radius-none)]'
  if (radius === 'semi') return semiRadiusClassBySize[size]
  return 'rounded-[var(--gr-radius-full)]'
}
export function toneClass(tone: GrBadgeTone, dark: boolean): string {
  return dark ? darkToneClassByTone[tone] : lightToneClassByTone[tone]
}
export function grBadgeClass(options: { tone: GrBadgeTone, dark: boolean, size: GrBadgeSize, radius: GrBadgeRadius }): string {
  return [
    radiusClass(options.radius, options.size),
    sizeClassBySize[options.size],
    toneClass(options.tone, options.dark),
  ].join(' ')
}
