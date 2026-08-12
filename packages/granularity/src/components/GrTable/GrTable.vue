<script setup lang="ts">
import { computed, ref, useSlots } from 'vue'

import { useGrComponentSize } from '../GrConfigProvider/context'
import GrSkeleton from '../GrSkeleton/GrSkeleton.vue'
import { hasMeaningfulSlotContent } from '../shared/slotNodes'
import { useGranularityTranslations } from '../../internal/granularityI18n'
import {
  emptyCellClass,
  hoverableClass,
  loadingRowCellClass,
  stripedClass,
  tableSizes,
  type GrTableSize,
} from './grTableStyles'

export interface GrTableProps {
  /**
   * Размер таблицы — базовый кегль текста. Паддинги ячеек оставлены за
   * консьюмером (GrTable — «тонкий» контейнер).
   */
  size?: GrTableSize
  /**
   * Текст caption для screen reader'ов. Рендерится как `<caption class="sr-only">`,
   * если не передан слот `#caption`.
   */
  caption?: string
  /** Прямой ARIA-label для `<table>`. Игнорируется, если задан `ariaLabelledby`. */
  ariaLabel?: string
  /** ID элемента-заголовка, связанного с `<table>` через `aria-labelledby`. */
  ariaLabelledby?: string
  /**
   * ARIA-label для скролл-контейнера. Включает `role="region"`; сам скролл
   * достижим с клавиатуры всегда, независимо от метки.
   */
  regionLabel?: string
  /** Идёт загрузка: вместо строк — скелетоны, контейнер помечен `aria-busy`. */
  loading?: boolean
  /** Сколько строк-заглушек показать при `loading`. */
  loadingRows?: number
  /** Сколько колонок занимает служебная строка (пустое состояние и скелетоны). */
  columnCount?: number
  /** Текст пустого состояния. Слот `#empty` сильнее. */
  emptyText?: string
  /** Таблица пуста. По умолчанию определяется по содержимому слота. */
  empty?: boolean
  /** Чередование строк. */
  striped?: boolean
  /** Подсветка строки под курсором. */
  hoverable?: boolean
  /**
   * Прилипающий заголовок: `<thead>` остаётся видимым при вертикальном скролле.
   * Осмысленно вместе с `maxHeight` (иначе таблица не скроллится вертикально).
   */
  stickyHeader?: boolean
  /**
   * Полное число строк набора, включая строки заголовка (`aria-rowcount`).
   *
   * Нужен, когда в DOM не весь набор — например, при виртуализации: диктор
   * считает строки по разметке и объявил бы «5 из 20» на таблице в десять
   * тысяч. Строки при этом обязаны нести `aria-rowindex`.
   */
  rowCount?: number
  /**
   * Фиксированная раскладка (`table-layout: fixed`): ширины колонок берутся из
   * первой строки, а не из содержимого всех.
   *
   * Обязателен, если в DOM не весь набор: иначе ширины считаются по
   * отрисованному окну и прыгают на каждой прокрутке.
   *
   * Класс — arbitrary-значение, а не `table-fixed`: такого правила в
   * `presetMini` нет, и класс молча не превратился бы в CSS.
   */
  fixedLayout?: boolean
  /**
   * Минимальная ширина самой таблицы (число — пиксели).
   *
   * Нужна при `fixedLayout`: с фиксированной раскладкой и шириной `auto`
   * браузер вписывает таблицу в контейнер и делит место между колонками
   * пропорционально — то есть заданные ширины молча ужимаются, а
   * горизонтальной прокрутки, на которой держатся закреплённые колонки, не
   * возникает вовсе.
   */
  tableMinWidth?: string | number
  /**
   * Максимальная высота скролл-контейнера (включает вертикальный скролл).
   * Число трактуется как пиксели. Нужен для работы `stickyHeader`.
   */
  maxHeight?: string | number
}

/**
 * `GrTable` — «тонкий» GR-контейнер для табличных данных.
 *
 * Рендерит `<table>` внутри скролл-обёртки и даёт слоты `#caption`, `#header`,
 * default (tbody) и `#footer`. Стили ячеек (`<th>`/`<td>` паддинги, выравнивание)
 * оставлены на консьюмере.
 *
 * ВАЖНО: `min-w-full` сам по себе не даст горизонтального скролла. Для него
 * консьюмеру нужны `white-space: nowrap` на ячейках или явные ширины колонок.
 */
const props = withDefaults(defineProps<GrTableProps>(), {
  size: undefined,
  caption: undefined,
  ariaLabel: undefined,
  ariaLabelledby: undefined,
  regionLabel: undefined,
  loading: false,
  loadingRows: 3,
  columnCount: 1,
  emptyText: undefined,
  empty: undefined,
  striped: false,
  hoverable: false,
  stickyHeader: false,
  maxHeight: undefined,
  rowCount: undefined,
  fixedLayout: false,
  tableMinWidth: undefined,
})

const slots = useSlots()

const resolvedSize = useGrComponentSize(() => props.size, { component: 'GrTable' })
const tableTextClass = computed(() => tableSizes[resolvedSize.value])
const hasCaption = computed(() => Boolean(slots.caption) || Boolean(props.caption))

