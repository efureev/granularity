
<script setup lang="ts" generic="TRow extends Record<string, unknown> = Record<string, unknown>">
import { computed, nextTick, onMounted, ref, useId } from 'vue'

import GrTable from '../GrTable/GrTable.vue'
import GrIcon from '../GrIcon/GrIcon.vue'
import GrCheckbox from '../GrCheckbox/GrCheckbox.vue'
import { useGrComponentSize } from '../GrConfigProvider/context'
import { useVirtualList } from '../../composables/useVirtualList'
import { useGranularityTranslations } from '../../internal/granularityI18n'
import { sortRows, type GrDataTableSortDir } from './grDataTableSort'
import {
  type GrDataTableSize,
  cellPaddings,
  headerGaps,
  headerTextSizes,
  placeholderPaddings,
  rowHeightEstimates,
  selectCheckboxSizes,
  selectColumnWidths,
  sortIconSizes,
  spinnerSizes,
} from './grDataTableStyles'

import IconArrowUp from '~icons/lucide/arrow-up'
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
  sortable?: boolean
  align?: 'left' | 'center' | 'right'
  /**
   * Ширина колонки: число — пиксели, строка — как есть (`'40%'`, `'12rem'`).
   *
   * Уезжает в заголовочную ячейку: при фиксированной раскладке ширины колонок
   * задаёт первая строка таблицы, а это и есть `<thead>`.
   */
  width?: string | number
}

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
}

export interface GrDataTableEmits<TRow extends Record<string, unknown> = Record<string, unknown>> {
  (e: 'update:sortKey', value: string): void
  (e: 'update:sortDir', value: GrDataTableSortDir): void
  (e: 'sortChange', value: { key: string, dir: GrDataTableSortDir }): void
  (e: 'update:selected', value: Array<string | number>): void
  (e: 'rowClick', payload: { row: TRow, index: number, event: MouseEvent }): void
}

/**
 * `GrDataTable` — data-таблица поверх `GrTable` с сортировкой по клику
 * на заголовок и scoped-слотами ячеек (`#cell-<key>`), `#header-<key>`,
 * `#caption`, `#foot`, `#empty`, `#loading`.
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
  size: undefined,
  caption: undefined,
  ariaLabel: undefined,
  ariaLabelledby: undefined,
  regionLabel: undefined,
  stickyHeader: false,
  maxHeight: undefined,
  virtual: false,
})

const emit = defineEmits<GrDataTableEmits<TRow>>()

const { t, locale } = useGranularityTranslations()
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

  if (!missingKeyWarned.value && process.env.NODE_ENV !== 'production') {
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
const ariaRowCount = computed(() => (props.virtual ? sortedRows.value.length + 1 : undefined))

function ariaRowIndex(index: number): number | undefined {
  return props.virtual ? index + 2 : undefined
}

const tableProps = computed(() => ({
  size: resolvedSize.value,
  ariaLabel: props.ariaLabel,
  ariaLabelledby: props.ariaLabelledby,
  regionLabel: props.regionLabel,
  stickyHeader: props.stickyHeader,
  maxHeight: props.maxHeight,
  rowCount: ariaRowCount.value,
  fixedLayout: props.virtual,
}))

const isEmpty = computed(() => sortedRows.value.length === 0)

// Общее число колонок с учётом ведущей чекбокс-колонки — для `colspan`
// строк loading/empty.
const totalColumns = computed(() => props.columns.length + (props.selectable ? 1 : 0))

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

    <template #head>
      <tr data-gr-datatable-header :aria-rowindex="virtual ? 1 : undefined">
        <th
          v-if="selectable"
          class="text-left"
          :class="[selectColumnClass, cellClass]"
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
          v-for="col in columns"
          :key="col.key"
          class="font-700"
          :class="[headerTextClass, cellClass, cellAlign(col)]"
          :style="columnWidthStyle(col.width)"
          :aria-sort="ariaSortFor(col)"
          scope="col"
        >
          <div class="inline-flex items-center" :class="headerGapClass">
            <button
              v-if="col.sortable"
              type="button"
              data-gr-datatable-sort
              class="inline-flex items-center text-[var(--gr-muted-fg)] hover:text-[var(--gr-fg)] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--gr-ring)] rounded"
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
        </th>
      </tr>
    </template>

    <template v-if="loading">
      <tr data-gr-datatable-loading>
        <td :colspan="totalColumns" class="text-center text-[var(--gr-muted-fg)]" :class="placeholderClass">
          <slot name="loading">
            <span class="inline-flex items-center gap-2">
              <span class="i-lucide-loader-circle block animate-spin" :class="spinnerClass" aria-hidden="true" />
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
          isRowSelected(row) ? 'bg-[color-mix(in_srgb,var(--gr-primary)_8%,transparent)]' : '',
          rowClassName(row, index),
        ]"
        data-gr-datatable-row
        :data-row-key="rowKeyValue(row)"
        :data-selected="selectable && isRowSelected(row) ? 'true' : undefined"
        :aria-rowindex="ariaRowIndex(index)"
        v-bind="rowProps?.(row, index)"
        @click="onRowClick(row, index, $event)"
      >
      <td v-if="selectable" class="text-left" :class="[selectColumnClass, cellClass]">
        <GrCheckbox
          v-if="isRowSelectable(row)"
          data-gr-datatable-select-row
          :model-value="isRowSelected(row)"
          :size="checkboxSize"
          :aria-label="t('gr.dataTable.selectRow', 'Select row')"
          @update:model-value="toggleRow(row)"
        />
      </td>
      <td
        v-for="col in columns"
        :key="col.key"
        :class="[cellClass, cellAlign(col)]"
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

    <template v-if="$slots.foot" #foot>
      <slot name="foot" />
    </template>
  </GrTable>
</template>
