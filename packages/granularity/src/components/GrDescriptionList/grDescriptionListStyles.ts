import type { GrComponentSize } from '../shared/sizes'
import type { GrTone } from '../shared/tones'

/**
 * Классы `GrDescriptionList`.
 *
 * Тон перечислен целиком по одному литералу на ветку: UnoCSS сканирует исходный
 * текст файла, и собранное шаблонной строкой имя уехало бы в CSS литералом.
 */

/**
 * `inline` — подпись колонкой слева; `stacked` — над значением; `flow` — пары
 * текут по строке с переносом.
 */
export type GrDescriptionLayout = 'inline' | 'stacked' | 'flow'

export type GrDescriptionDensity = 'regular' | 'compact'

/** Сколько колонок пар. Длинный список читается в несколько. */
export type GrDescriptionColumns = 1 | 2 | 3 | 4

// `m-0` — у нативного `<dl>` есть браузерные отступы, и без сброса список
// разъезжается по вертикали. Ряды разводит `--gr-description-list-row-gap`,
// потому что зазор здесь — точка кастомизации, а не ступень шкалы.
export const descriptionRootClass = 'm-0 gap-x-4 [row-gap:var(--gr-description-list-row-gap,0.375rem)]'

/** Сетка колонок — раскладки `inline` и `stacked`. */
export const descriptionRootGridClass = 'grid'

// `flow` строит строку, а не сетку: пары текут по ширине и переносятся сами,
// поэтому колонок у неё нет.
export const descriptionRootFlowClass = 'flex flex-wrap items-baseline'

// Лестница брейкпоинтов зашита в саму ступень: четыре колонки коротких пар на
// узком экране нечитаемы, и решать это потребителю незачем.
export const descriptionColumnsClass: Record<GrDescriptionColumns, string> = {
  1: 'grid-cols-1',
  // Пара — элемент сетки, поэтому между колонками она не рвётся. `column-count`
  // рвал бы: он раскладывает поток, а не блоки.
  2: 'grid-cols-1 sm:grid-cols-2',
  3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
  4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4',
}

export const descriptionPairInlineClass = 'flex min-w-0 items-baseline gap-2'
export const descriptionPairStackedClass = 'min-w-0'

// Зазор уже: подпись и значение здесь читаются как одна фраза «Сообщений: 3»,
// а пары друг от друга отбивает `gap-x-4` корня.
export const descriptionPairFlowClass = 'flex min-w-0 items-baseline gap-1'

export const descriptionDividedClass = 'border-b border-[var(--gr-description-list-divider,var(--gr-brd))] pb-1 last:border-b-0 last:pb-0'

// `shrink-0` держит колонку подписей ровной: иначе длинное значение сжимало бы
// подпись, и значения переставали бы стоять в колонку — ровно то, ради чего
// раскладка `inline` и существует.
export const descriptionLabelInlineClass = 'shrink-0 text-[var(--gr-description-list-label-color,var(--gr-muted-fg))]'
export const descriptionLabelStackedClass = 'text-[var(--gr-description-list-label-color,var(--gr-muted-fg))]'

// `break-words` обязателен: в парах живут идентификаторы, хеши и `X-Request-Id`,
// и без переноса они выталкивают вёрстку.
export const descriptionValueClass = 'm-0 min-w-0 break-words'

/** Тон — только у значения: красная подпись читается как «поле сломано». */
export const descriptionValueToneClass: Record<GrTone, string> = {
  primary: 'text-[var(--gr-primary-text)]',
  neutral: '',
  success: 'text-[var(--gr-success-text)]',
  warning: 'text-[var(--gr-warning-text)]',
  danger: 'text-[var(--gr-danger-text)]',
  info: 'text-[var(--gr-info-text)]',
  slate: 'text-[var(--gr-slate-text)]',
  azure: 'text-[var(--gr-azure-text)]',
}

export const descriptionSizeClass: Record<GrComponentSize, string> = {
  xs: 'text-[length:var(--gr-control-text-2xs)]',
  sm: 'text-[length:var(--gr-control-text-xs)]',
  md: 'text-[length:var(--gr-control-text-sm)]',
  lg: 'text-[length:var(--gr-control-text-md)]',
}

export const descriptionDensityClass: Record<GrDescriptionDensity, string> = {
  regular: '',
  compact: '[row-gap:var(--gr-description-list-row-gap,0.125rem)]',
}
