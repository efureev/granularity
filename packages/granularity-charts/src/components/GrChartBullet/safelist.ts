import { chartFrameSafelist } from '../GrChartFrame/frameSafelist'

/**
 * Классы рамы обязаны попасть в safelist компонента.
 *
 * Своих классов у bullet нет — дорожка, полоса и засечка рисуются атрибутами
 * SVG, — но рама живёт в общем `.ts`-хелпере, который бандлер уносит в
 * `dist/chunks/`. Пресет сканирует только `dist/components/GrChartBullet/**`,
 * поэтому без этой строки график собирается зелёным и приезжает к потребителю
 * без цветов и без фокус-кольца.
 */
export const grChartBulletSafelist: string[] = [...chartFrameSafelist]
