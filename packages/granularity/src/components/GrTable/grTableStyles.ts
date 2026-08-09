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
  xs: 'text-[length:var(--gr-control-text-xs)]',
  sm: 'text-[length:var(--gr-control-text-sm)]',
  md: 'text-sm',
  lg: 'text-base',
}

/** Чередование строк и подсветка под курсором — на `<tbody>`, а не на ячейках. */
export const stripedClass = '[&>tr:nth-child(even)]:bg-[color-mix(in_srgb,var(--gr-muted)_35%,transparent)]'
export const hoverableClass = '[&>tr:hover]:bg-[color-mix(in_srgb,var(--gr-muted)_45%,transparent)]'

export const emptyCellClass = 'px-4 py-8 text-center text-[var(--gr-muted-fg)]'
export const loadingRowCellClass = 'px-4 py-3'
