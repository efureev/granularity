import type { GrCheckboxSize } from '../GrCheckbox/grCheckboxStyles'
import type { GrComponentSize } from '../shared/sizes'

export type GrDataTableSize = GrComponentSize

/** Паддинг ячейки — и в шапке, и в теле: колонки обязаны совпадать по сетке. */
export const cellPaddings: Record<GrDataTableSize, string> = {
  xs: 'px-2 py-1.5',
  sm: 'px-3 py-2',
  md: 'px-4 py-3',
  lg: 'px-5 py-4',
}

/**
 * Оценка высоты строки по размеру: два вертикальных отступа ячейки плюс строка
 * текста и рамка. Виртуализация уточняет её замером — точное число здесь знать
 * неоткуда, содержимое ячейки задаёт потребитель.
 */
export const rowHeightEstimates: Record<GrDataTableSize, number> = {
  xs: 33,
  sm: 41,
  md: 49,
  lg: 57,
}

/** Заглушки loading/empty: по горизонтали как ячейка, по вертикали просторнее. */
export const placeholderPaddings: Record<GrDataTableSize, string> = {
  xs: 'px-2 py-3',
  sm: 'px-3 py-4',
  md: 'px-4 py-6',
  lg: 'px-5 py-8',
}

/**
 * Ручка перестановки колонки. Появляется по наведению на заголовок и по
 * фокусу: постоянная сетка ручек в шапке из десяти колонок читается как рябь,
 * а не как управление.
 */
export const columnHandleClass = 'inline-flex shrink-0 cursor-grab items-center text-[var(--gr-datatable-drag-handle,var(--gr-muted-fg))] opacity-0 [touch-action:none] transition-opacity duration-[var(--gr-duration-fast)] focus:outline-none focus-visible:opacity-100 focus-visible:ring-2 focus-visible:ring-[var(--gr-ring)] rounded-[var(--gr-radius-sm)] group-hover:opacity-100'

export const columnHandleActiveClass = 'opacity-100'


/** Переносимая колонка гасится, чтобы было видно, что она «поднята». */
export const columnDraggingClass = 'bg-[var(--gr-muted)]'

/**
 * Место вставки — полоса по краю ячейки заголовка. Псевдоэлемент, а не свой
 * узел: `<th>` не терпит посторонних детей в раскладке таблицы.
 */
export const columnDropBeforeClass = 'before:absolute before:inset-y-0 before:left-0 before:w-[var(--gr-datatable-drag-indicator-width,2px)] before:bg-[var(--gr-datatable-drag-indicator,var(--gr-primary))] before:content-empty'

export const columnDropAfterClass = 'after:absolute after:inset-y-0 after:right-0 after:w-[var(--gr-datatable-drag-indicator-width,2px)] after:bg-[var(--gr-datatable-drag-indicator,var(--gr-primary))] after:content-empty'

/**
 * Подсветка выбранной строки. Живёт здесь, потому что закреплённой ячейке её
 * приходится повторять: у ячейки свой непрозрачный фон, и подсветка строки
 * сквозь него не видна.
 */
export const rowSelectedClass = 'bg-[color-mix(in_srgb,var(--gr-primary)_8%,transparent)]'

/**
 * Ручка ширины — полоса у правого края заголовка. Видима она узкой линией, а
 * ловится широкой зоной: попасть в двухпиксельную границу мышью тяжело.
 */
export const columnResizerClass = 'absolute inset-y-0 right-0 z-[1] flex w-3 translate-x-1/2 cursor-col-resize items-stretch justify-center [touch-action:none] focus:outline-none'

export const columnResizerLineClass = 'w-[var(--gr-datatable-resizer-width,2px)] bg-transparent transition-colors duration-[var(--gr-duration-fast)]'

/** Полоса подсвечивается только когда её ведут или на неё встал фокус. */
export const columnResizerLineActiveClass = 'bg-[var(--gr-datatable-resizer,var(--gr-primary))]'

export const columnResizerHoverClass = 'hover:bg-[var(--gr-datatable-resizer,var(--gr-primary))] focus-visible:bg-[var(--gr-datatable-resizer,var(--gr-primary))]'

/**
 * Закреплённая колонка липнет к краю прокрутки. Фон обязателен: без него
 * уезжающие под неё ячейки просвечивают насквозь.
 */
export const columnPinnedClass = 'sticky z-[2] bg-[var(--gr-card)]'

/** Граница группы закреплённых колонок — тень, а не рамка: рамка сдвигает сетку. */
export const columnPinnedLeftEdgeClass = 'shadow-[var(--gr-datatable-pinned-shadow,4px_0_6px_-4px_rgba(0,0,0,0.25))]'

export const columnPinnedRightEdgeClass = 'shadow-[var(--gr-datatable-pinned-shadow-end,-4px_0_6px_-4px_rgba(0,0,0,0.25))]'

/** Подпись колонки набирается мельче тела таблицы — она не данные, а навигация. */
export const headerTextSizes: Record<GrDataTableSize, string> = {
  xs: 'text-[length:var(--gr-control-text-3xs)]',
  sm: 'text-[length:var(--gr-control-text-2xs)]',
  md: 'text-[length:var(--gr-control-text-xs)] leading-[var(--gr-leading-xs)]',
  lg: 'text-[length:var(--gr-control-text-md)] leading-[var(--gr-leading-sm)]',
}

/**
 * Размер `GrCheckbox` в колонке выбора. Здесь не классы, а ступень шкалы:
 * коробку рисует сам чекбокс — он же держит `indeterminate`, disabled без
 * `opacity` и фокус-кольцо.
 */
export const selectCheckboxSizes: Record<GrDataTableSize, GrCheckboxSize> = {
  xs: 'xs',
  sm: 'sm',
  md: 'md',
  lg: 'lg',
}

/** Ширина колонки выбора: коробка чекбокса плюс горизонтальный паддинг ячейки. */
export const selectColumnWidths: Record<GrDataTableSize, string> = {
  xs: 'w-7',
  sm: 'w-8',
  md: 'w-10',
  lg: 'w-12',
}

/** Зазор между подписью колонки и стрелкой сортировки. */
export const headerGaps: Record<GrDataTableSize, string> = {
  xs: 'gap-1',
  sm: 'gap-1.5',
  md: 'gap-2',
  lg: 'gap-2',
}

/** Спиннер в строке загрузки — тем же кеглем, что иконка сортировки рядом. */
export const spinnerSizes: Record<GrDataTableSize, string> = {
  xs: 'h-3 w-3',
  sm: 'h-3.5 w-3.5',
  md: 'h-4 w-4',
  lg: 'h-5 w-5',
}

/** Стрелка сортировки берёт размер из шкалы `GrIcon` (`xs…lg` → `14…20px`). */
export const sortIconSizes: Record<GrDataTableSize, GrComponentSize> = {
  xs: 'xs',
  sm: 'xs',
  md: 'sm',
  lg: 'md',
}
