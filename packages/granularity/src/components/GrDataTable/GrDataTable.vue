<script setup lang="ts" generic="TRow extends Record<string, unknown> = Record<string, unknown>">
import { computed, nextTick, onMounted, ref, useId, watchEffect } from 'vue'

import GrTable from '../GrTable/GrTable.vue'
import GrIcon from '../GrIcon/GrIcon.vue'
import GrCheckbox from '../GrCheckbox/GrCheckbox.vue'
import { useGrComponentSize } from '../GrConfigProvider/context'
import { useAnnouncer } from '../../composables/useAnnouncer'
import { useVirtualList } from '../../composables/useVirtualList'
import { useGranularityTranslations } from '../../internal/granularityI18n'
import type { GrDataTableSortDir } from './grDataTableSort'
import { useDataTableRowKeys } from './composables/useDataTableRowKeys'
import { useDataTableSort } from './composables/useDataTableSort'
import { useDataTableSelection } from './composables/useDataTableSelection'
import { useDataTableColumnOrder } from './composables/useDataTableColumnOrder'
import { MIN_COLUMN_WIDTH, useDataTableColumnWidths } from './composables/useDataTableColumnWidths'
import { SELECT_COLUMN_KEY, useDataTableLayout } from './composables/useDataTableLayout'
import {
  type GrDataTableSize,
  cellPaddings,
  columnDraggingClass,
  columnHandleActiveClass,
  columnHandleClass,
  columnPinnedClass,
  columnResizerClass,
  columnResizerHoverClass,
  columnResizerLineActiveClass,
  columnResizerLineClass,
  headerGaps,
  headerTextSizes,
  placeholderPaddings,
  rowHeightEstimates,
  rowSelectedClass,
  selectCheckboxSizes,
  selectColumnWidths,
  sortIconSizes,
  spinnerSizes,
  summaryRowClass,
} from './grDataTableStyles'

import IconArrowUp from '~icons/lucide/arrow-up'
import IconGripVertical from '~icons/lucide/grip-vertical'
import IconLoaderCircle from '~icons/lucide/loader-circle'
import IconArrowDown from '~icons/lucide/arrow-down'

/**
 * Ключ колонки. Собственные поля строки подсказываются автодополнением, но
 * произвольная строка тоже допустима: колонка может быть вычисляемой и жить
 * только в слоте `#cell-<key>`.
 */
export type GrDataColumnKey<TRow extends Record<string, unknown> = Record<string, unknown>>
  = | Extract<keyof TRow, string>
    | (string & {})

export type GrDataColumn<TRow extends Record<string, unknown> = Record<string, unknown>> = {
  key: GrDataColumnKey<TRow>
  label: string
  /**
   * Заголовок колонки сортирует.
   *
   * Сортируется **переданный массив `rows`**, и только он. Над серверной
   * пагинацией это врёт: «максимальное списание» покажет максимум по текущей
   * странице, а прочитается как максимум по журналу. Данные приходят
   * постранично — включайте `externalSort` и сортируйте запросом.
   */
  sortable?: boolean
  align?: 'left' | 'center' | 'right'
  /**
   * Ширина колонки: число — пиксели, строка — как есть (`'40%'`, `'12rem'`).
   *
   * Уезжает в заголовочную ячейку: при фиксированной раскладке ширины колонок
   * задаёт первая строка таблицы, а это и есть `<thead>`.
   */
  width?: string | number
  /**
   * Колонка липнет к краю при горизонтальной прокрутке.
   *
   * Закреплённые колонки всегда стоят своей группой у своего края — перенос
   * колонки из группы в группу запрещён, иначе «закреплена слева» перестало бы
   * означать «слева».
   */
  pinned?: 'left' | 'right'
}

/**
 * Значения итоговой строки по ключам колонок.
 *
 * Не строка набора: у итога нет ключа, он не сортируется и не выбирается.
 * Колонка, для которой значения нет, остаётся пустой ячейкой — заполнять все
 * колонки итог не обязан.
 */
export type GrDataTableSummary<TRow extends Record<string, unknown> = Record<string, unknown>>
  = Partial<Record<GrDataColumnKey<TRow>, unknown>>

export type GrDataTableRowKey<TRow extends Record<string, unknown> = Record<string, unknown>>
  = | string
    | ((row: TRow) => string | number)

/** Порядок обхода состояний сортировки по клику на заголовок. */
export type GrDataTableSortCycle = 'asc-desc' | 'asc-desc-none'

