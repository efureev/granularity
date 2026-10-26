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
 * Только оттенок, без утилиты вокруг: сам по себе он нигде не стоит — он всегда
 * хвост варианта. Целые классы полосы и подсветки ниже собираются шаблонной
 * строкой из атрибута служебной строки и оттенка, экстрактор их не видит, и
 * поэтому они объявлены в `GrTable/safelist.ts`.
 */
// Доля `--gr-muted` — у темы, а не готовый цвет: та же доля даёт и прозрачную
// подсветку строки, и непрозрачную у закреплённой колонки, и они не расходятся.
const STRIPE_TINT = 'color-mix(in_srgb,var(--gr-muted)_var(--gr-table-stripe-share),transparent)'
const HOVER_TINT = 'color-mix(in_srgb,var(--gr-muted)_var(--gr-table-hover-share),transparent)'

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

/**
 * Фон первой ячейки, когда колонка липкая.
 *
 * Наследовать фон строки нельзя, хотя это и просится: оттенки полосы и
 * подсветки **полупрозрачны** (`color-mix(…, transparent)`), и сквозь такую
 * ячейку уезжающие числа видно насквозь — проверено глазами. Поэтому те же
 * оттенки собираются заново поверх непрозрачной карточки: визуально это тот же
 * цвет, но без дыры.
 */
const STRIPE_OPAQUE = 'color-mix(in_srgb,var(--gr-muted)_var(--gr-table-stripe-share),var(--gr-card))'
const HOVER_OPAQUE = 'color-mix(in_srgb,var(--gr-muted)_var(--gr-table-hover-share),var(--gr-card))'

export const stickyColumnStripedClass = `[&>tbody>tr:nth-child(even_of_:not([${DETAIL_ROW_ATTR}]))>*:first-child]:bg-[${STRIPE_OPAQUE}]`

export const stickyColumnHoverableClass = `[&>tbody>tr:not([${DETAIL_ROW_ATTR}]):hover>*:first-child]:bg-[${HOVER_OPAQUE}]`

/**
 * Линия под шапкой — фоновым слоем по нижнему краю ячеек шапки, а не рамкой.
 * Таблица — в схлопнутых рамках, и рамка ячейки шапки побеждала бы рамку
 * первой строки: тема без линии теряла бы границу под шапкой, тема с линией
 * получала бы её и в пустой таблице. Слой не занимает места, не спорит с
 * заливкой шапки и липкой колонки и едет вместе с липкой шапкой. Толщина 0 —
 * линии нет.
 */
export const headLineClass = [
  '[&>thead>tr>*]:[background-image:linear-gradient(var(--gr-table-head-line),var(--gr-table-head-line))]',
  '[&>thead>tr>*]:[background-size:100%_var(--gr-table-head-line-width)]',
  '[&>thead>tr>*]:[background-position:bottom]',
  '[&>thead>tr>*]:bg-no-repeat',
].join(' ')

export const emptyCellClass = 'px-4 py-8 text-center text-[var(--gr-muted-fg)]'
export const loadingRowCellClass = 'px-4 py-3'
