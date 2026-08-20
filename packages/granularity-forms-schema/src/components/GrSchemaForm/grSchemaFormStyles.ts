import type { GrUiBreakpoint, GrUiColumnCount, GrUiColumns, GrUiSpan } from '../../ui-schema'

/**
 * Сетка раскладки — единственное, что пакет рисует сам.
 *
 * Ядро колонок формы не даёт: `GrFormField` отвечает за одно поле, а раскладку
 * между полями каждый строит своей вёрсткой. Здесь она нужна затем же, зачем
 * весь пакет, — чтобы её не строили руками на каждой форме.
 *
 * Набор классов конечен и перечислен целиком: произвольные числа колонок
 * потребовали бы сотню токенов в safelist ради раскладок, которых никто не
 * строит. Отсюда и кап `GrUiColumnCount` на шести значениях.
 */
const COLUMN_COUNTS: readonly GrUiColumnCount[] = [1, 2, 3, 4, 6, 12]

export const gridColumnsClass: Record<GrUiBreakpoint, Record<GrUiColumnCount, string>> = {
  base: { 1: 'grid-cols-1', 2: 'grid-cols-2', 3: 'grid-cols-3', 4: 'grid-cols-4', 6: 'grid-cols-6', 12: 'grid-cols-12' },
  sm: { 1: 'sm:grid-cols-1', 2: 'sm:grid-cols-2', 3: 'sm:grid-cols-3', 4: 'sm:grid-cols-4', 6: 'sm:grid-cols-6', 12: 'sm:grid-cols-12' },
  md: { 1: 'md:grid-cols-1', 2: 'md:grid-cols-2', 3: 'md:grid-cols-3', 4: 'md:grid-cols-4', 6: 'md:grid-cols-6', 12: 'md:grid-cols-12' },
  lg: { 1: 'lg:grid-cols-1', 2: 'lg:grid-cols-2', 3: 'lg:grid-cols-3', 4: 'lg:grid-cols-4', 6: 'lg:grid-cols-6', 12: 'lg:grid-cols-12' },
}

export const gridSpanClass: Record<GrUiBreakpoint, Record<GrUiColumnCount | 'full', string>> = {
  base: { 1: 'col-span-1', 2: 'col-span-2', 3: 'col-span-3', 4: 'col-span-4', 6: 'col-span-6', 12: 'col-span-12', full: 'col-span-full' },
  sm: { 1: 'sm:col-span-1', 2: 'sm:col-span-2', 3: 'sm:col-span-3', 4: 'sm:col-span-4', 6: 'sm:col-span-6', 12: 'sm:col-span-12', full: 'sm:col-span-full' },
  md: { 1: 'md:col-span-1', 2: 'md:col-span-2', 3: 'md:col-span-3', 4: 'md:col-span-4', 6: 'md:col-span-6', 12: 'md:col-span-12', full: 'md:col-span-full' },
  lg: { 1: 'lg:col-span-1', 2: 'lg:col-span-2', 3: 'lg:col-span-3', 4: 'lg:col-span-4', 6: 'lg:col-span-6', 12: 'lg:col-span-12', full: 'lg:col-span-full' },
}

/**
 * Плотность формы — точка кастомизации: приложения с плотными таблицами и
 * приложения с просторными анкетами хотят разного, а перекрывать классы
 * снаружи значило бы бороться со специфичностью.
 */
export const schemaGridClass = 'grid gap-x-[var(--gr-schema-form-gap-x,1rem)] gap-y-[var(--gr-schema-form-gap-y,0.25rem)] items-start'

export function columnsToClass(columns: GrUiColumns | undefined): string {
  if (columns === undefined) return gridColumnsClass.base[1]
  if (typeof columns === 'number') return gridColumnsClass.base[columns]

  return Object.entries(columns)
    .map(([breakpoint, count]) => gridColumnsClass[breakpoint as GrUiBreakpoint]?.[count])
    .filter(Boolean)
    .join(' ')
}

export function spanToClass(span: GrUiSpan | undefined): string {
  if (span === undefined) return ''
  if (typeof span === 'number' || span === 'full') return gridSpanClass.base[span]

  return Object.entries(span)
    .map(([breakpoint, value]) => gridSpanClass[breakpoint as GrUiBreakpoint]?.[value])
    .filter(Boolean)
    .join(' ')
}

/**
 * Строка повторителя.
 *
 * Переход по цвету рамки — не украшение: строка, которую только что добавили
 * или переставили, иначе появляется рывком, и глаз теряет, какая именно
 * изменилась.
 */
export const schemaRowClass = 'relative grid gap-x-[var(--gr-schema-form-gap-x,1rem)] gap-y-[var(--gr-schema-form-gap-y,0.25rem)] items-start rounded-[var(--gr-radius-lg)] border border-[var(--gr-brd)] p-4 transition-colors duration-[var(--gr-duration-fast)] ease-[var(--gr-ease-out)]'
export const schemaRowActionsClass = 'flex items-center gap-1 justify-end'
export const schemaArrayEmptyClass = 'rounded-[var(--gr-radius-lg)] border border-dashed border-[var(--gr-brd)] p-6 text-center text-[length:var(--gr-control-text-sm)] leading-[var(--gr-leading-sm)] text-[var(--gr-muted-fg)]'
export const schemaArrayListClass = 'grid gap-[var(--gr-schema-form-row-gap,0.75rem)]'
export const schemaSectionsClass = 'grid gap-6'
export const schemaFormErrorsClass = 'mb-4'
export const schemaRowLabelClass = 'text-[length:var(--gr-control-text-sm)] leading-[var(--gr-control-leading-sm)] font-600 text-[var(--gr-muted-fg)]'

export const schemaAdditionalHeaderClass = 'mb-2 flex items-center justify-between gap-2'
export const schemaAdditionalRowClass = 'flex items-start gap-[var(--gr-schema-form-gap-x,1rem)]'
export const schemaAdditionalKeyClass = 'w-1/3 min-w-0'
export const schemaAdditionalValueClass = 'flex-1 min-w-0'

export const ALL_GRID_CLASSES: readonly string[] = [
  schemaGridClass,
  schemaRowClass,
  schemaRowActionsClass,
  schemaArrayEmptyClass,
  schemaArrayListClass,
  schemaSectionsClass,
  schemaFormErrorsClass,
  schemaRowLabelClass,
  schemaAdditionalHeaderClass,
  schemaAdditionalRowClass,
  schemaAdditionalKeyClass,
  schemaAdditionalValueClass,
  ...Object.values(gridColumnsClass).flatMap(map => COLUMN_COUNTS.map(count => map[count])),
  ...Object.values(gridSpanClass).flatMap(map => [...COLUMN_COUNTS.map(count => map[count]), map.full]),
]
