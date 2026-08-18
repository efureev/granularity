
<script setup lang="ts" generic="TRow extends Record<string, unknown> = Record<string, unknown>">
import { computed, nextTick, onMounted, onUnmounted, ref, useId, watch } from 'vue'

import GrTable from '../GrTable/GrTable.vue'
import GrIcon from '../GrIcon/GrIcon.vue'
import GrCheckbox from '../GrCheckbox/GrCheckbox.vue'
import { useGrComponentSize } from '../GrConfigProvider/context'
import { useAnnouncer } from '../../composables/useAnnouncer'
import { useDragGesture } from '../../composables/useDragGesture'
import { useDragSort } from '../../composables/useDragSort'
import { useRovingFocus } from '../../composables/useRovingFocus'
import { useVirtualList } from '../../composables/useVirtualList'
import { insertionIndex, moveItem } from '../../composables/internal/dragSortGeometry'
import { useGranularityTranslations } from '../../internal/granularityI18n'
import { sortRows, type GrDataTableSortDir } from './grDataTableSort'
import {
  type GrDataTableSize,
  cellPaddings,
  columnDraggingClass,
  columnDropAfterClass,
  columnDropBeforeClass,
  columnHandleActiveClass,
  columnHandleClass,
  columnPinnedClass,
  columnPinnedLeftEdgeClass,
  columnPinnedRightEdgeClass,
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
export type GrDataColumnKey<TRow extends Record<string, unknown> = Record<string, unknown>> =
  | Extract<keyof TRow, string>
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
export type GrDataTableSummary<TRow extends Record<string, unknown> = Record<string, unknown>> =
  Partial<Record<GrDataColumnKey<TRow>, unknown>>

export type GrDataTableRowKey<TRow extends Record<string, unknown> = Record<string, unknown>> =
  | string
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

const emit = defineEmits<GrDataTableEmits<TRow>>()

const { t, locale } = useGranularityTranslations()
const { announce } = useAnnouncer()
const resolvedLoadingText = computed(() => props.loadingText ?? t('gr.dataTable.loading', 'Loading…'))
const resolvedEmptyText = computed(() => props.emptyText ?? t('gr.dataTable.empty', 'No data'))

// Uncontrolled-состояние; в controlled-режиме перекрывается пропами `sortKey`/`sortDir`.
const internalSortKey = ref<string>(props.initialSortKey ?? '')
const internalSortDir = ref<GrDataTableSortDir>(props.initialSortDir)

const isSortKeyControlled = computed(() => props.sortKey !== undefined)
const isSortDirControlled = computed(() => props.sortDir !== undefined)

const currentSortKey = computed(() => props.sortKey ?? internalSortKey.value)
const currentSortDir = computed<GrDataTableSortDir>(() => props.sortDir ?? internalSortDir.value)

function applySort(key: string, dir: GrDataTableSortDir): void {
  if (!isSortKeyControlled.value)
    internalSortKey.value = key
  if (!isSortDirControlled.value)
    internalSortDir.value = dir

  emit('update:sortKey', key)
  emit('update:sortDir', dir)
  emit('sortChange', { key, dir })
}

const sortedRows = computed(() => {
  // Внешняя сортировка: `rows` уже отсортированы потребителем — не трогаем.
  if (props.externalSort)
    return [...props.rows]

  const key = currentSortKey.value
  if (!key)
    return [...props.rows]

  return sortRows(props.rows, key, currentSortDir.value, locale.value)
})

function toggleSort(col: GrDataColumn<TRow>): void {
  if (!col.sortable)
    return

  if (currentSortKey.value !== col.key) {
    applySort(col.key, 'asc')
    return
  }

  if (currentSortDir.value === 'asc') {
    applySort(col.key, 'desc')
    return
  }

  // Третье состояние: сортировка снимается, порядок возвращается к исходному.
  if (props.sortCycle === 'asc-desc-none') {
    applySort('', 'asc')
    return
  }

  applySort(col.key, 'asc')
}

function cellAlign(col: GrDataColumn<TRow>): string {
  if (col.align === 'right')
    return 'text-right'
  if (col.align === 'center')
    return 'text-center'
  return 'text-left'
}

/**
 * Синтетические ключи для строк, у которых поле `rowKey` пустое.
 *
 * Без них строка получила бы `String(undefined ?? '')` — **один и тот же** ключ
 * на всю таблицу: Vue переиспользовал бы DOM не по назначению, а выбор одной
 * строки помечал бы выбранными все. Ключ привязан к идентичности объекта,
 * поэтому переживает сортировку и не зависит от индекса.
 */
const syntheticKeys = new WeakMap<object, string>()
let syntheticKeyCounter = 0
const missingKeyWarned = ref(false)

function syntheticRowKey(row: TRow): string {
  const existing = syntheticKeys.get(row)
  if (existing !== undefined)
    return existing

  syntheticKeyCounter += 1
  const generated = `gr-row-${syntheticKeyCounter}`
  syntheticKeys.set(row, generated)

  if (!missingKeyWarned.value && __GR_DEV__) {
    missingKeyWarned.value = true
    console.warn(
      `[GrDataTable] У строки нет значения по ключу "${String(props.rowKey)}". `
      + 'Задайте `rowKey` (поле или функцию) — иначе выбор строк и переиспользование '
      + 'DOM работают по синтетическому ключу, который не переживёт перезагрузку данных.',
    )
  }

  return generated
}

function rowKeyValue(row: TRow): string | number {
  const rk = props.rowKey
  if (typeof rk === 'function')
    return rk(row)

  const value = (row as Record<string, unknown>)[rk as string]
  if (typeof value === 'string' && value !== '')
    return value
  if (typeof value === 'number')
    return value

  return syntheticRowKey(row)
}

function ariaSortFor(col: GrDataColumn<TRow>): 'ascending' | 'descending' | 'none' | undefined {
  if (!col.sortable)
    return undefined
  if (currentSortKey.value !== col.key)
    return 'none'
  return currentSortDir.value === 'asc' ? 'ascending' : 'descending'
}

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

/** Uncontrolled-состояние; в controlled-режиме перекрывается пропом `columnOrder`. */
const internalColumnOrder = ref<string[]>(props.columns.map(col => String(col.key)))

/**
 * Колонки в пользовательском порядке.
 *
 * Состав задаёт `columns`, порядок — только порядок: ключ, которого в наборе
 * нет, игнорируется, а колонка, которой нет в порядке (её только что добавили),
 * встаёт в конец. Иначе правка `columns` теряла бы колонки молча.
 */
const orderedColumns = computed<GrDataColumn<TRow>[]>(() => {
  const order = props.columnOrder ?? internalColumnOrder.value
  const remaining = new Map(props.columns.map(col => [String(col.key), col]))
  const ordered: GrDataColumn<TRow>[] = []

  for (const key of order) {
    const col = remaining.get(key)
    if (!col) continue

    remaining.delete(key)
    ordered.push(col)
  }

  for (const col of props.columns) {
    if (remaining.has(String(col.key))) ordered.push(col)
  }

  // Закреплённые колонки стоят своими группами у своих краёв — иначе
  // «закреплена слева» не означало бы «слева». Сортировка устойчивая, поэтому
  // внутри группы порядок остаётся пользовательским.
  return ordered.sort((a, b) => pinGroupOf(a) - pinGroupOf(b))
})

/** Группа закрепления: 0 — слева, 1 — обычная колонка, 2 — справа. */
function pinGroupOf(col: GrDataColumn<TRow>): number {
  if (col.pinned === 'left') return 0
  if (col.pinned === 'right') return 2

  return 1
}

/**
 * Сумма заданных ширин — минимальная ширина таблицы.
 *
 * Без неё фиксированная раскладка вписывает таблицу в контейнер и делит место
 * пропорционально: колонка, которую пользователь растянул, ужимается обратно, а
 * горизонтальной прокрутки — той самой, ради которой закрепляют колонки, — не
 * возникает. Считается, только когда ширина известна у **всех** колонок: с
 * одной неизвестной сумма врала бы.
 */
const tableMinWidth = computed<number | undefined>(() => {
  const cols = orderedColumns.value
  if (cols.length === 0) return undefined

  let total = 0
  for (const col of cols) {
    const width = widthOf(col)
    if (typeof width !== 'number') return undefined

    total += width
  }

  return total
})

const columnKeys = computed(() => orderedColumns.value.map(col => String(col.key)))

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

function indexOfColumn(key: string): number {
  return columnKeys.value.indexOf(key)
}

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
  if (previous && !previous.isConnected) store.delete(key)
}