export interface GrDataTableProps<TRow extends Record<string, unknown> = Record<string, unknown>> {
  rows: TRow[]
  columns: GrDataColumn<TRow>[]
  /** Ключ строки или функция-резолвер. По умолчанию — поле `'id'`. */
  rowKey?: GrDataTableRowKey<TRow>
  /** Ключ колонки для начальной сортировки (uncontrolled-режим). */
  initialSortKey?: string
  /** Направление начальной сортировки (uncontrolled-режим). */
  initialSortDir?: GrDataTableSortDir
  /** Контролируемый ключ сортировки: `v-model:sortKey`. Задаёт controlled-режим. */
  sortKey?: string
  /** Контролируемое направление сортировки: `v-model:sortDir`. */
  sortDir?: GrDataTableSortDir
  /** Клик по заголовку: `asc → desc` или `asc → desc → без сортировки`. */
  sortCycle?: GrDataTableSortCycle
  /**
   * Внешняя сортировка (например серверная): компонент НЕ сортирует `rows`
   * сам, а только сообщает о смене через `update:sortKey`/`update:sortDir`/
   * `sortChange`. `rows` при этом должны приходить уже отсортированными.
   */
  externalSort?: boolean
  /**
   * Выбор строк: добавляет ведущую колонку с чекбоксами (+ «выбрать все» в шапке).
   * Выбранные ключи строк — через `v-model:selected`.
   */
  selectable?: boolean
  /** Контролируемый список выбранных ключей строк: `v-model:selected`. */
  selected?: Array<string | number>
  /** Предикат «строку можно выбрать». Невыбираемые строки не попадают и в «выбрать все». */
  selectableRow?: (row: TRow) => boolean
  /**
   * Состояние загрузки: тело таблицы заменяется строкой-индикатором.
   * `empty`-состояние при этом не показывается.
   */
  loading?: boolean
  /** Текст индикатора загрузки. i18n: fallback `gr.dataTable.loading`. */
  loadingText?: string
  /** Текст пустого состояния. i18n: fallback `gr.dataTable.empty`; слот `#empty` сильнее. */
  emptyText?: string
  /** Класс строки: общий для всех либо вычисляемый по строке. */
  rowClass?: string | ((row: TRow, index: number) => string | undefined)
  /** Произвольные атрибуты строки (`data-*`, `title`, …). */
  rowProps?: (row: TRow, index: number) => Record<string, unknown> | undefined
  /**
   * Итоговая строка в `<tfoot>`: значения по ключам колонок.
   *
   * Встаёт по той же колоночной сетке, что и тело, — с теми же паддингами,
   * выравниванием, ширинами и закреплением. Собранная руками в `#footer`, она
   * этих классов не получает (`GrTable` их принципиально не даёт) и разъезжается
   * с телом на первой же смене `size`.
   *
   * Итог не суммируется компонентом: что считать итогом — знает приложение.
   * Оформление ячейки — слот `#summary-<key>`.
   *
   * `null` равнозначен отсутствию: `totals ?? null` — обычная запись там, где
   * итог считается не всегда.
   */
  summaryRow?: GrDataTableSummary<TRow> | null
  /**
   * Размер таблицы: кегль, паддинги ячеек, стрелки сортировки и чекбоксы.
   * Прокидывается в `GrTable`.
   */
  size?: GrDataTableSize
  // Прокси к GrTable:
  caption?: string
  ariaLabel?: string
  ariaLabelledby?: string
  regionLabel?: string
  /** Прилипающий заголовок при вертикальном скролле (нужен `maxHeight`). */
  stickyHeader?: boolean
  /**
   * Виртуализация строк: в DOM живёт только окно вокруг вьюпорта. Высоту окна
   * задаёт `maxHeight`, без него окна прокрутки не существует.
   *
   * Включает фиксированную раскладку таблицы: ширина колонки считается по
   * содержимому всех строк, а в DOM их только окно — без фиксации колонки
   * прыгали бы на каждой прокрутке. Ширины стоит задать через `width` у
   * колонок, иначе фиксированная раскладка делит место поровну.
   */
  virtual?: boolean
  /** Максимальная высота таблицы (вертикальный скролл). Число — в пикселях. */
  maxHeight?: string | number
  /**
   * Пользовательский порядок колонок: в шапке появляется ручка переноса.
   * Колонка тянется указателем и двигается `Shift`+`←`/`→` с клавиатуры.
   */
  reorderableColumns?: boolean
  /**
   * Контролируемый порядок колонок — ключи в нужном порядке (`v-model:columnOrder`).
   * Не задан — порядок компонент помнит сам, начиная с порядка `columns`.
   */
  columnOrder?: string[]
  /**
   * Пользовательская ширина колонок: у правого края заголовка появляется ручка.
   * Тянется указателем, с клавиатуры — стрелками (паттерн window splitter).
   *
   * Включает фиксированную раскладку таблицы: без неё браузер пересчитывает
   * ширины по содержимому и заданная пользователем пропадает.
   */
  resizableColumns?: boolean
  /**
   * Контролируемые ширины в пикселях по ключу колонки (`v-model:columnWidths`).
   * Не заданы — ширины компонент помнит сам.
   */
  columnWidths?: Record<string, number>
}

