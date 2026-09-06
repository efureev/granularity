import type { GrComponentSize } from '../shared/sizes'

export type GrTableSize = GrComponentSize

/**
 * `GrTable` — «тонкий» контейнер: он задаёт только кегль таблицы, паддинги
 * ячеек остаются за потребителем (см. `GrTableProps`). Поэтому карта здесь
 * одна, а метрики ячеек живут в `GrDataTable`, который рисует их сам.
 */
/**
 * Лестница 12/13/14/16 совпадает с `GrInput`, `GrTextarea` и `GrSelect` — это
 * типографика контролов пакета, а не самодеятельность таблицы. В шкале
 * `--gr-text-*` ступени 13px нет, и подстановка `--gr-text-sm` схлопнула бы
 * `sm` и `md` в один кегль. Перевод всей лестницы на токены — отдельная
 * системная задача.
 */
export const tableSizes: Record<GrTableSize, string> = {
  xs: 'text-[length:var(--gr-control-text-xs)] leading-[var(--gr-control-leading-xs)]',
  sm: 'text-[length:var(--gr-control-text-sm)] leading-[var(--gr-control-leading-sm)]',
  md: 'text-[length:var(--gr-control-text-md)] leading-[var(--gr-leading-sm)]',
  lg: 'text-[length:var(--gr-control-text-lg)] leading-[var(--gr-leading-base)]',
}

/**
 * Строка, которая не входит в набор: подробности раскрытой строки, распорки
 * виртуализатора. Помеченная ею `<tr>` не полосатится, не подсвечивается и
 * **не участвует в счёте чётности** соседей.
 */
export const DETAIL_ROW_ATTR = 'data-gr-table-off-grid'

/**
 * Чередование строк и подсветка под курсором — на `<tbody>`, а не на ячейках.
 *
 * `of :not(…)` здесь обязателен, и `:not()` снаружи его не заменяет: `nth-child`
 * считает позицию среди **всех** сиблингов, поэтому обычный фильтр убрал бы
 * полосу с самой служебной строки, но сдвинул бы чётность у всех, кто ниже.
 * Форма `of S` перенумеровывает по отфильтрованному набору — это и нужно.
 */
export const stripedClass = `[&>tr:nth-child(even_of_:not([${DETAIL_ROW_ATTR}]))]:bg-[color-mix(in_srgb,var(--gr-muted)_35%,transparent)]`
export const hoverableClass = `[&>tr:not([${DETAIL_ROW_ATTR}]):hover]:bg-[color-mix(in_srgb,var(--gr-muted)_45%,transparent)]`

export const emptyCellClass = 'px-4 py-8 text-center text-[var(--gr-muted-fg)]'
export const loadingRowCellClass = 'px-4 py-3'
