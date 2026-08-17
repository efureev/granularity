export type { GrChartSize as GrChartBulletSize } from '../GrChartFrame/chartFrameStyles'

/**
 * Оформление bullet — токенами через атрибуты SVG.
 *
 * Именно атрибутами: фигура красится `fill`/`stroke`, а не `color`. Гейт
 * `svgPaint.test.ts` держит это правило.
 */

/** Дорожка под диапазонами: она видна там, где диапазонов не задали. */
export const bulletTrackFill = 'var(--gr-chart-bullet-track,var(--gr-muted))'

/**
 * Толщина полосы значения.
 *
 * Токеном, а не числом, потому что полоса рисуется `<line>`: `stroke-width`
 * принимает CSS-переменную, и тема может сделать полосу тоньше, не трогая
 * геометрию дорожки.
 */
export const bulletValueWidth = 'var(--gr-chart-bullet-value-width,8px)'

export const bulletTargetStroke = 'var(--gr-chart-bullet-target,var(--gr-fg))'

/** Маркер переполнения: значение вышло за шкалу, и это надо показать, а не срезать. */
export const bulletOverflowFill = 'var(--gr-chart-bullet-overflow,var(--gr-danger))'

/** Полоса значения — цветом первой серии: это данные, а не семантика. */
export const bulletValueFill = 'var(--gr-chart-1)'

/**
 * Полосы диапазонов по умолчанию — оттенками приглушённой роли, а не палитрой
 * серий: диапазон это фон, и цветной он спорил бы с полосой значения.
 *
 * `color-mix` вместо пяти литералов: доля растёт от «хорошо» к «плохо», и
 * количество полос заранее неизвестно.
 */
export function bulletBandFill(index: number, total: number): string {
  const share = total <= 1 ? 0.35 : 0.18 + (index / (total - 1)) * 0.34

  return `color-mix(in oklab, var(--gr-muted-fg) ${Math.round(share * 100)}%, transparent)`
}

/** Доля поперечника под дорожку диапазонов: остальное — воздух вокруг. */
export const BULLET_TRACK_RATIO = 0.62

/** Засечка цели выше дорожки — иначе её край сливается с краем полос. */
export const BULLET_TARGET_RATIO = 1.3

/** Толщина засечки цели: она обязана читаться поверх полосы значения. */
export const BULLET_TARGET_WIDTH = 2

/** Сторона треугольника-маркера переполнения. */
export const BULLET_OVERFLOW_SIZE = 6
