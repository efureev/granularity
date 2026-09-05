<script setup lang="ts">
import { computed, ref, useAttrs, watch, watchEffect } from 'vue'

import { useGranularityTranslations } from '../../internal/granularityI18n'
import GrButton from '../GrButton/GrButton.vue'
import GrSelect from '../GrSelect/GrSelect.vue'
import { useGrComponentSize } from '../GrConfigProvider/context'
import {
  type GrPaginationSize,
  ellipsisSizes,
  jumperSizes,
  labelSizes,
  navButtonSizes,
  pageListGaps,
  pageBoxSizes,
  pageSizeSelectWidths,
  rowGaps,
} from './grPaginationStyles'

/**
 * Пропы пагинации.
 *
 * `total` интерпретируется как общее количество элементов; число страниц
 * вычисляется из `total` и `pageSize`. Номера усекаются многоточием
 * (алгоритм boundary/sibling, как у MUI): всегда видны первая/последняя страница
 * и `siblingCount` соседей вокруг текущей.
 */
/**
 * Вариант размера страницы: число либо пара «значение + подпись».
 *
 * Пара нужна там, где подпись не равна числу («50 / стр.», «Все»): собрать её
 * из голого `number[]` было нельзя, а обходной путь — свой `GrSelect` рядом —
 * терял связь с пагинацией.
 */
export type GrPaginationPageSizeOption = number | { value: number, label: string }

export interface GrPaginationProps {
  page: number
  pageSize: number
  total: number
  /**
   * Варианты размера страницы. Число — подпись равна значению; пара — своя
   * подпись при том же значении («50 / стр.»), которую иначе было не собрать.
   */
  pageSizes?: GrPaginationPageSizeOption[]
  /** Сколько соседних страниц показывать вокруг текущей. По умолчанию `1`. */
  siblingCount?: number
  /** Сколько крайних страниц всегда показывать с каждого края. По умолчанию `1`. */
  boundaryCount?: number
  /**
   * Компактный вариант: вместо нумерованных страниц показывается индикатор
   * «текущая / всего» — удобно для узких мест (мобайл, тулбары таблиц).
   */
  compact?: boolean
  /** Показывать поле «перейти к странице» с быстрым переходом по вводу номера. */
  showJumper?: boolean
  /** Показывать селект размера страницы. */
  showPageSize?: boolean
  /** Показывать диапазон показанных элементов — «1–20 из 137». Слот `#total` сильнее. */
  showTotal?: boolean
  /** i18n-подпись перед полем перехода. По умолчанию — `gr.pagination.jumpTo`. */
  jumperLabel?: string
  /**
   * Имя навигационного лендмарка. По умолчанию — `gr.pagination.label`; задавать
   * стоит там, где пагинаций на странице несколько и их надо различать.
   */
  ariaLabel?: string
  /** Гасит всю пагинацию: номера, кнопки, селект размера и поле перехода. */
  disabled?: boolean
  size?: GrPaginationSize
}

export interface GrPaginationEmits {
  (e: 'update:page', value: number): void
  (e: 'update:pageSize', value: number): void
}

const { t } = useGranularityTranslations()

const props = withDefaults(defineProps<GrPaginationProps>(), {
  pageSizes: () => [10, 20, 50],
  siblingCount: 1,
  boundaryCount: 1,
  compact: false,
  showJumper: false,
  showPageSize: false,
  showTotal: false,
  jumperLabel: undefined,
  ariaLabel: undefined,
  disabled: false,
  size: undefined,
})

defineSlots<{
  /** Диапазон показанных элементов целиком — вместо строки из локали. */
  total?: (props: { from: number, to: number, total: number }) => unknown
}>()

const resolvedSize = useGrComponentSize(() => props.size, { component: 'GrPagination' })

const rowClass = computed(() => rowGaps[resolvedSize.value])
const pageListClass = computed(() => pageListGaps[resolvedSize.value])
const pageClass = computed(() => pageBoxSizes[resolvedSize.value])
const jumperClass = computed(() => jumperSizes[resolvedSize.value])
const ellipsisClass = computed(() => ellipsisSizes[resolvedSize.value])
const labelClass = computed(() => labelSizes[resolvedSize.value])
const selectWrapClass = computed(() => pageSizeSelectWidths[resolvedSize.value])
const navButtonSize = computed(() => navButtonSizes[resolvedSize.value])

const emit = defineEmits<GrPaginationEmits>()

// Обязательный проп может не доехать — промах вызова, асинхронный стор, —
// и `Math.trunc(undefined)` разнёс бы `NaN` по номерам, статусу и диапазону.
// Разметка при этом остаётся правдоподобной на вид, поэтому нечисловое
// значение подменяется дефолтом, а dev-гард в конце файла называет виновника.
function toFiniteInt(value: number, fallback: number): number {
  return Number.isFinite(value) ? Math.trunc(value) : fallback
}

