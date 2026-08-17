import type { GrComponentSize } from '@feugene/granularity/components/GrConfigProvider'

/**
 * Классы общей рамы графика.
 *
 * Рама — не компонент: у директории нет ни `index.ts`, ни `config.ts`, поэтому
 * в реестры она не попадает (гейт `frameOwnership.test.ts`). Владельцем токенов
 * `--gr-chart-frame-*` она при этом остаётся: гейт покомпонентных токенов ищет
 * реестры по файлу `tokens.json` в любой директории `Gr…`, а не по составу
 * компонента.
 *
 * Пиксельных литералов и утилит uno-шкалы (`text-sm`, `rounded-md`) здесь нет:
 * темой они не настраиваются, а выглядят правильно.
 */

export type GrChartSize = GrComponentSize

/**
 * Кегль подписи — парой: класс для рисования и число для арифметики раскладки.
 *
 * Ступени взяты с **контрольной** шкалы `--gr-control-text-*`, той же, на
 * которой стоят плотные компоненты ядра (`GrTooltip`, `GrDataTable`,
 * `GrBadge`): подпись деления обязана совпадать по весу с таблицей рядом.
 * Лестница мельче основной — `3xs` 10, `2xs` 11, `xs` 12, `md` 14.
 *
 * Числа обязаны **соответствовать** классам: по ним `chartLayout` считает место
 * под ось до первого кадра, а прочитать CSS-переменную из JS без DOM нечем.
 * Разойдись они — и на `lg` рама резервировала бы место под 14px, рисуя 12px.
 * Токен `--gr-chart-frame-label-size` остаётся точкой переопределения для темы;
 * сдвинув его далеко, тема делает отступ неточным — на это есть потолок ширины
 * и флаг `truncated`.
 */
export const labelSizeClass: Record<GrChartSize, string> = {
  xs: 'text-[length:var(--gr-chart-frame-label-size,var(--gr-control-text-3xs))]',
  sm: 'text-[length:var(--gr-chart-frame-label-size,var(--gr-control-text-2xs))]',
  md: 'text-[length:var(--gr-chart-frame-label-size,var(--gr-control-text-xs))]',
  lg: 'text-[length:var(--gr-chart-frame-label-size,var(--gr-control-text-md))]',
}

export const labelFontPx: Record<GrChartSize, number> = {
  xs: 10,
  sm: 11,
  md: 12,
  lg: 14,
}

/** Высота холста по умолчанию — токеном, чтобы тема могла задать свою. */
export const frameRootClass = 'relative w-full text-[var(--gr-fg)]'

export const frameSvgClass = 'block h-full w-full'

/**
 * Прозрачный оверлей области построения: он и есть фокусируемый виджет.
 *
 * Фокус живёт на нём, а не на `<svg>`: SVG в интерактивном режиме помечен
 * `aria-hidden`, и фокусировать скрытое от скринридера нельзя.
 */
export const frameSurfaceClass
  = 'absolute inset-0 rounded-[var(--gr-radius-md)] focus-visible:outline-none '
    + 'focus-visible:ring-2 focus-visible:ring-[var(--gr-ring)]'

/**
 * Межстрочный идёт вместе с кеглем: утилита `text-*` в uno задаёт обе вещи, и
 * кегль, переведённый на токен в одиночку, отдал бы интервал на откуп `body`
 * приложения (`docs/sizes.md`).
 */
export const frameLabelClass = 'leading-[var(--gr-leading-normal)]'

export const frameStateClass = 'absolute inset-0 flex items-center justify-center'

/** Призрак графика поверх мерцающего скелета: он лежит ровно на его площади. */
export const frameGhostClass = 'absolute inset-0 h-full w-full'

export const frameTooltipClass
  = 'pointer-events-none z-[var(--gr-z-tooltip)] flex flex-col gap-1 rounded-[var(--gr-radius-md)] '
    + 'border border-[var(--gr-chart-frame-tooltip-brd,var(--gr-brd))] '
    + 'bg-[var(--gr-chart-frame-tooltip-bg,var(--gr-card))] px-3 py-2 shadow-lg '
    + 'text-[var(--gr-chart-frame-tooltip-fg,var(--gr-fg))] '
    + 'text-[length:var(--gr-control-text-sm)] leading-[var(--gr-leading-normal)]'