function applyColumnMove(from: number, to: number): void {
  const keys = columnKeys.value
  if (from < 0 || to < 0 || to >= keys.length || from === to) return
  if (!sameGroup(from, to)) return

  const key = keys[from]
  // Подпись берётся до перестановки: `orderedColumns` — computed, и после
  // записи порядка по индексу `from` стоит уже другая колонка.
  const label = orderedColumns.value[from]?.label ?? key
  const next = moveItem(keys, from, to)

  internalColumnOrder.value = next
  emit('update:columnOrder', next)
  emit('columnReorder', { key, from, to })

  announce(t('gr.dataTable.columnMoved', 'Column {label} moved to position {position} of {count}', {
    label,
    position: to + 1,
    count: keys.length,
  }))
}

const columnSort = useDragSort<string, number>({
  items: () => columnKeys.value,
  elementFor: key => headerCellEls.get(key) ?? null,
  orientation: () => 'horizontal',
  disabled: () => !props.reorderableColumns || props.loading,
  resolveTarget: (hit, source) => {
    const to = insertionIndex(hit, indexOfColumn(source), columnKeys.value.length)

    // Через границу закрепления не переносим: группы у краёв постоянны.
    return sameGroup(indexOfColumn(source), to) ? to : null
  },
  onDrop: (source, to) => applyColumnMove(indexOfColumn(source), to),
})