export interface GrDataTableEmits<TRow extends Record<string, unknown> = Record<string, unknown>> {
  (e: 'update:sortKey', value: string): void
  (e: 'update:sortDir', value: GrDataTableSortDir): void
  (e: 'sortChange', value: { key: string, dir: GrDataTableSortDir }): void
  (e: 'update:selected', value: Array<string | number>): void
  (e: 'rowClick', payload: { row: TRow, index: number, event: MouseEvent }): void
  (e: 'update:columnOrder', value: string[]): void
  (e: 'columnReorder', payload: { key: string, from: number, to: number }): void
  (e: 'update:columnWidths', value: Record<string, number>): void
  (e: 'columnResize', payload: { key: string, width: number }): void
}

/**
 * `GrDataTable` — data-таблица поверх `GrTable` с сортировкой по клику
 * на заголовок и scoped-слотами ячеек (`#cell-<key>`), `#header-<key>`,
 * `#caption`, `#footer`, `#empty`, `#loading`.
 *
 * Итоговая строка объявляется пропом `summaryRow` и оформляется слотами
 * `#summary-<key>`: она встаёт по той же колоночной сетке, что и тело.
 *
 * `#footer` — для свободной разметки под итогом: несколько строк, примечание,
 * `colspan`. Рендерится внутрь того же `<tfoot>`, то есть его содержимое тоже
 * строки таблицы (`<tr><td>`), а скоуп отдаёт `columns` (в текущем порядке) и
 * `totalColumns` (с колонкой выбора).
 *
 * Сортировка, включая крайние случаи с пустыми и смешанными значениями, живёт
 * в `grDataTableSort.ts` — см. `docs/components/GrDataTable.md`.
 */
const props = withDefaults(defineProps<GrDataTableProps<TRow>>(), {
  rowKey: 'id' as GrDataTableRowKey<TRow>,
  initialSortKey: undefined,
  initialSortDir: 'asc',
  sortKey: undefined,
  sortDir: undefined,
  sortCycle: 'asc-desc',
  externalSort: false,
  selectable: false,
  selected: undefined,
  selectableRow: undefined,
  loading: false,
  loadingText: undefined,
  emptyText: undefined,
  rowClass: undefined,
  rowProps: undefined,
  summaryRow: undefined,
  size: undefined,
  caption: undefined,
  ariaLabel: undefined,
  ariaLabelledby: undefined,
  regionLabel: undefined,
  stickyHeader: false,
  maxHeight: undefined,
  virtual: false,
  reorderableColumns: false,
  columnOrder: undefined,
  resizableColumns: false,
  columnWidths: undefined,
})

// Раньше остальных проверок: таблица читает `rows` уже в setup, и гард,
// стоящий в хвосте, до предупреждения бы не дожил.
if (__GR_DEV__) {
  watchEffect(() => {
    if (!Array.isArray(props.rows)) {
      console.warn(
        `[granularity] GrDataTable: обязательный проп \`rows\` должен быть массивом — получено ${String(props.rows)}.`,
      )
    }

    if (!Array.isArray(props.columns)) {
      console.warn(
        `[granularity] GrDataTable: обязательный проп \`columns\` должен быть массивом — получено ${String(props.columns)}.`,
      )
    }
  })
}

const emit = defineEmits<GrDataTableEmits<TRow>>()

const { t, locale } = useGranularityTranslations()
const { announce } = useAnnouncer()
const resolvedLoadingText = computed(() => props.loadingText ?? t('gr.dataTable.loading', 'Loading…'))
const resolvedEmptyText = computed(() => props.emptyText ?? t('gr.dataTable.empty', 'No data'))

const {
  currentSortKey,
  currentSortDir,
  sortedRows,
  toggleSort,
  clearSort,
  ariaSortFor,
} = useDataTableSort<TRow>({
  rows: () => props.rows,
  sortKey: () => props.sortKey,
  sortDir: () => props.sortDir,
  initialSortKey: () => props.initialSortKey,
  initialSortDir: () => props.initialSortDir,
  externalSort: () => props.externalSort,
  sortCycle: () => props.sortCycle,
  locale: () => locale.value,
  onSortChange: (key, dir) => {
    emit('update:sortKey', key)
    emit('update:sortDir', dir)
    emit('sortChange', { key, dir })
  },
})

function cellAlign(col: GrDataColumn<TRow>): string {
  if (col.align === 'right')
    return 'text-right'
  if (col.align === 'center')
    return 'text-center'
  return 'text-left'
}

const { rowKeyValue } = useDataTableRowKeys<TRow>({ rowKey: () => props.rowKey })

/**
 * Подсказка «что сделает нажатие» — visually hidden текстом **после** подписи
 * колонки, а не `aria-label`'ом на кнопке. `aria-label` подменял бы собой имя
 * `<th>`, и AT при переходе по ячейкам вместо «Название» читала бы
 * «Отсортировано по Название по возрастанию, нажмите…». Текущее состояние
 * сортировки при этом объявляет `aria-sort` на самом `<th>`.
 */