export const frameTooltipTitleClass = 'font-600'

export const frameTooltipRowClass = 'flex items-center gap-2'

export const frameTooltipValueClass = 'ml-auto font-500 [font-variant-numeric:tabular-nums]'

export const frameLegendClass
  = 'flex flex-wrap items-center gap-[var(--gr-chart-frame-legend-gap,0.75rem)] '
    + 'text-[length:var(--gr-control-text-sm)] leading-[var(--gr-leading-normal)]'

export const frameLegendItemClass
  = 'inline-flex items-center gap-2 rounded-[var(--gr-radius-control)] px-1 '
    + 'text-[var(--gr-fg)] transition-colors duration-[var(--gr-duration-fast)] ease-[var(--gr-ease-out)] '
    + 'hover:bg-[var(--gr-muted)] focus-visible:outline-none focus-visible:ring-2 '
    + 'focus-visible:ring-[var(--gr-ring)]'

/** Скрытая серия гасится цветом текста, а не `opacity`: прозрачность роняет контраст. */
export const frameLegendItemHiddenClass = 'text-[var(--gr-muted-fg)]'

export const frameLegendSwatchClass = 'inline-block h-3 w-3 shrink-0'

export const frameTableClass = 'w-full border-collapse text-left text-[length:var(--gr-control-text-sm)]'

export const frameTableCellClass = 'border border-[var(--gr-brd)] px-2 py-1'

/** Толщина сетки и оси задаётся атрибутом, а не классом: SVG слушает `stroke-width`. */
export const gridStroke = 'var(--gr-chart-frame-grid,var(--gr-brd))'
export const gridStrokeWidth = 'var(--gr-chart-frame-grid-width,1px)'
export const axisStroke = 'var(--gr-chart-frame-axis,var(--gr-brd))'
export const labelFill = 'var(--gr-chart-frame-label,var(--gr-muted-fg))'
export const crosshairStroke = 'var(--gr-chart-frame-crosshair,var(--gr-brd))'

/**
 * Опора красится приглушённой ролью, а не цветом серии.
 *
 * Порог — это не ряд: возьми он цвет из палитры, читатель начал бы искать его в
 * легенде. Свой цвет опоры (`color`) отменяет этот дефолт — но решает так автор
 * графика, а не палитра.
 */
export const referenceStroke = 'var(--gr-chart-frame-reference,var(--gr-muted-fg))'
export const referenceLabelFill = 'var(--gr-chart-frame-reference-label,var(--gr-muted-fg))'

/** Полоса заливается едва заметно: коридор допустимого не должен спорить с данными. */
export const referenceBandOpacity = 'var(--gr-chart-frame-reference-band-opacity,0.12)'

/** Толщина линии опоры — числом: она же идёт в `dashArrayFor`, а тот считает в JS. */
export const REFERENCE_STROKE_WIDTH = 1.5

/**
 * Размер марки — число, а не токен: он идёт в геометрию символа
 * (`symbolPath`), которая считается в JS и CSS-переменную прочитать не может.
 *
 * Лестница общая для всех графиков с точками: марка линии и марка площади
 * обязаны совпадать по весу, если стоят на одной странице.
 */
export const markerSizes: Record<GrChartSize, number> = {
  xs: 5,
  sm: 6,
  md: 7,
  lg: 8,
}

/** Активная марка крупнее соседних — это её единственный признак, кроме вертикали. */
export const ACTIVE_MARKER_SCALE = 1.6

/**
 * Порог `showPoints: 'auto'`.
 *
 * Выше него марки сливаются в сплошную полосу и только мешают: ряд читается
 * лучше без них.
 */
export const AUTO_MARKERS_LIMIT = 60

/**
 * Призрак загрузки красится приглушённой ролью, а не цветом серии: это не
 * данные, и выглядеть данными он не должен.
 */
export const ghostStroke = 'var(--gr-muted-fg)'
