import { chartFrameSafelist } from '../GrChartFrame/frameSafelist'

/**
 * Классы рамы обязаны попасть в safelist компонента.
 *
 * Своих классов у паутины нет — она рисуется атрибутами SVG, — но рама живёт в
 * общем `.ts`-хелпере, который бандлер уносит в `dist/chunks/`. Пресет
 * сканирует только `dist/components/GrChartRadar/**`, поэтому без этой строки
 * график собирается зелёным и приезжает к потребителю без цветов и без
 * фокус-кольца.
 */
export const grChartRadarSafelist: string[] = [...chartFrameSafelist]
