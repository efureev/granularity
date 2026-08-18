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

/** Одна колонка — обычный класс: считать там нечего. */
export const descriptionSingleColumnClass = 'grid-cols-1'

/**
 * Колонки по ширине **контейнера**, а не вьюпорта.
 *
 * Медиазапрос меряет экран, а список живёт в карточке: на широком мониторе в
 * колонке 290px включались две колонки, подпись фиксированной ширины съедала
 * почти всё место, и значение переносилось посимвольно — «30» печаталось как
 * «3» и «0» на двух строках. Показанное число становилось неверным.
 *
 * `auto-fit` решает это без медиазапросов, без JS и без замеров, то есть
 * одинаково на сервере и на клиенте. `columns` при этом становится **потолком**:
 * трек не уже `column-min`, но и не уже доли, на которую делится контейнер при
 * N колонках, — поэтому шире N штук не встанет никогда.
 *
 * `min(100%, …)` спасает совсем узкий контейнер: без него трек шириной с
 * `column-min` вылезал бы за край.
 *
 * Инлайновым стилем, а не классом: выражение зависит от N, и шкалы утилит для
 * него не существует — тот же довод, что записан у сетки `GrDashboard`.
 */
export function descriptionColumnsStyle(
  columns: GrDescriptionColumns,
  /**
   * Ширина колонки подписей при `inline`. В этой раскладке подпись и значение
   * стоят **рядом**, поэтому минимум колонки складывается из них двоих: колонка
   * шириной с одну подпись оставляет значению несколько пикселей, и оно
   * переносится посимвольно — тот же дефект, только в других числах.
   */
  labelWidth?: string,
): Record<string, string> {
  const base = 'var(--gr-description-list-column-min, 12rem)'
  const min = labelWidth
    ? `max(${base}, calc(${labelWidth} + var(--gr-description-list-value-min, 5rem)))`
    : base

  return {
    gridTemplateColumns: `repeat(auto-fit, minmax(min(100%, max(${min}, (100% - ${columns - 1} * 1rem) / ${columns})), 1fr))`,
  }
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
  xs: 'text-[length:var(--gr-control-text-2xs)] leading-[var(--gr-control-leading-2xs)]',
  sm: 'text-[length:var(--gr-control-text-xs)] leading-[var(--gr-control-leading-xs)]',
  md: 'text-[length:var(--gr-control-text-sm)] leading-[var(--gr-control-leading-sm)]',
  lg: 'text-[length:var(--gr-control-text-md)] leading-[var(--gr-control-leading-md)]',
}

export const descriptionDensityClass: Record<GrDescriptionDensity, string> = {
  regular: '',
  compact: '[row-gap:var(--gr-description-list-row-gap,0.125rem)]',
}