const { t } = useGranularityTranslations()
const resolvedEmptyText = computed(() => props.emptyText ?? t('gr.table.empty', 'Nothing here yet'))

// Пустоту видно по слоту: `v-for` по пустому массиву оставляет фрагмент без
// узлов, `v-if` — комментарий, и ни то ни другое строкой не является.
const isEmpty = computed(() => {
  if (props.empty !== undefined)
    return props.empty

  return !hasMeaningfulSlotContent(slots.default?.() ?? [])
})

const showRows = computed(() => !props.loading && !isEmpty.value)
const loadingRowCount = computed(() => Math.max(1, Math.trunc(props.loadingRows)))
const serviceColSpan = computed(() => Math.max(1, Math.trunc(props.columnCount)))

const tbodyClass = computed(() => [
  'text-[var(--gr-fg)]',
  props.striped && showRows.value ? stripedClass : '',
  props.hoverable && showRows.value ? hoverableClass : '',
].filter(Boolean).join(' '))

const scrollStyle = computed(() => {
  // Неполный набор в DOM (`rowCount`) означает виртуализацию, а с ней обязан
  // быть выключен браузерный scroll anchoring: он подправляет `scrollTop`,
  // когда меняется высота содержимого выше видимого узла, — а окно меняет её
  // на каждом кадре прокрутки, и список уезжает.
  const anchor = props.rowCount === undefined ? undefined : { overflowAnchor: 'none' as const }

  if (props.maxHeight === undefined)
    return anchor

  const value = typeof props.maxHeight === 'number' ? `${props.maxHeight}px` : props.maxHeight
  return { ...anchor, maxHeight: value, overflowY: 'auto' as const }
})

// Прилипающий заголовок: `<thead>` на `position: sticky`; фон обязателен, иначе
// сквозь него будут просвечивать строки при скролле.
const theadClass = computed(() => [
  'bg-[var(--gr-muted)] text-[var(--gr-muted-fg)]',
  props.stickyHeader ? 'sticky top-0 z-[1]' : '',
].filter(Boolean).join(' '))

const tableStyle = computed(() => {
  if (props.tableMinWidth === undefined) return undefined

  const value = typeof props.tableMinWidth === 'number' ? `${props.tableMinWidth}px` : props.tableMinWidth

  return { minWidth: value }
})

const scrollEl = ref<HTMLElement | null>(null)

function scrollTo(options: ScrollToOptions): void {
  scrollEl.value?.scrollTo(options)
}

// Только верхний уровень собственного tbody: вложенная таблица в ячейке не
// должна сдвигать индексацию строк.
function contentRows(): HTMLElement[] {
  if (!showRows.value) return []
  const el = scrollEl.value
  if (!el) return []
  return Array.from(el.querySelectorAll<HTMLElement>(':scope > table > tbody > tr'))
}

function scrollToRow(index: number, options?: ScrollIntoViewOptions): boolean {
  const row = contentRows()[index]
  if (!row) return false
  row.scrollIntoView(options ?? { block: 'nearest' })
  return true
}

defineExpose({
  /** Прокрутить скролл-контейнер таблицы — тот же контракт, что у `GrDataTable`. */
  scrollTo,
  /** Прокрутить к строке содержимого по её индексу в разметке. `false` — строки нет в DOM. */
  scrollToRow,
})
</script>

<template>
  <div
    ref="scrollEl"
    data-gr-table-scroll
    :role="regionLabel ? 'region' : undefined"
    :aria-label="regionLabel"
    :aria-busy="loading ? 'true' : undefined"
    tabindex="0"
    class="overflow-x-auto rounded-[var(--gr-radius-lg)] border border-[var(--gr-brd)] bg-[var(--gr-card)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--gr-ring)]"
    :style="scrollStyle"
  >
    <table
      data-gr-table
      class="min-w-full" :class="[tableTextClass, fixedLayout ? '[table-layout:fixed]' : '']"
      :style="tableStyle"
      :aria-label="ariaLabelledby ? undefined : ariaLabel"
      :aria-labelledby="ariaLabelledby"
      :aria-rowcount="rowCount"
    >
      <caption v-if="hasCaption" class="sr-only">
        <slot name="caption">
{{ caption }}
</slot>
      </caption>
      <thead :class="theadClass">
        <slot name="header" />
      </thead>
      <tbody :class="tbodyClass">
        <template v-if="loading">
          <slot name="loading">
            <tr v-for="row in loadingRowCount" :key="row" data-gr-table-loading-row>
              <td :colspan="serviceColSpan" :class="loadingRowCellClass">
                <GrSkeleton />
              </td>
            </tr>
          </slot>
        </template>

        <tr v-else-if="isEmpty" data-gr-table-empty>
          <td :colspan="serviceColSpan" :class="emptyCellClass">
            <slot name="empty">
              {{ resolvedEmptyText }}
            </slot>
          </td>
        </tr>

        <slot v-else />
      </tbody>
      <tfoot v-if="slots.footer" class="text-[var(--gr-fg)]">
        <slot name="footer" />
      </tfoot>
    </table>
  </div>
</template>
