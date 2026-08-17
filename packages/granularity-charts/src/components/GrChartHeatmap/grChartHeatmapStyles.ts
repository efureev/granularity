export type { GrChartSize as GrChartHeatmapSize } from '../GrChartFrame/chartFrameStyles'

/**
 * Оформление теплокарты — токенами через атрибуты SVG.
 *
 * Роли шкалы объявлены **литералами**, а не собраны шаблонной строкой: реестр
 * покомпонентных токенов ищет имена регуляркой по исходникам владельца, и
 * собранное имя он не увидит.
 */

/** Отсутствующая ячейка не заливается вовсе: за ней остаётся фон карты. */
export const heatmapEmptyFill = 'var(--gr-chart-heatmap-empty,transparent)'

/** Обводка активной ячейки: цвет один на всю карту, иначе рамка спорит с заливкой. */
export const heatmapOutlineStroke = 'var(--gr-chart-heatmap-outline,var(--gr-fg))'

export const heatmapLabelFill = 'var(--gr-chart-heatmap-label,var(--gr-fg))'

/** Подпись на насыщенной заливке: тёмный текст на ней теряет контраст. */
export const heatmapLabelOnDarkFill = 'var(--gr-bg)'

/** Зазор между ячейками. Числом: он идёт в геометрию сетки, а не в CSS. */
export const DEFAULT_HEATMAP_GAP = 2

/** Толщина обводки активной ячейки. */
export const HEATMAP_OUTLINE_WIDTH = 2

/** Полюса последовательной шкалы по умолчанию. */
export const HEATMAP_HIGH_COLOR = 'var(--gr-chart-1)'
export const HEATMAP_LOW_COLOR = 'var(--gr-danger)'
export const HEATMAP_MID_COLOR = 'var(--gr-muted)'

/** Сколько образцов рисует непрерывная легенда: ступенчатая берёт их у шкалы. */
export const LEGEND_CONTINUOUS_STEPS = 24

/**
 * Кегль подписи в ячейке считается от её размера, а не от размера компонента:
 * на узкой матрице подпись обязана уменьшиться, иначе она вылезет за ячейку.
 */
export const CELL_LABEL_RATIO = 0.34
export const CELL_LABEL_MIN = 8
export const CELL_LABEL_MAX = 14

/** Ниже этой ширины ячейки подпись не помещается ни при каком кегле. */
export const CELL_LABEL_MIN_WIDTH = 26
