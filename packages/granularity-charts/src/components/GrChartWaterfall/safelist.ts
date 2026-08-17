import { chartFrameSafelist } from '../GrChartFrame/frameSafelist'

/**
 * Классы рамы обязаны попасть в safelist компонента.
 *
 * Своих классов у моста нет — столбцы, соединители и подписи рисуются
 * атрибутами SVG, — но рама живёт в общем `.ts`-хелпере, который бандлер
 * уносит в `dist/chunks/`. Пресет сканирует только
 * `dist/components/GrChartWaterfall/**`, поэтому без этой строки график
 * собирается зелёным и приезжает к потребителю без цветов и без фокус-кольца.
 */
export const grChartWaterfallSafelist: string[] = [...chartFrameSafelist]