function sameGroup(from: number, to: number): boolean {
  const cols = orderedColumns.value
  if (!cols[from] || !cols[to]) return false

  return pinGroupOf(cols[from]) === pinGroupOf(cols[to])
}

/**
 * Кольцо роверного фокуса по ручкам: одна остановка `Tab` на всю шапку.
 * Иначе таблица из десяти колонок добавляла бы десять таб-стопов подряд.
 */
const columnRoving = useRovingFocus<string>({
  items: () => (props.reorderableColumns ? columnKeys.value : []),
  elementFor: key => columnHandleEls.get(key) ?? null,
  orientation: () => 'horizontal',
  wrap: () => false,
})

async function onColumnHandleKeydown(event: KeyboardEvent, key: string): Promise<void> {
  if (!props.reorderableColumns) return

  // `Shift` со стрелкой двигает колонку, голая стрелка — фокус между ручками.
  // Раскладка та же, что у переноса узла в `GrTree`.
  if (event.shiftKey && (event.key === 'ArrowLeft' || event.key === 'ArrowRight')) {
    event.preventDefault()

    const from = indexOfColumn(key)
    applyColumnMove(from, event.key === 'ArrowLeft' ? from - 1 : from + 1)

    // Шапка перерисовывается: без возврата фокуса следующий `Shift` было бы
    // некуда адресовать.
    await nextTick()
    await columnRoving.focusKey(key)
    return
  }

  columnRoving.handleNavigationKeys(event)
}

const draggingColumnKey = computed(() => (columnSort.mode.value === null ? null : columnSort.source.value))

/** Полоса места вставки — на колонке-соседе, со стороны движения. */
function columnDropClass(index: number): string {
  const target = columnSort.target.value
  if (!columnSort.isActive.value || target === null || target !== index) return ''

  const active = columnSort.source.value === null ? -1 : indexOfColumn(columnSort.source.value)
  if (index === active) return ''

  return target < active ? columnDropBeforeClass : columnDropAfterClass
}