function sortHint(col: GrDataColumn<TRow>): string {
  if (currentSortKey.value !== col.key)
    return t('gr.dataTable.sortAsc', 'Activate to sort ascending')

  if (currentSortDir.value === 'asc')
    return t('gr.dataTable.sortDesc', 'Activate to sort descending')

  return props.sortCycle === 'asc-desc-none'
    ? t('gr.dataTable.sortNone', 'Activate to remove sorting')
    : t('gr.dataTable.sortAsc', 'Activate to sort ascending')
}

const resolvedSize = useGrComponentSize(() => props.size, { component: 'GrDataTable' })

const cellClass = computed(() => cellPaddings[resolvedSize.value])
const placeholderClass = computed(() => placeholderPaddings[resolvedSize.value])
const headerTextClass = computed(() => headerTextSizes[resolvedSize.value])
const headerGapClass = computed(() => headerGaps[resolvedSize.value])
const selectColumnClass = computed(() => selectColumnWidths[resolvedSize.value])
const spinnerClass = computed(() => spinnerSizes[resolvedSize.value])
const sortIconSize = computed(() => sortIconSizes[resolvedSize.value])
const checkboxSize = computed(() => selectCheckboxSizes[resolvedSize.value])

/**
 * Номер строки и полное их число объявляем только при виртуализации: иначе
 * диктор считает строки по разметке, а там всего окно. Заголовок — строка
 * первая, поэтому строки набора начинаются со второй.
 */
/**
 * Итог показывается, только когда набор на экране: «Итого 1 234» над спиннером —
 * утверждение о том, чего ещё не показали. Пустой набор при этом итог не гасит:
 * «Итого 0» под «нет данных» осмысленно, и считает его потребитель.
 *
 * Предикат один на всех: шаблон, `aria-rowcount` и номер строки обязаны сходиться,
 * иначе диктор объявит строку, которой в разметке нет.
 */
const hasSummary = computed(() => props.summaryRow != null && !props.loading)

const ariaRowCount = computed(() => (
  props.virtual ? sortedRows.value.length + 1 + (hasSummary.value ? 1 : 0) : undefined
))

function ariaRowIndex(index: number): number | undefined {
  return props.virtual ? index + 2 : undefined
}

/** Итог идёт следующим номером за последней строкой набора. */
const summaryAriaRowIndex = computed(() => (
  props.virtual ? sortedRows.value.length + 2 : undefined
))

const isEmpty = computed(() => sortedRows.value.length === 0)

/**
 * Значение итога по ключу колонки. Как и `cellValue`, отдаёт сырое: отсутствие
 * ключа даёт пустую ячейку, а ноль — это значение, а не пустота.
 */
function summaryValue(key: string): unknown {
  return (props.summaryRow as Record<string, unknown> | undefined)?.[key]
}

// Общее число колонок с учётом ведущей чекбокс-колонки — для `colspan`
// строк loading/empty.
const totalColumns = computed(() => props.columns.length + (props.selectable ? 1 : 0))

// ————— Порядок колонок.

/**
 * Карты живут в компоненте, а не в модуле: наполняет их шаблон, а читают все
 * три колоночных модуля — порядок тянет за ячейку, ширина её замеряет,
 * раскладка считает по ней смещения закрепления.
 */
const headerCellEls = new Map<string, HTMLElement>()
const columnHandleEls = new Map<string, HTMLElement>()

function registerEl(store: Map<string, HTMLElement>, key: string, el: unknown): void {
  if (el instanceof HTMLElement) {
    store.set(key, el)
    return
  }

  // Перестановка размонтирует старую ячейку уже после того, как встала новая:
  // снимаем запись, только если она протухла.
  const previous = store.get(key)
  if (previous && !previous.isConnected)
    store.delete(key)
}

const {
  orderedColumns,
  columnKeys,
  draggingColumnKey,
  columnDropClass,
  onColumnHandleKeydown,
  columnSort,
  columnRoving,
} = useDataTableColumnOrder<TRow>({
  columns: () => props.columns,
  columnOrder: () => props.columnOrder,
  reorderableColumns: () => props.reorderableColumns,
  loading: () => props.loading,
  headerCellEls,
  columnHandleEls,
  onOrderChange: (order, moved) => {
    emit('update:columnOrder', order)
    emit('columnReorder', moved)
  },
  announceMove: (label, position, count) => {
    announce(t('gr.dataTable.columnMoved', 'Column {label} moved to position {position} of {count}', {
      label,
      position,
      count,
    }))
  },
})

