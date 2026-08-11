import type { GrTone } from '../shared/tones'

export type GrTimelineTone = GrTone

/** Плотность вертикальных отступов пункта — та же ось, что `density` у `GrListItem`. */
export const GR_TIMELINE_DENSITIES = ['regular', 'compact'] as const
export type GrTimelineDensity = typeof GR_TIMELINE_DENSITIES[number]

/**
 * `stacked` — одна ось слева; `time` — метка времени отдельной колонкой слева от
 * оси; `alternate` — пункты попеременно по обе стороны центральной оси.
 */
export const GR_TIMELINE_LAYOUTS = ['stacked', 'time', 'alternate'] as const
export type GrTimelineLayout = typeof GR_TIMELINE_LAYOUTS[number]

export const GR_TIMELINE_ORIENTATIONS = ['vertical', 'horizontal'] as const
export type GrTimelineOrientation = typeof GR_TIMELINE_ORIENTATIONS[number]

/** Заполненная точка — событие случилось; полая — запланировано. */
export const GR_TIMELINE_MARKER_VARIANTS = ['filled', 'outlined'] as const
export type GrTimelineMarkerVariant = typeof GR_TIMELINE_MARKER_VARIANTS[number]

/**
 * Отступ **под** пунктом, а не `gap` контейнера: отрезок оси растёт до низа
 * пункта, и промежуток, которого пункт не занимает, разорвал бы линию.
 */
export const densityPadding: Record<GrTimelineDensity, string> = {
  regular: 'pb-5',
  compact: 'pb-3',
}

/**
 * Заливка маркера. У тона `neutral` одноимённой роли в палитре нет — его вес
 * это приглушённый текст, поэтому точка красится `--gr-muted-fg`.
 */
export const markerFilledToneClass: Record<GrTimelineTone, string> = {
  neutral: 'bg-[var(--gr-muted-fg)]',
  primary: 'bg-[var(--gr-primary)]',
  success: 'bg-[var(--gr-success)]',
  warning: 'bg-[var(--gr-warning)]',
  danger: 'bg-[var(--gr-danger)]',
  info: 'bg-[var(--gr-info)]',
  slate: 'bg-[var(--gr-slate)]',
  azure: 'bg-[var(--gr-azure)]',
}

/** Полая точка: обводка тоном, середина — фон страницы, чтобы ось не просвечивала. */
export const markerOutlinedToneClass: Record<GrTimelineTone, string> = {
  neutral: 'bg-[var(--gr-bg)] border-[var(--gr-muted-fg)]',
  primary: 'bg-[var(--gr-bg)] border-[var(--gr-primary)]',
  success: 'bg-[var(--gr-bg)] border-[var(--gr-success)]',
  warning: 'bg-[var(--gr-bg)] border-[var(--gr-warning)]',
  danger: 'bg-[var(--gr-bg)] border-[var(--gr-danger)]',
  info: 'bg-[var(--gr-bg)] border-[var(--gr-info)]',
  slate: 'bg-[var(--gr-bg)] border-[var(--gr-slate)]',
  azure: 'bg-[var(--gr-bg)] border-[var(--gr-azure)]',
}

export const markerBaseClass = 'block shrink-0 rounded-[var(--gr-radius-full)]'

export const timeClass = 'text-[length:var(--gr-text-xs)] leading-[var(--gr-leading-normal)] text-[var(--gr-muted-fg)] [font-variant-numeric:tabular-nums]'

export const titleClass = 'text-[length:var(--gr-text-sm)] leading-[var(--gr-leading-normal)] font-600 text-[var(--gr-fg)]'

export const descriptionClass = 'mt-0.5 text-[length:var(--gr-text-sm)] leading-[var(--gr-leading-normal)] text-[var(--gr-muted-fg)]'

export const groupTitleClass = 'text-[length:var(--gr-text-xs)] leading-[var(--gr-leading-normal)] font-600 uppercase tracking-wide text-[var(--gr-muted-fg)]'

export const emptyClass = 'py-6 text-center text-[length:var(--gr-text-sm)] leading-[var(--gr-leading-normal)] text-[var(--gr-muted-fg)]'

export const loadingRowClass = 'flex items-center gap-3 pb-5'

export function grTimelineDensityClass(density: GrTimelineDensity): string {
  return densityPadding[density]
}

export function grTimelineMarkerClass(
  tone: GrTimelineTone,
  variant: GrTimelineMarkerVariant,
): string {
  const toneClass = variant === 'filled'
    ? markerFilledToneClass[tone]
    : markerOutlinedToneClass[tone]

  return `${markerBaseClass} ${toneClass}`
}