// Делитель клампится: `pageSize: 0` дал бы `Infinity` страниц и бесконечный
// цикл в `range()`.
const resolvedPageSize = computed(() => Math.max(1, toFiniteInt(props.pageSize, 1)))
const resolvedTotal = computed(() => Math.max(0, toFiniteInt(props.total, 0)))
const pageCount = computed(() => Math.max(1, Math.ceil(resolvedTotal.value / resolvedPageSize.value)))

// Рендер идёт от зажатого номера: вотчер ниже просит родителя подтянуть `page`,
// но на первом рендере он молчит, и без клампа пагинация осталась бы вовсе без
// активной страницы.
const currentPage = computed(() => Math.min(Math.max(toFiniteInt(props.page, 1), 1), pageCount.value))

// Контролируемый компонент: если `total`/`pageSize` уменьшились и текущая `page`
// вышла за диапазон — просим родителя подтянуть её к последней странице.
watch(pageCount, (count) => {
  if (props.page > count)
    emit('update:page', count)
})

const pageSizeModel = computed({
  get: () => String(props.pageSize),
  set: (value: string) => emit('update:pageSize', Number(value)),
})

const pageSizeOptions = computed(() =>
  props.pageSizes.map(option => (typeof option === 'number'
    ? { value: String(option), label: String(option) }
    : { value: String(option.value), label: option.label })),
)

const rangeFrom = computed(() => (resolvedTotal.value === 0 ? 0 : (currentPage.value - 1) * resolvedPageSize.value + 1))
const rangeTo = computed(() => Math.min(currentPage.value * resolvedPageSize.value, resolvedTotal.value))

type PaginationItem = number | 'ellipsis-start' | 'ellipsis-end'

function range(start: number, end: number): number[] {
  const list: number[] = []
  for (let page = start; page <= end; page += 1)
    list.push(page)
  return list
}

// Алгоритм usePagination как в MUI: крайние `boundaryCount` страниц + `siblingCount`
// соседей вокруг текущей, разрывы схлопываются в многоточие. Одиночный «пропущенный»
// номер показываем как номер, а не как «…» (визуально ровнее).
const items = computed<PaginationItem[]>(() => {
  const count = pageCount.value
  const current = currentPage.value
  const boundaryCount = Math.max(0, props.boundaryCount)
  const siblingCount = Math.max(0, props.siblingCount)

  const startPages = range(1, Math.min(boundaryCount, count))
  const endPages = range(Math.max(count - boundaryCount + 1, boundaryCount + 1), count)

  const siblingsStart = Math.max(
    Math.min(current - siblingCount, count - boundaryCount - siblingCount * 2 - 1),
    boundaryCount + 2,
  )
  const siblingsEnd = Math.min(
    Math.max(current + siblingCount, boundaryCount + siblingCount * 2 + 2),
    endPages.length > 0 ? endPages[0] - 2 : count - 1,
  )

  return [
    ...startPages,
    ...(siblingsStart > boundaryCount + 2
      ? ['ellipsis-start' as const]
      : boundaryCount + 1 < count - boundaryCount
        ? [boundaryCount + 1]
        : []),
    ...range(siblingsStart, siblingsEnd),
    ...(siblingsEnd < count - boundaryCount - 1
      ? ['ellipsis-end' as const]
      : count - boundaryCount > boundaryCount
        ? [count - boundaryCount]
        : []),
    ...endPages,
  ]
})

function goTo(page: number): void {
  if (props.disabled)
    return

  emit('update:page', page)
}

function prev(): void {
  goTo(Math.max(1, currentPage.value - 1))
}

function next(): void {
  goTo(Math.min(pageCount.value, currentPage.value + 1))
}

function first(): void {
  goTo(1)
}

function last(): void {
  goTo(pageCount.value)
}

// «Перейти к странице»: клампим введённый номер к диапазону [1, pageCount]
// и сбрасываем поле после перехода.
const jumperValue = ref('')

function submitJumper(): void {
  const parsed = Number.parseInt(jumperValue.value, 10)
  jumperValue.value = ''
  if (Number.isNaN(parsed))
    return

  goTo(Math.min(pageCount.value, Math.max(1, parsed)))
}

const resolvedJumperLabel = computed(() => props.jumperLabel ?? t('gr.pagination.jumpTo', 'Go to'))
const resolvedAriaLabel = computed(() => props.ariaLabel ?? t('gr.pagination.label', 'Pagination'))
const statusText = computed(() =>
  t('gr.pagination.status', 'Page {page} of {count}', { page: currentPage.value, count: pageCount.value }),
)
const totalText = computed(() =>
  t('gr.pagination.total', '{from}–{to} of {total}', { from: rangeFrom.value, to: rangeTo.value, total: resolvedTotal.value }),
)

if (__GR_DEV__) {
  const attrs = useAttrs()

  watchEffect(() => {
    // Промах закономерен: в большинстве библиотек этот проп зовётся `modelValue`,
    // а необъявленный проп молча уезжает на корень через fallthrough.
    if ('modelValue' in attrs) {
      console.warn(
        '[granularity] GrPagination: страницу задаёт `v-model:page`, а не `v-model` — проп `modelValue` компонент не читает.',
      )
    }

    for (const name of ['page', 'pageSize', 'total'] as const) {
      if (!Number.isFinite(props[name])) {
        console.warn(
          `[granularity] GrPagination: обязательный проп \`${name}\` должен быть числом — получено ${String(props[name])}.`,
        )
      }
    }
  })
}
</script>