const {
  columnWidths,
  setMeasuredWidths,
  widthOf,
  tableMinWidth,
  resizingKey,
  onResizerPointerDown,
  onResizerKeydown,
  resetColumnWidth,
  resizerValue,
} = useDataTableColumnWidths<TRow>({
  orderedColumns: () => orderedColumns.value,
  columnWidths: () => props.columnWidths,
  resizableColumns: () => props.resizableColumns,
  loading: () => props.loading,
  headerCellEls,
  onWidthsChange: widths => emit('update:columnWidths', widths),
  onColumnResize: (key, width) => emit('columnResize', { key, width }),
  announceWidth: (label, width) => {
    announce(t('gr.dataTable.columnResized', 'Column {label} is {width} pixels wide', { label, width }))
  },
})

const { hasPinnedLeft, pinnedStyleOf, pinnedCellClass } = useDataTableLayout<TRow>({
  orderedColumns: () => orderedColumns.value,
  columnKeys: () => columnKeys.value,
  selectable: () => props.selectable,
  resizableColumns: () => props.resizableColumns,
  headerCellEls,
  watchSources: () => [orderedColumns.value, columnWidths.value, props.loading, props.rows.length] as const,
  onMeasuredWidths: setMeasuredWidths,
})

const tableProps = computed(() => ({
  size: resolvedSize.value,
  ariaLabel: props.ariaLabel,
  ariaLabelledby: props.ariaLabelledby,
  regionLabel: props.regionLabel,
  stickyHeader: props.stickyHeader,
  maxHeight: props.maxHeight,
  rowCount: ariaRowCount.value,
  // Пользовательская ширина требует фиксированной раскладки: на авторазметке
  // браузер пересчитывает колонки по содержимому, и заданная ширина пропадает.
  fixedLayout: props.virtual || props.resizableColumns,
  tableMinWidth: tableMinWidth.value,
}))

function columnHandleLabel(col: GrDataColumn<TRow>): string {
  return t('gr.dataTable.moveColumn', 'Move column {label}', { label: col.label })
}

function resizerLabel(col: GrDataColumn<TRow>): string {
  return t('gr.dataTable.resizeColumn', 'Width of column {label}', { label: col.label })
}

// ————— Ширина колонок.

/** Уже колонки не бывает: в неё перестаёт помещаться даже стрелка сортировки. */

/**
 * Живой регион существует с первого рендера и пуст, пока объявлять нечего.
 * Регион, который появляется уже с текстом, часть AT не объявляет вовсе —
 * а именно так вело себя `role="status"` внутри строки загрузки.
 */
const liveMessage = computed(() => {
  if (props.loading)
    return resolvedLoadingText.value
  if (isEmpty.value)
    return resolvedEmptyText.value
  return ''
})

function cellValue(row: TRow, key: string): unknown {
  return (row as Record<string, unknown>)[key]
}

function rowClassName(row: TRow, index: number): string | undefined {
  const source = props.rowClass
  return typeof source === 'function' ? source(row, index) : source
}

function onRowClick(row: TRow, index: number, event: MouseEvent): void {
  emit('rowClick', { row, index, event })
}

// ————— Выбор строк.
// Uncontrolled-режим, как у сортировки выше: без `v-model:selected` чекбоксы
// рисовались, кликались и никогда не отмечались — состояние выбора целиком
// выводилось из пропа, а внутреннего не было вовсе.
const {
  isRowSelectable,
  isRowSelected,
  selectableRows,
  allSelected,
  someSelected,
  toggleRow,
  toggleAll,
} = useDataTableSelection<TRow>({
  rows: () => sortedRows.value,
  selected: () => props.selected,
  selectableRow: () => props.selectableRow,
  rowKeyValue,
  onSelectedChange: keys => emit('update:selected', keys),
})

// ————— Императивный API.
const tableRef = ref<InstanceType<typeof GrTable> | null>(null)
const rootId = useId()

function rootEl(): HTMLElement | null {
  return (tableRef.value?.$el as HTMLElement | undefined) ?? null
}

/** Скролл-контейнер таблицы — он же элемент с `maxHeight`. */
function scrollEl(): HTMLElement | null {
  const root = rootEl()
  return root?.matches('[data-gr-table-scroll]') ? root : root?.querySelector('[data-gr-table-scroll]') ?? null
}

/**
 * Виртуализация строк.
 *
 * Распорки здесь не псевдоэлементы, как у списочных компонентов: `<tbody>`
 * игнорирует `padding`, а псевдоэлемент внутри группы строк не образует строку
 * с управляемой высотой. Поэтому срезанное держат две служебные `<tr>` — той же
 * формы, что строки загрузки и пустоты у `GrTable`.
 */
const scrollContainer = ref<HTMLElement | null>(null)

onMounted(() => {
  scrollContainer.value = scrollEl()
})

const virtualizer = useVirtualList({
  container: scrollContainer,
  count: () => (props.virtual ? sortedRows.value.length : 0),
  // Сортировка и замена rows раздают индексы заново — замеры сбрасываются.
  source: () => sortedRows.value,
  itemSize: () => rowHeightEstimates[resolvedSize.value],
  // Скролл-контейнер живёт в `GrTable` и до монтирования недоступен: окно
  // первого рендера считается от объявленной высоты.
  viewportSize: () => (typeof props.maxHeight === 'number' ? props.maxHeight : undefined),
})

