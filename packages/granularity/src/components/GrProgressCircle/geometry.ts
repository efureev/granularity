/**
 * Геометрия дуги прогресса. Без Vue — проверяется без монтирования.
 *
 * Все размеры в единицах `viewBox` 100×100: разметка не зависит от того, каким
 * `size` кольцо выводится, а масштабирование остаётся делом CSS.
 */

export const GR_PROGRESS_CIRCLE_SHAPES = ['circle', 'dashboard'] as const

export type GrProgressCircleShape = typeof GR_PROGRESS_CIRCLE_SHAPES[number]

/** Сторона `viewBox`; центр — в её половине. */
export const VIEW_BOX = 100

/** Доля окружности под дугой: у «дашборда» снизу вырез в четверть. */
const ARC_FRACTION: Record<GrProgressCircleShape, number> = {
  circle: 1,
  dashboard: 0.75,
}

/**
 * Угол начала дуги. `<circle>` в SVG стартует с трёх часов и идёт по часовой:
 * кольцу нужен старт с двенадцати, «дашборду» — так, чтобы вырез сел строго
 * вниз и симметрично.
 */
const ROTATION: Record<GrProgressCircleShape, number> = {
  circle: -90,
  dashboard: 135,
}

export interface GrArcGeometry {
  /** Радиус с поправкой на толщину: обводка рисуется по обе стороны линии. */
  radius: number
  circumference: number
  /** Длина дорожки — вся окружность либо её часть у «дашборда». */
  arcLength: number
  /** `stroke-dasharray` дорожки. */
  trackDashArray: string
  /** `stroke-dasharray` дуги значения. */
  valueDashArray: string
  rotation: number
}

export function clampProgress(value: number): number {
  if (!Number.isFinite(value))
    return 0

  return Math.min(100, Math.max(0, value))
}

/**
 * Дуга задаётся одним штрихом нужной длины и заведомо большим пробелом за ним,
 * а не парой `dasharray` + `dashoffset`: смещение пришлось бы пересчитывать под
 * каждую форму, и ошибка в нём видна только глазом на конкретной ступени.
 */
export function arcGeometry(
  shape: GrProgressCircleShape,
  thickness: number,
  value: number,
): GrArcGeometry {
  const safeThickness = Math.max(1, Math.min(VIEW_BOX / 2, thickness))
  const radius = VIEW_BOX / 2 - safeThickness / 2
  const circumference = 2 * Math.PI * radius
  const arcLength = circumference * ARC_FRACTION[shape]
  const progress = clampProgress(value) / 100

  return {
    radius,
    circumference,
    arcLength,
    trackDashArray: `${arcLength} ${circumference}`,
    valueDashArray: `${arcLength * progress} ${circumference}`,
    rotation: ROTATION[shape],
  }
}