<template>
  <div
    class="flex flex-wrap items-center justify-end"
    :class="rowClass"
    data-gr-pagination
    role="navigation"
    :aria-label="resolvedAriaLabel"
  >
    <div
      v-if="showTotal"
      data-gr-pagination-total
      class="text-[var(--gr-muted-fg)] tabular-nums"
      :class="labelClass"
    >
      <slot name="total" :from="rangeFrom" :to="rangeTo" :total="resolvedTotal">
        {{ totalText }}
      </slot>
    </div>

    <div v-if="showPageSize" :class="selectWrapClass">
      <GrSelect
        v-model="pageSizeModel"
        :options="pageSizeOptions"
        :size="resolvedSize"
        :disabled="disabled"
        :aria-label="t('gr.pagination.pageSize', 'Page size')"
      />
    </div>

    <GrButton variant="ghost" :size="navButtonSize" :disabled="disabled || currentPage <= 1" :aria-label="t('gr.pagination.first', 'First page')" data-gr-pagination-first @click="first">
      «
    </GrButton>

    <GrButton variant="ghost" :size="navButtonSize" :disabled="disabled || currentPage <= 1" data-gr-pagination-prev @click="prev">
      {{ t('gr.pagination.prev', 'Prev') }}
    </GrButton>

    <!-- Компактный вариант: индикатор «текущая / всего» вместо нумерованных страниц. -->
    <div
      v-if="compact"
      data-gr-pagination-compact
      class="px-2 text-[var(--gr-fg)] tabular-nums"
      :class="labelClass"
      role="status"
    >
      {{ currentPage }} / {{ pageCount }}
    </div>

    <template v-else>
      <ul class="flex items-center [list-style:none]" :class="pageListClass" data-gr-pagination-pages role="list">
        <li v-for="(item, index) in items" :key="index" :aria-hidden="typeof item === 'string' ? 'true' : undefined">
          <span
            v-if="item === 'ellipsis-start' || item === 'ellipsis-end'"
            data-gr-pagination-ellipsis
            class="grid place-items-center text-[var(--gr-muted-fg)]"
            :class="ellipsisClass"
          >…</span>
          <button
            v-else
            type="button"
            data-gr-pagination-page
            :disabled="disabled"
            :aria-current="item === currentPage ? 'page' : undefined"
            :aria-label="t('gr.pagination.page', 'Page {n}', { n: item })"
            class="rounded-[var(--gr-radius-control)] font-600 transition-colors duration-[var(--gr-duration-fast)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--gr-ring)] disabled:cursor-not-allowed"
            :class="[
              pageClass,
              item === currentPage
                ? 'bg-[var(--gr-primary)] text-[var(--gr-primary-fg)]'
                // Подложка тональная, а не `--gr-muted`: серый на белом фоне даёт
                // 1.10:1 и на светлой теме hover был практически не виден, хотя у
                // соседних «назад/вперёд» (ghost-кнопки) он тонирован. Ряд обязан
                // читаться одним контролом.
                : 'text-[var(--gr-muted-fg)] hover:bg-[var(--gr-accent)] hover:text-[var(--gr-accent-fg)]',
            ]"
            @click="goTo(item)"
          >
            {{ item }}
          </button>
        </li>
      </ul>

      <!-- В компактном режиме смену страницы объявляет видимый индикатор. -->
      <div data-gr-pagination-status role="status" class="sr-only">
        {{ statusText }}
      </div>
    </template>

    <GrButton variant="ghost" :size="navButtonSize" :disabled="disabled || currentPage >= pageCount" data-gr-pagination-next @click="next">
      {{ t('gr.pagination.next', 'Next') }}
    </GrButton>

    <GrButton variant="ghost" :size="navButtonSize" :disabled="disabled || currentPage >= pageCount" :aria-label="t('gr.pagination.last', 'Last page')" data-gr-pagination-last @click="last">
      »
    </GrButton>

    <!-- «Перейти к странице»: Enter или blur применяют введённый номер. -->
    <div v-if="showJumper" class="flex items-center gap-2 text-[var(--gr-muted-fg)]" :class="labelClass">
      <span>{{ resolvedJumperLabel }}</span>
      <input
        v-model="jumperValue"
        type="number"
        min="1"
        :max="pageCount"
        inputmode="numeric"
        data-gr-pagination-jumper
        :disabled="disabled"
        :aria-label="resolvedJumperLabel"
        class="rounded-[var(--gr-radius-control)] border border-[var(--gr-brd)] bg-[var(--gr-bg)] px-2 text-center text-[var(--gr-fg)] tabular-nums transition-colors duration-[var(--gr-duration-fast)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--gr-ring)] disabled:cursor-not-allowed"
        :class="jumperClass"
        @keydown.enter="submitJumper"
        @blur="submitJumper"
      >
    </div>
  </div>
</template>