/** Строки к отрисовке вместе с их абсолютной позицией в наборе. */
const renderedRows = computed(() => {
  const rows = sortedRows.value
  if (!props.virtual)
    return rows.map((row, index) => ({ row, index }))

  const { start, end } = virtualizer.range.value
  return rows.slice(start, end).map((row, offset) => ({ row, index: start + offset }))
})

const spacerBefore = computed(() => (props.virtual ? virtualizer.offset.value : 0))
const spacerAfter = computed(() => (props.virtual ? virtualizer.offsetEnd.value : 0))

/** Ширина колонки: число трактуем как пиксели. */
function columnWidthStyle(width: string | number | undefined): Record<string, string> | undefined {
  if (width === undefined)
    return undefined
  return { width: typeof width === 'number' ? `${width}px` : width }
}

function scrollToRow(key: string | number, options?: ScrollIntoViewOptions): boolean {
  // Ключ строки — произвольная строка от потребителя, в селектор её не подставить:
  // сравниваем через `dataset`, а не собираем `[data-row-key="…"]` конкатенацией.
  const target = String(key)

  // Строки вне окна в DOM нет: без прокрутки виртуального списка поиск по
  // `dataset` вернул бы `undefined`, и метод молча отвечал бы «не нашёл».
  if (props.virtual) {
    const index = sortedRows.value.findIndex(row => String(rowKeyValue(row)) === target)
    if (index < 0)
      return false

    virtualizer.scrollToIndex(index)
    void nextTick(() => {
      // Вызов опциональный: отложенный `scrollIntoView` некому поймать, а в
      // среде без него (jsdom) это дало бы необработанный отказ промиса.
      findRowEl(target)?.scrollIntoView?.(options ?? { block: 'nearest' })
    })
    return true
  }

  const row = findRowEl(target)
  if (!row)
    return false

  row.scrollIntoView(options ?? { block: 'nearest' })
  return true
}

function findRowEl(rowKey: string): HTMLElement | undefined {
  // Ключ строки — произвольная строка от потребителя, в селектор её не
  // подставить: сравниваем через `dataset`, а не собираем селектор конкатенацией.
  const rows = rootEl()?.querySelectorAll<HTMLElement>('[data-gr-datatable-row]') ?? []
  return Array.prototype.find.call(rows, (el: HTMLElement) => el.dataset.rowKey === rowKey) as HTMLElement | undefined
}

function scrollTo(options: ScrollToOptions): void {
  scrollEl()?.scrollTo(options)
}

defineExpose({
  /** Прокрутить к строке по её ключу. `false` — строки нет в DOM. */
  scrollToRow,
  /** Прокрутить скролл-контейнер таблицы. */
  scrollTo,
  /** Снять сортировку (эквивалент третьего состояния). */
  clearSort,
  /** Отметить/снять все выбираемые строки. */
  toggleAll,
})

/**
 * Три семейства слотов по ключу колонки — `#cell-<key>` (`{ row, index }`),
 * `#header-<key>` (`{ column }`) и `#summary-<key>` (`{ value, column }`) —
 * попадают под общую индексную сигнатуру, а не под шаблонные.
 *
 * Шаблонные (`` `cell-${string}` ``) сужали бы тип слотов строже
 * `InternalSlots`, и дженерик-компонент переставал приниматься `h()`: ломался
 * бы рендер-функцией, оставаясь рабочим в шаблоне. Цена — пропсы этих трёх
 * семейств не типизированы; они описаны здесь и на странице компонента.
 */
defineSlots<{
  /** Подпись таблицы — `<caption>`, читается диктором первой. */
  caption?: () => any
  /** Содержимое, пока едут данные. */
  loading?: () => any
  /** Пустое состояние вместо текста по умолчанию. */
  empty?: () => any
  /** Подвал под таблицей: пагинация, счётчик, итоги во всю ширину. */
  footer?: (props: { columns: GrDataColumn<TRow>[], totalColumns: number }) => any
  [byColumn: string]: ((props?: any) => any) | undefined
}>()
</script>