const columnHandleLabel = (col: GrDataColumn<TRow>): string =>
  t('gr.dataTable.moveColumn', 'Move column {label}', { label: col.label })

// ————— Ширина колонок.

/** Уже колонки не бывает: в неё перестаёт помещаться даже стрелка сортировки. */
const MIN_COLUMN_WIDTH = 48
/** Шаг клавиатуры и крупный шаг — как у `GrSplitter`. */
const RESIZE_STEP = 16
const RESIZE_BIG_STEP = 48

const internalColumnWidths = ref<Record<string, number>>({})
const columnWidths = computed(() => props.columnWidths ?? internalColumnWidths.value)

/** Фактические ширины шапки: заполняются замером, см. `measureLayout`. */
const measuredColumnWidths = ref<Record<string, number>>({})

/** Ширина колонки: заданная пользователем сильнее объявленной в `columns`. */
function widthOf(col: GrDataColumn<TRow>): string | number | undefined {
  return columnWidths.value[String(col.key)] ?? col.width
}

const resizingKey = ref<string | null>(null)
let pendingResizeKey: string | null = null
let resizeStartX = 0
let resizeStartWidth = 0
let widthBeforeResize: number | undefined

function setColumnWidth(key: string, width: number): void {
  const next = { ...columnWidths.value, [key]: Math.max(MIN_COLUMN_WIDTH, Math.round(width)) }

  internalColumnWidths.value = next
  emit('update:columnWidths', next)
}

function announceWidth(key: string): void {
  const col = orderedColumns.value.find(item => String(item.key) === key)
  if (!col) return

  announce(t('gr.dataTable.columnResized', 'Column {label} is {width} pixels wide', {
    label: col.label,
    width: columnWidths.value[key] ?? 0,
  }))
}

const resizeGesture = useDragGesture({
  disabled: () => !props.resizableColumns || props.loading,
  onStart: (event) => {
    const key = pendingResizeKey
    const el = key === null ? null : headerCellEls.get(key)
    if (key === null || !el) return false

    resizeStartX = event.clientX
    // Стартовая ширина — измеренная, а не объявленная: колонка могла жить на
    // авторазметке, и тянуть её надо от того, что видно.
    resizeStartWidth = el.getBoundingClientRect().width
    widthBeforeResize = columnWidths.value[key]
    resizingKey.value = key
  },
  onMove: (event) => {
    if (resizingKey.value === null) return

    // Против выделения текста заголовка во время протяжки.
    event.preventDefault()
    setColumnWidth(resizingKey.value, resizeStartWidth + (event.clientX - resizeStartX))
  },
  onEnd: () => {
    const key = resizingKey.value
    resizingKey.value = null
    if (key === null) return

    emit('columnResize', { key, width: columnWidths.value[key] ?? Math.round(resizeStartWidth) })
    announceWidth(key)
  },
  onCancel: () => {
    const key = resizingKey.value
    resizingKey.value = null
    if (key === null) return

    // Оборванный жест возвращает ширину, которая была до нажатия.
    const next = { ...columnWidths.value }
    if (widthBeforeResize === undefined) delete next[key]
    else next[key] = widthBeforeResize

    internalColumnWidths.value = next
    emit('update:columnWidths', next)
  },
})

function onResizerPointerDown(event: PointerEvent, key: string): void {
  pendingResizeKey = key
  resizeGesture.start(event)
}

/** Сброс к авторазметке: колонка снова считается по содержимому. */
function resetColumnWidth(key: string): void {
  if (columnWidths.value[key] === undefined) return

  const next = { ...columnWidths.value }
  delete next[key]

  internalColumnWidths.value = next
  emit('update:columnWidths', next)
  emit('columnResize', { key, width: 0 })
}

