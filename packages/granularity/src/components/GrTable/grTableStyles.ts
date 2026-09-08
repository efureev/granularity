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
 * Строка или группа строк, которая не входит в набор: подробности раскрытой
 * строки, распорки виртуализатора. Помеченная ею `<tr>` не полосатится, не
 * подсвечивается и **не участвует в счёте чётности** соседей.
 */
export const DETAIL_ROW_ATTR = 'data-gr-table-off-grid'

/**
 * Только оттенок, без утилиты вокруг: целый класс отдельным литералом гейт
 * safelist читает как употреблённый в разметке и требует его объявить, хотя
 * сам по себе он нигде не стоит — он всегда хвост варианта.
 */
const STRIPE_TINT = 'color-mix(in_srgb,var(--gr-muted)_35%,transparent)'
const HOVER_TINT = 'color-mix(in_srgb,var(--gr-muted)_45%,transparent)'

/**
 * Чередование строк и подсветка под курсором — на таблице, а не на ячейках.
 *
 * Форм тела две, и селектора поэтому тоже два. Обычное тело — одна `<tbody>`
 * со строками; тело `GrDataTable` — группа `<tbody>` на строку, потому что
 * второй ярус обязан лежать со своей строкой в одной группе (см. `rowGroups`
 * у `GrTable`). Каждый селектор в чужой форме не совпадает ни с чем: в одной
 * группе строка набора всегда первая, а единственная `<tbody>` никогда не
 * чётная, — так что оба живут рядом и не спорят.
 *
 * `of S` здесь обязателен, и `:not()` снаружи его не заменяет: `nth-child`
 * считает позицию среди **всех** сиблингов, поэтому обычный фильтр убрал бы
 * полосу с самой служебной строки, но сдвинул бы чётность у всех, кто ниже.
 * Форма `of S` перенумеровывает по отфильтрованному набору — это и нужно.
 */
export const stripedClass = [
  `[&>tbody>tr:nth-child(even_of_:not([${DETAIL_ROW_ATTR}]))]:bg-[${STRIPE_TINT}]`,
  `[&>tbody:nth-child(even_of_tbody:not([${DETAIL_ROW_ATTR}]))>tr:not([${DETAIL_ROW_ATTR}])]:bg-[${STRIPE_TINT}]`,
].join(' ')

export const hoverableClass = `[&>tbody>tr:not([${DETAIL_ROW_ATTR}]):hover]:bg-[${HOVER_TINT}]`

export const emptyCellClass = 'px-4 py-8 text-center text-[var(--gr-muted-fg)]'
export const loadingRowCellClass = 'px-4 py-3'
