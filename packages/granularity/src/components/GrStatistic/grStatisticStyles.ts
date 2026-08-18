import type { GrComponentSize } from '../shared/sizes'

import type { GrTone } from '../shared/tones'

export type GrStatisticSize = GrComponentSize
export type GrStatisticTone = GrTone
/** Направление динамики показателя. */
export type GrStatisticTrend = 'up' | 'down' | 'flat'

/**
 * Кастомизация через CSS-переменные:
 *
 * - `--gr-statistic-value-color` — цвет значения (по умолчанию — из `tone`).
 * - `--gr-statistic-title-color` — цвет подписи показателя.
 */

export const statisticTitleSizeBySize: Record<GrStatisticSize, string> = {
  xs: 'text-[length:var(--gr-text-2xs)] leading-[var(--gr-leading-2xs)]',
  sm: 'text-[length:var(--gr-text-xs)] leading-[var(--gr-leading-xs)]',
  md: 'text-[length:var(--gr-text-xs)] leading-[var(--gr-leading-xs)]',
  lg: 'text-[length:var(--gr-text-sm)] leading-[var(--gr-leading-sm)]',
}

export const statisticValueSizeBySize: Record<GrStatisticSize, string> = {
  xs: 'text-[length:var(--gr-text-base)] leading-[var(--gr-leading-base)]',
  sm: 'text-[length:var(--gr-text-xl)] leading-[var(--gr-leading-xl)]',
  md: 'text-[length:var(--gr-text-3xl)] leading-[var(--gr-leading-3xl)]',
  lg: 'text-[length:var(--gr-text-4xl)] leading-tight',
}

export const statisticAffixSizeBySize: Record<GrStatisticSize, string> = {
  xs: 'text-[length:var(--gr-text-xs)] leading-[var(--gr-leading-xs)]',
  sm: 'text-[length:var(--gr-text-xs)] leading-[var(--gr-leading-xs)]',
  md: 'text-[length:var(--gr-text-base)] leading-[var(--gr-leading-base)]',
  lg: 'text-[length:var(--gr-text-xl)] leading-[var(--gr-leading-xl)]',
}

/**
 * Кегль приписки — значением токена, а не классом: он уезжает в
 * `--gr-value-suffix-size`, которым `GrValue` и набирает суффикс.
 *
 * Ступень шкалы, а не доля от величины: у плитки шкала размеров своя, и на
 * ступени `md` число крупное (`--gr-text-3xl`), а приписка при нём обязана
 * остаться подписью. Доля дала бы её вровень с числом.
 */
export const statisticAffixSizeVarBySize: Record<GrStatisticSize, string> = {
  xs: 'var(--gr-text-xs)',
  sm: 'var(--gr-text-xs)',
  md: 'var(--gr-text-base)',
  lg: 'var(--gr-text-xl)',
}

// Высота плейсхолдера загрузки повторяет строку значения — блок не «прыгает».
// Значение отдаётся в `GrSkeleton` пропом, поэтому это px, а не класс.
export const statisticPlaceholderHeightBySize: Record<GrStatisticSize, string> = {
  xs: '22px',
  sm: '28px',
  md: '36px',
  lg: '44px',
}

export const statisticTrendSizeBySize: Record<GrStatisticSize, string> = {
  xs: 'text-[length:var(--gr-text-2xs)] leading-[var(--gr-leading-2xs)]',
  sm: 'text-[length:var(--gr-text-xs)] leading-[var(--gr-leading-xs)]',
  md: 'text-[length:var(--gr-text-xs)] leading-[var(--gr-leading-xs)]',
  lg: 'text-[length:var(--gr-text-sm)] leading-[var(--gr-leading-sm)]',
}

// Цвет значения по тону. `neutral` наследует основной цвет текста.
//
// Тона берутся из `-text`, а не из насыщенного `--gr-{tone}`: значение — это
// ТЕКСТ на фоне страницы, а насыщенный тон для этого не предназначен
// (`--gr-success` на `--gr-bg` — 2.2:1, ниже даже послабления 3:1 для крупного
// текста). `-text` — ровно роль «тон как текст».
export const statisticValueClassByTone: Record<GrStatisticTone, string> = {
  neutral: 'text-[var(--gr-statistic-value-color,var(--gr-fg))]',
  primary: 'text-[var(--gr-statistic-value-color,var(--gr-primary))]',
  success: 'text-[var(--gr-statistic-value-color,var(--gr-success-text))]',
  warning: 'text-[var(--gr-statistic-value-color,var(--gr-warning-text))]',
  danger: 'text-[var(--gr-statistic-value-color,var(--gr-danger-text))]',
  info: 'text-[var(--gr-statistic-value-color,var(--gr-info-text))]',
  slate: 'text-[var(--gr-statistic-value-color,var(--gr-slate-text))]',
  azure: 'text-[var(--gr-statistic-value-color,var(--gr-azure-text))]',
}

// Строка динамики: рост — успех, падение — опасность, без изменений — приглушённый.
export const statisticTrendClassByTrend: Record<GrStatisticTrend, string> = {
  up: 'text-[var(--gr-success-text)]',
  down: 'text-[var(--gr-danger-text)]',
  flat: 'text-[var(--gr-muted-fg)]',
}

export const statisticTitleClass = 'font-medium tracking-wide text-[var(--gr-statistic-title-color,var(--gr-muted-fg))]'

export const statisticRootBase = 'flex items-start gap-3 text-left'

/**
 * Показатель-ссылка или показатель-кнопка. Своей заливки не получает: плитка
 * дашборда обычно уже лежит в `GrCard`, и вторая поверхность спорила бы с ней.
 * Видимость интерактивности держат курсор, фокус-кольцо и подсветка подписи.
 */
export const statisticRootInteractiveClass = 'w-full cursor-pointer rounded-[var(--gr-radius-md)] transition-colors hover:bg-[var(--gr-muted)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--gr-ring)]'

export function statisticRootClass(options: { interactive: boolean }): string {
  return [
    statisticRootBase,
    options.interactive ? statisticRootInteractiveClass : '',
  ].filter(Boolean).join(' ')
}

/** `tabular-nums` держит ширину строки при переборе чисел и при смене значения. */
export const statisticValueTypographyClass = 'font-semibold tabular-nums'

export function statisticValueClass(options: { size: GrStatisticSize, tone: GrStatisticTone }): string {
  return [
    statisticValueTypographyClass,
    statisticValueSizeBySize[options.size],
    statisticValueClassByTone[options.tone],
  ].join(' ')
}