function resizeByKeyboard(key: string, delta: number): void {
  const measured = headerCellEls.get(key)?.getBoundingClientRect().width ?? MIN_COLUMN_WIDTH
  const current = columnWidths.value[key] ?? measured

  setColumnWidth(key, current + delta)
  emit('columnResize', { key, width: columnWidths.value[key] ?? current })
  announceWidth(key)
}

function onResizerKeydown(event: KeyboardEvent, key: string): void {
  if (!props.resizableColumns || props.loading) return

  const step = event.shiftKey ? RESIZE_BIG_STEP : RESIZE_STEP

  if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
    event.preventDefault()
    resizeByKeyboard(key, event.key === 'ArrowLeft' ? -step : step)
    return
  }

  // Отдельной клавиши «авто» в паттерне нет, поэтому её роль берёт `Enter` —
  // тот же смысл, что двойной клик по ручке.
  if (event.key === 'Enter') {
    event.preventDefault()
    resetColumnWidth(key)
  }
}

function resizerLabel(col: GrDataColumn<TRow>): string {
  return t('gr.dataTable.resizeColumn', 'Width of column {label}', { label: col.label })
}

/**
 * Ручка ресайза — фокусируемый `separator`, а значит обязана называть текущее
 * значение с первого рендера, до всякого перетаскивания. Заданной ширины у
 * колонки может не быть вовсе (авторазметка), поэтому за значением идём к
 * измеренной; до замера остаётся объявленная в `columns`, а её тоже может не
 * быть — тогда минимум.
 */
function resizerValue(col: GrDataColumn<TRow>): number {
  const key = String(col.key)
  const declared = typeof col.width === 'number' ? col.width : undefined

  return columnWidths.value[key] ?? measuredColumnWidths.value[key] ?? declared ?? MIN_COLUMN_WIDTH
}

// ————— Закреплённые колонки.

/** Служебная колонка выбора в реестре ячеек: своего ключа у неё нет. */
const SELECT_COLUMN_KEY = '__select__'

const hasPinnedLeft = computed(() => orderedColumns.value.some(col => col.pinned === 'left'))
const pinnedOffsets = ref<Record<string, number>>({})

/**
 * Смещения липких колонок считаются по **измеренным** ширинам соседей: колонка
 * может жить на авторазметке, и тогда взять смещение больше неоткуда. Отсюда же
 * порядок: замер после отрисовки, а не в вычислении.
 */
function measurePinnedOffsets(): void {
  const next: Record<string, number> = {}
  const cols = orderedColumns.value

  let left = props.selectable && hasPinnedLeft.value
    ? headerCellEls.get(SELECT_COLUMN_KEY)?.getBoundingClientRect().width ?? 0
    : 0

  for (const col of cols) {
    if (col.pinned !== 'left') continue

    next[String(col.key)] = left
    left += headerCellEls.get(String(col.key))?.getBoundingClientRect().width ?? 0
  }

  let right = 0
  for (let index = cols.length - 1; index >= 0; index -= 1) {
    const col = cols[index]
    if (col.pinned !== 'right') continue

    next[String(col.key)] = right
    right += headerCellEls.get(String(col.key))?.getBoundingClientRect().width ?? 0
  }

  pinnedOffsets.value = next
}

function measureColumnWidths(): void {
  if (!props.resizableColumns) return

  const next: Record<string, number> = {}

  for (const col of orderedColumns.value) {
    const key = String(col.key)
    const width = headerCellEls.get(key)?.getBoundingClientRect().width

    if (width) next[key] = Math.round(width)
  }

  measuredColumnWidths.value = next
}

function measureLayout(): void {
  measurePinnedOffsets()
  measureColumnWidths()
}

function pinnedStyleOf(col: GrDataColumn<TRow>): Record<string, string> | undefined {
  if (!col.pinned) return undefined

  const offset = pinnedOffsets.value[String(col.key)] ?? 0

  return col.pinned === 'left' ? { left: `${offset}px` } : { right: `${offset}px` }
}

