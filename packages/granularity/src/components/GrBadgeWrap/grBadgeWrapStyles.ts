import type { GrTone } from '../shared/tones'

export type GrBadgeWrapTone = GrTone

/** Угол, в котором висит бейдж. */
export const GR_BADGE_WRAP_PLACEMENTS = ['top-right', 'top-left', 'bottom-right', 'bottom-left'] as const
export type GrBadgeWrapPlacement = typeof GR_BADGE_WRAP_PLACEMENTS[number]

export const rootClass = 'relative inline-flex'

/**
 * Смещение бейджа — точки кастомизации: подвинуть его можно темой или инлайном,
 * не переопределяя классы снаружи. Дефолты повторяют прежние `-top-2 -right-2`.
 */
export const placementClass: Record<GrBadgeWrapPlacement, string> = {
  'top-right': 'top-[var(--gr-badge-wrap-offset-y,-0.5rem)] right-[var(--gr-badge-wrap-offset-x,-0.5rem)]',
  'top-left': 'top-[var(--gr-badge-wrap-offset-y,-0.5rem)] left-[var(--gr-badge-wrap-offset-x,-0.5rem)]',
  'bottom-right': 'bottom-[var(--gr-badge-wrap-offset-y,-0.5rem)] right-[var(--gr-badge-wrap-offset-x,-0.5rem)]',
  'bottom-left': 'bottom-[var(--gr-badge-wrap-offset-y,-0.5rem)] left-[var(--gr-badge-wrap-offset-x,-0.5rem)]',
}

/** У точки смещение меньше: она вдвое мельче счётчика. */
export const dotPlacementClass: Record<GrBadgeWrapPlacement, string> = {
  'top-right': 'top-[var(--gr-badge-wrap-offset-y,-0.25rem)] right-[var(--gr-badge-wrap-offset-x,-0.25rem)]',
  'top-left': 'top-[var(--gr-badge-wrap-offset-y,-0.25rem)] left-[var(--gr-badge-wrap-offset-x,-0.25rem)]',
  'bottom-right': 'bottom-[var(--gr-badge-wrap-offset-y,-0.25rem)] right-[var(--gr-badge-wrap-offset-x,-0.25rem)]',
  'bottom-left': 'bottom-[var(--gr-badge-wrap-offset-y,-0.25rem)] left-[var(--gr-badge-wrap-offset-x,-0.25rem)]',
}

export const dotBaseClass = 'absolute h-2 w-2 rounded-[var(--gr-radius-full)]'

export const countBaseClass = 'absolute min-w-5 h-5 px-1 rounded-[var(--gr-radius-full)] text-[length:var(--gr-text-2xs)] font-700 inline-flex items-center justify-center'

/**
 * Заливка тоном: та же полярность, что у тёмного варианта `GrBadge` — текст
 * берётся из `-fg`, а не из белого литерала, иначе он не переживает смену темы.
 * Карта своя, а не импорт из `GrBadge`: чужая карта означала бы зависимость от
 * компонента и его CSS ради двух классов.
 */
export const toneClass: Record<GrBadgeWrapTone, string> = {
  neutral: 'bg-[var(--gr-fg)] text-[var(--gr-bg)]',
  primary: 'bg-[var(--gr-primary)] text-[var(--gr-primary-fg)]',
  success: 'bg-[var(--gr-success)] text-[var(--gr-success-fg)]',
  warning: 'bg-[var(--gr-warning)] text-[var(--gr-warning-fg)]',
  danger: 'bg-[var(--gr-danger)] text-[var(--gr-danger-fg)]',
  info: 'bg-[var(--gr-info)] text-[var(--gr-info-fg)]',
  slate: 'bg-[var(--gr-slate)] text-[var(--gr-slate-fg)]',
  azure: 'bg-[var(--gr-azure)] text-[var(--gr-azure-fg)]',
}

/**
 * Видимый текст счётчика: число больше порога сворачивается в «{max}+», иначе
 * бейдж расползается и ломает соседей. Озвучивается при этом настоящее
 * значение — «99 плюс» пользователю ничего не говорит.
 */
export function formatBadgeValue(value: string | number, max?: number): string {
  if (max === undefined || typeof value !== 'number') return String(value)
  return value > max ? `${max}+` : String(value)
}
