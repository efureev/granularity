<script setup lang="ts">
import { computed, useSlots } from 'vue'

export type GrTableDensity = 'compact' | 'regular'

export interface GrTableProps {
  /**
   * Плотность таблицы — влияет на базовый размер шрифта.
   * Паддинги ячеек оставлены за консьюмером (GrTable — «тонкий» контейнер).
   */
  density?: GrTableDensity
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
   * ARIA-label для скролл-контейнера (`role="region"` + `tabindex="0"`).
   * Позволяет клавиатурным пользователям проскроллить широкую таблицу.
   * Если не задан — region-роль не включается.
   */
  regionLabel?: string
  /**
   * Прилипающий заголовок: `<thead>` остаётся видимым при вертикальном скролле.
   * Осмысленно вместе с `maxHeight` (иначе таблица не скроллится вертикально).
   */
  stickyHeader?: boolean
  /**
   * Максимальная высота скролл-контейнера (включает вертикальный скролл).
   * Число трактуется как пиксели. Нужен для работы `stickyHeader`.
   */
  maxHeight?: string | number
}

/**
 * `GrTable` — «тонкий» GR-контейнер для табличных данных.
 *
 * Рендерит `<table>` внутри скролл-обёртки и даёт слоты `#caption`, `#head`,
 * default (tbody) и `#foot`. Стили ячеек (`<th>`/`<td>` паддинги, выравнивание)
 * оставлены на консьюмере.
 *
 * ВАЖНО: `min-w-full` сам по себе не даст горизонтального скролла. Для него
 * консьюмеру нужны `white-space: nowrap` на ячейках или явные ширины колонок.
 */
const props = withDefaults(defineProps<GrTableProps>(), {
  density: 'regular',
  caption: undefined,
  ariaLabel: undefined,
  ariaLabelledby: undefined,
  regionLabel: undefined,
  stickyHeader: false,
  maxHeight: undefined,
})

const slots = useSlots()

const tableTextClass = computed(() => (props.density === 'compact' ? 'text-[13px]' : 'text-sm'))
const hasCaption = computed(() => Boolean(slots.caption) || Boolean(props.caption))

const scrollStyle = computed(() => {
  if (props.maxHeight === undefined)
    return undefined
  const value = typeof props.maxHeight === 'number' ? `${props.maxHeight}px` : props.maxHeight
  return { maxHeight: value, overflowY: 'auto' as const }
})

// Прилипающий заголовок: `<thead>` на `position: sticky`; фон обязателен, иначе
// сквозь него будут просвечивать строки при скролле.
const theadClass = computed(() => [
  'bg-[var(--gr-muted)] text-[var(--gr-muted-fg)]',
  props.stickyHeader ? 'sticky top-0 z-[1]' : '',
].filter(Boolean).join(' '))
</script>

<template>
  <div
    data-gr-table-scroll
    :role="regionLabel ? 'region' : undefined"
    :aria-label="regionLabel"
    :tabindex="regionLabel ? 0 : undefined"
    class="overflow-x-auto rounded-[var(--gr-radius-lg)] border border-[var(--gr-brd)] bg-[var(--gr-card)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--gr-ring)]"
    :style="scrollStyle"
  >
    <table
      data-gr-table
      class="min-w-full" :class="[tableTextClass]"
      :aria-label="ariaLabelledby ? undefined : ariaLabel"
      :aria-labelledby="ariaLabelledby"
    >
      <caption v-if="hasCaption" class="sr-only">
        <slot name="caption">
{{ caption }}
</slot>
      </caption>
      <thead :class="theadClass">
        <slot name="head" />
      </thead>
      <tbody class="text-[var(--gr-fg)]">
        <slot />
      </tbody>
      <tfoot v-if="slots.foot" class="text-[var(--gr-fg)]">
        <slot name="foot" />
      </tfoot>
    </table>
  </div>
</template>