/** Тень рисует только крайняя колонка группы — иначе полос было бы столько же, сколько колонок. */
function pinnedEdgeClass(col: GrDataColumn<TRow>, index: number): string {
  if (col.pinned === 'left') return orderedColumns.value[index + 1]?.pinned === 'left' ? '' : columnPinnedLeftEdgeClass
  if (col.pinned === 'right') return orderedColumns.value[index - 1]?.pinned === 'right' ? '' : columnPinnedRightEdgeClass

  return ''
}

function pinnedCellClass(col: GrDataColumn<TRow>, index: number): string[] {
  if (!col.pinned) return []

  return [columnPinnedClass, pinnedEdgeClass(col, index)]
}

/**
 * Ширину колонки меняет не только правка пропов: окно, шрифт и содержимое
 * ячейки двигают её сами. `ResizeObserver` — единственный способ узнать об этом;
 * в jsdom и на сервере его нет, там хватает пересчёта по изменению данных.
 */
let layoutObserver: ResizeObserver | null = null

onMounted(() => {
  measureLayout()

  if (typeof ResizeObserver === 'undefined') return

  layoutObserver = new ResizeObserver(() => measureLayout())
  const el = headerCellEls.get(SELECT_COLUMN_KEY) ?? headerCellEls.get(columnKeys.value[0])
  if (el?.parentElement) layoutObserver.observe(el.parentElement)
})

onUnmounted(() => {
  layoutObserver?.disconnect()
  layoutObserver = null
})

watch(
  () => [orderedColumns.value, columnWidths.value, props.loading, props.rows.length] as const,
  () => void nextTick(measureLayout),
)

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
const internalSelected = ref<Array<string | number>>([])
const isSelectedControlled = computed(() => props.selected !== undefined)

const selectedKeys = computed<Set<string | number>>(
  () => new Set(props.selected ?? internalSelected.value),
)

function isRowSelectable(row: TRow): boolean {
  return props.selectableRow ? props.selectableRow(row) : true
}

function isRowSelected(row: TRow): boolean {
  return selectedKeys.value.has(rowKeyValue(row))
}

/** «Выбрать все» работает по видимым и выбираемым строкам — они же считают состояние шапки. */
const selectableRows = computed(() => sortedRows.value.filter(isRowSelectable))

const allSelected = computed(() =>
  selectableRows.value.length > 0 && selectableRows.value.every(isRowSelected),
)
const someSelected = computed(() =>
  selectableRows.value.some(isRowSelected) && !allSelected.value,
)

function emitSelected(next: Set<string | number>): void {
  if (!isSelectedControlled.value)
    internalSelected.value = [...next]

  emit('update:selected', [...next])
}

function toggleRow(row: TRow): void {
  if (!isRowSelectable(row))
    return

  const key = rowKeyValue(row)
  const next = new Set(selectedKeys.value)
  if (next.has(key))
    next.delete(key)
  else
    next.add(key)
  emitSelected(next)
}

function toggleAll(): void {
  const next = new Set(selectedKeys.value)

  if (allSelected.value) {
    // Снимаем выбор только с видимых строк, сохраняя внешние ключи.
    for (const row of selectableRows.value) next.delete(rowKeyValue(row))
    emitSelected(next)
    return
  }

  for (const row of selectableRows.value) next.add(rowKeyValue(row))
  emitSelected(next)
}

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
  if (!props.virtual) return rows.map((row, index) => ({ row, index }))

  const { start, end } = virtualizer.range.value
  return rows.slice(start, end).map((row, offset) => ({ row, index: start + offset }))
})

const spacerBefore = computed(() => (props.virtual ? virtualizer.offset.value : 0))
const spacerAfter = computed(() => (props.virtual ? virtualizer.offsetEnd.value : 0))

/** Ширина колонки: число трактуем как пиксели. */
function columnWidthStyle(width: string | number | undefined): Record<string, string> | undefined {
  if (width === undefined) return undefined
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
    if (index < 0) return false

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

const scrollTo = (options: ScrollToOptions): void => {
  scrollEl()?.scrollTo(options)
}

function clearSort(): void {
  applySort('', 'asc')
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