<template>
  <GrTable
    v-bind="tableProps"
    ref="tableRef"
    data-gr-datatable
  >
    <!-- Caption рендерится всегда (у `GrTable` он `sr-only`): в нём живёт
         постоянный live-регион, иначе объявлять загрузку было бы нечему. -->
    <template #caption>
      <slot name="caption">
        {{ caption }}
      </slot>
      <span
        :id="`${rootId}-live`"
        data-gr-datatable-live
        role="status"
        aria-live="polite"
      >{{ liveMessage }}</span>
    </template>

    <template #header>
      <tr data-gr-datatable-header :aria-rowindex="virtual ? 1 : undefined">
        <th
          v-if="selectable"
          :ref="el => registerEl(headerCellEls, SELECT_COLUMN_KEY, el)"
          class="text-left"
          :class="[
            selectColumnClass,
            cellClass,
            hasPinnedLeft ? columnPinnedClass : '',
          ]"
          :style="hasPinnedLeft ? { left: '0px' } : undefined"
          scope="col"
        >
          <GrCheckbox
            data-gr-datatable-select-all
            :model-value="allSelected"
            :indeterminate="someSelected"
            :size="checkboxSize"
            :disabled="loading || selectableRows.length === 0"
            :aria-label="t('gr.dataTable.selectAll', 'Select all rows')"
            @update:model-value="toggleAll"
          />
        </th>
        <th
          v-for="(col, colIndex) in orderedColumns"
          :key="col.key"
          :ref="el => registerEl(headerCellEls, String(col.key), el)"
          class="font-700"
          :data-column-key="col.key"
          :class="[
            headerTextClass,
            cellClass,
            cellAlign(col),
            reorderableColumns || resizableColumns ? 'group relative' : '',
            draggingColumnKey === String(col.key) ? columnDraggingClass : '',
            columnDropClass(colIndex),
            ...pinnedCellClass(col, colIndex),
          ]"
          :style="{ ...columnWidthStyle(widthOf(col)), ...pinnedStyleOf(col) }"
          :aria-sort="ariaSortFor(col)"
          scope="col"
        >
          <div class="inline-flex items-center" :class="headerGapClass">
            <button
              v-if="reorderableColumns"
              :ref="el => registerEl(columnHandleEls, String(col.key), el)"
              type="button"
              data-gr-datatable-column-handle
              :class="[columnHandleClass, columnSort.isActive.value ? columnHandleActiveClass : '']"
              :tabindex="columnRoving.tabindexFor(String(col.key))"
              :aria-label="columnHandleLabel(col)"
              :disabled="loading"
              @pointerdown="columnSort.startFrom(String(col.key))($event)"
              @keydown="onColumnHandleKeydown($event, String(col.key))"
              @focus="columnRoving.setActive(String(col.key))"
              @click.stop
            >
              <IconGripVertical class="block" aria-hidden="true" />
            </button>
            <button
              v-if="col.sortable"
              type="button"
              data-gr-datatable-sort
              class="inline-flex items-center text-[var(--gr-muted-fg)] hover:text-[var(--gr-fg)] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--gr-ring)] rounded-[var(--gr-radius-sm)]"
              :class="headerGapClass"
              @click="toggleSort(col)"
            >
              <span>
                <slot :name="`header-${col.key}`" :column="col">
                  {{ col.label }}
                </slot>
              </span>
              <span class="sr-only">{{ sortHint(col) }}</span>
              <span class="inline-flex" aria-hidden="true">
                <GrIcon v-if="currentSortKey === col.key && currentSortDir === 'asc'" :size="sortIconSize">
                  <IconArrowUp />
                </GrIcon>
                <GrIcon v-else-if="currentSortKey === col.key && currentSortDir === 'desc'" :size="sortIconSize">
                  <IconArrowDown />
                </GrIcon>
              </span>
            </button>
            <span v-else class="text-[var(--gr-muted-fg)]">
              <slot :name="`header-${col.key}`" :column="col">
                {{ col.label }}
              </slot>
            </span>
          </div>

          <span
            v-if="resizableColumns"
            data-gr-datatable-column-resizer
            role="separator"
            tabindex="0"
            aria-orientation="vertical"
            :class="columnResizerClass"
            :aria-label="resizerLabel(col)"
            :aria-valuenow="resizerValue(col)"
            :aria-valuemin="MIN_COLUMN_WIDTH"
            :aria-valuetext="`${resizerValue(col)}px`"
            @pointerdown="onResizerPointerDown($event, String(col.key))"
            @keydown="onResizerKeydown($event, String(col.key))"
            @dblclick="resetColumnWidth(String(col.key))"
            @click.stop
          >
            <span
              :class="[
                columnResizerLineClass,
                columnResizerHoverClass,
                resizingKey === String(col.key) ? columnResizerLineActiveClass : '',
              ]"
              aria-hidden="true"
            />
          </span>
        </th>
      </tr>
    </template>

    <template v-if="loading">
      <tr data-gr-datatable-loading>
        <td :colspan="totalColumns" class="text-center text-[var(--gr-muted-fg)]" :class="placeholderClass">
          <slot name="loading">
            <span class="inline-flex items-center gap-2">
              <IconLoaderCircle class="block animate-spin" :class="spinnerClass" aria-hidden="true" />
              <span>{{ resolvedLoadingText }}</span>
            </span>
          </slot>
        </td>
      </tr>
    </template>
    <template v-else-if="isEmpty">
      <tr data-gr-datatable-empty>
        <td :colspan="totalColumns" class="text-center text-[var(--gr-muted-fg)]" :class="placeholderClass">
          <slot name="empty">
            {{ resolvedEmptyText }}
          </slot>
        </td>
      </tr>
    </template>
    <template v-else>
      <!--
        Распорки виртуального списка. У таблицы они строки, а не псевдоэлементы:
        `<tbody>` игнорирует `padding`, а псевдоэлемент внутри группы строк не
        образует строку с управляемой высотой. Форма та же, что у служебных
        строк загрузки и пустоты.
      -->
      <tr
        v-if="virtual && spacerBefore > 0"
        aria-hidden="true"
        data-gr-datatable-spacer="before"
        :style="{ pointerEvents: 'none' }"
      >
        <td :colspan="totalColumns" :style="{ height: `${spacerBefore}px`, padding: '0', border: '0' }" />
      </tr>

      <tr
        v-for="{ row, index } in renderedRows"
        :key="rowKeyValue(row)"
        :ref="(el) => virtual && virtualizer.measure(index, el as Element | null)"
        class="border-t border-[var(--gr-brd)]"
        :class="[
          isRowSelected(row) ? rowSelectedClass : '',
          rowClassName(row, index),
        ]"
        data-gr-datatable-row
        :data-row-key="rowKeyValue(row)"
        :data-selected="selectable && isRowSelected(row) ? 'true' : undefined"
        :aria-rowindex="ariaRowIndex(index)"
        v-bind="rowProps?.(row, index)"
        @click="onRowClick(row, index, $event)"
      >
      <td
        v-if="selectable"
        class="text-left"
        :class="[
          selectColumnClass,
          cellClass,
          hasPinnedLeft ? columnPinnedClass : '',
          hasPinnedLeft && isRowSelected(row) ? rowSelectedClass : '',
        ]"
        :style="hasPinnedLeft ? { left: '0px' } : undefined"
      >
        <!-- `.stop` на самом чекбоксе, а не на ячейке: гасить навигационный
             клик есть смысл только там, где стоит контрол выбора. Иначе
             служебная ячейка невыбираемой строки становится мёртвой зоной. -->
        <GrCheckbox
          v-if="isRowSelectable(row)"
          data-gr-datatable-select-row
          :model-value="isRowSelected(row)"
          :size="checkboxSize"
          :aria-label="t('gr.dataTable.selectRow', 'Select row')"
          @click.stop
          @update:model-value="toggleRow(row)"
        />
      </td>
      <td
        v-for="(col, colIndex) in orderedColumns"
        :key="col.key"
        :class="[
          cellClass,
          cellAlign(col),
          ...pinnedCellClass(col, colIndex),
          col.pinned && isRowSelected(row) ? rowSelectedClass : '',
        ]"
        :style="{ ...columnWidthStyle(widthOf(col)), ...pinnedStyleOf(col) }"
      >
          <slot :name="`cell-${col.key}`" :row="row" :index="index">
            <span>{{ cellValue(row, col.key) }}</span>
          </slot>
        </td>
      </tr>

      <tr
        v-if="virtual && spacerAfter > 0"
        aria-hidden="true"
        data-gr-datatable-spacer="after"
        :style="{ pointerEvents: 'none' }"
      >
        <td :colspan="totalColumns" :style="{ height: `${spacerAfter}px`, padding: '0', border: '0' }" />
      </tr>
    </template>

    <template v-if="$slots.footer || hasSummary" #footer>
      <!--
        Итог зеркалит ячейку тела теми же функциями, а не своими классами: у
        `GrTable` ячейки `<tfoot>` не оформлены принципиально, и собранная руками
        строка разъезжается с телом на первой же смене `size`. Индекс колонки
        обязателен — по нему `pinnedEdgeClass` находит край группы.
      -->
      <tr
        v-if="hasSummary"
        data-gr-datatable-summary
        :class="summaryRowClass"
        :aria-rowindex="summaryAriaRowIndex"
      >
        <td
          v-if="selectable"
          :class="[
            selectColumnClass,
            cellClass,
            hasPinnedLeft ? columnPinnedClass : '',
          ]"
          :style="hasPinnedLeft ? { left: '0px' } : undefined"
        />
        <td
          v-for="(col, colIndex) in orderedColumns"
          :key="col.key"
          :data-column-key="col.key"
          :class="[cellClass, cellAlign(col), ...pinnedCellClass(col, colIndex)]"
          :style="{ ...columnWidthStyle(widthOf(col)), ...pinnedStyleOf(col) }"
        >
          <slot :name="`summary-${col.key}`" :value="summaryValue(col.key)" :column="col">
            <span>{{ summaryValue(col.key) }}</span>
          </slot>
        </td>
      </tr>

      <slot name="footer" :columns="orderedColumns" :total-columns="totalColumns" />
    </template>
  </GrTable>
</template>
