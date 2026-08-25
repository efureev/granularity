<script setup lang="ts" generic="T = unknown">
import { computed, provide, useSlots, watch } from 'vue'

import GrSkeleton from '../GrSkeleton/GrSkeleton.vue'
import { useGrComponentProp } from '../GrConfigProvider/context'
import { hasMeaningfulSlotContent } from '../shared/slotNodes'
import { useGranularityTranslations } from '../../internal/granularityI18n'

import { GR_TIMELINE_CONTEXT, type GrTimelineHeadingLevel } from './grTimelineContext'
import {
  emptyClass,
  groupTitleClass,
  loadingRowClass,
  type GrTimelineDensity,
  type GrTimelineLayout,
  type GrTimelineOrientation,
} from './grTimelineStyles'
import { groupTimelineItems, type GrTimelineGroupBy } from './timelineGroups'

export type {
  GrTimelineDensity,
  GrTimelineLayout,
  GrTimelineOrientation,
} from './grTimelineStyles'
export type { GrTimelineGroupBy } from './timelineGroups'

export interface GrTimelineProps<TItem = unknown> {
  /**
   * Данные ленты. С ними пункты рисует слот `#item` — и только так лента знает
   * состав набора, то есть может его группировать.
   */
  items?: TItem[]
  /** Ключ пункта для `v-for`: имя поля или функция. Без него — индекс. */
  itemKey?: string | ((item: TItem, index: number) => string | number)
  /** Группировка: имя поля или функция от пункта. Заголовок группы — слот `#group`. */
  groupBy?: GrTimelineGroupBy<TItem>
  /** Уровень заголовка группы: лента обязана вписаться в структуру заголовков страницы. */
  groupHeadingLevel?: GrTimelineHeadingLevel
  /** Раскладка: одна ось, колонка времени слева или чередование сторон. */
  layout?: GrTimelineLayout
  /** Направление оси. Горизонтальная лента — скроллер. */
  orientation?: GrTimelineOrientation
  /** Плотность вертикальных отступов пункта. */
  density?: GrTimelineDensity
  /** Идёт загрузка: вместо пунктов — заглушки, контейнер помечен `aria-busy`. */
  loading?: boolean
  /** Сколько строк-заглушек показать при `loading`. */
  loadingRows?: number
  /**
   * Лента пуста. По умолчанию определяется сама — по данным или по слоту; проп
   * нужен там, где потребитель знает лучше.
   */
  empty?: boolean
  /** Текст пустого состояния. Слот `#empty` сильнее. */
  emptyText?: string
}

const props = withDefaults(defineProps<GrTimelineProps<T>>(), {
  items: undefined,
  itemKey: undefined,
  groupBy: undefined,
  // Настоящие дефолты живут в резолверах `useGrComponentProp`: объявленный здесь
  // дефолт неотличим от значения, переданного потребителем, и перебивал бы конфиг.
  groupHeadingLevel: undefined,
  layout: undefined,
  orientation: undefined,
  density: undefined,
  loading: false,
  loadingRows: 3,
  empty: undefined,
  emptyText: undefined,
})

defineSlots<{
  /** Пункты ленты (`GrTimelineItem`), когда данные не переданы пропом. */
  default?: () => any
  /** Пункт в data-режиме. */
  item?: (props: { item: T, index: number }) => any
  /** Заголовок группы. По умолчанию — сам ключ. */
  group?: (props: { group: string, items: T[] }) => any
  /** Содержимое пустого состояния вместо текста по умолчанию. */
  empty?: () => any
  /** Заглушки загрузки вместо строк по умолчанию. */
  loading?: () => any
}>()

const slots = useSlots()
const { t } = useGranularityTranslations()

const density = useGrComponentProp('GrTimeline', 'density', () => props.density, 'regular')
const orientation = useGrComponentProp('GrTimeline', 'orientation', () => props.orientation, 'vertical')
const headingLevel = useGrComponentProp('GrTimeline', 'groupHeadingLevel', () => props.groupHeadingLevel, 3)
const requestedLayout = useGrComponentProp('GrTimeline', 'layout', () => props.layout, 'stacked')

/**
 * Горизонтальная лента знает одну раскладку: колонка времени и чередование
 * сторон — это вертикальные приёмы, у горизонтальной оси сторон нет.
 */
const layout = computed<GrTimelineLayout>(() => (
  orientation.value === 'horizontal' ? 'stacked' : requestedLayout.value
))

const headingTag = computed(() => `h${headingLevel.value}`)

const dataMode = computed(() => props.items !== undefined)

const grouped = computed(() => dataMode.value && props.groupBy !== undefined)

const groups = computed(() => groupTimelineItems(props.items ?? [], props.groupBy))

/** Единственная группа плоской ленты: тот же набор, что и в data-режиме без группировки. */
const entries = computed(() => groups.value[0]?.entries ?? [])

const resolvedEmptyText = computed(() => props.emptyText ?? t('gr.timeline.empty', 'Nothing here yet'))

const isEmpty = computed(() => {
  if (props.empty !== undefined)
    return props.empty

  if (dataMode.value)
    return props.items!.length === 0

  // `v-for` по пустому массиву оставляет фрагмент без узлов, `v-if` — комментарий,
  // и ни то ни другое пунктом ленты не является.
  return !hasMeaningfulSlotContent(slots.default?.() ?? [])
})

const loadingRowCount = computed(() => Math.max(1, Math.trunc(props.loadingRows)))

function keyOf(item: T, index: number): string | number {
  const key = props.itemKey
  if (typeof key === 'function')
    return key(item, index)
  if (typeof key === 'string')
    return (item as Record<string, unknown>)[key] as string | number

  return index
}

function itemsOf(group: { entries: { item: T }[] }): T[] {
  return group.entries.map(entry => entry.item)
}

provide(GR_TIMELINE_CONTEXT, { layout, orientation, density })

if (__GR_DEV__) {
  watch(
    () => [dataMode.value, Boolean(slots.item)] as const,
    ([hasItems, hasSlot]) => {
      if (hasItems && !hasSlot) {
        console.warn(
          '[granularity] GrTimeline: с `items` пункты рисует слот `#item` — без него лента пуста.',
        )
      }
    },
    { immediate: true },
  )

  watch(
    () => [dataMode.value, props.groupBy !== undefined] as const,
    ([hasItems, hasGroupBy]) => {
      if (hasGroupBy && !hasItems) {
        console.warn(
          '[granularity] GrTimeline: `groupBy` работает только с `items` — пункты из слота по '
          + 'умолчанию лента не разбирает и сгруппировать их ей не из чего.',
        )
      }
    },
    { immediate: true },
  )

  watch(
    () => [orientation.value, requestedLayout.value] as const,
    ([axis, requested]) => {
      if (axis === 'horizontal' && requested !== 'stacked') {
        console.warn(
          `[granularity] GrTimeline: layout="${requested}" — вертикальная раскладка, `
          + 'в горизонтальной ленте она игнорируется.',
        )
      }
    },
    { immediate: true },
  )
}
</script>

<template>
  <div
    data-gr-timeline
    :data-layout="layout"
    :data-orientation="orientation"
    :aria-busy="loading ? 'true' : undefined"
  >
    <template v-if="loading">
      <slot name="loading">
        <div
          v-for="row in loadingRowCount"
          :key="row"
          data-gr-timeline-loading-row
          :class="loadingRowClass"
        >
          <GrSkeleton variant="circle" width="var(--gr-timeline-marker-size, 10px)" />
          <GrSkeleton />
        </div>
      </slot>
    </template>

    <div
      v-else-if="isEmpty"
      data-gr-timeline-empty
      :class="emptyClass"
    >
      <slot name="empty">
        {{ resolvedEmptyText }}
      </slot>
    </div>

    <template v-else-if="grouped">
      <!--
        Группа — секция с заголовком, а не пункт-заголовок внутри списка:
        `<li>` с датой попал бы в набор событий и был бы объявлен как одно из них.
      -->
      <section
        v-for="group in groups"
        :key="group.key"
        data-gr-timeline-group
      >
        <div
          v-if="group.key"
          data-gr-timeline-group-header
        >
          <div data-gr-timeline-rail aria-hidden="true">
            <span data-gr-timeline-line />
          </div>

          <component
            :is="headingTag"
            data-gr-timeline-group-title
            :class="groupTitleClass"
          >
            <slot name="group" :group="group.key" :items="itemsOf(group)">
              {{ group.key }}
            </slot>
          </component>
        </div>

        <ol
          data-gr-timeline-list
          :tabindex="orientation === 'horizontal' ? 0 : undefined"
        >
          <template
            v-for="entry in group.entries"
            :key="keyOf(entry.item, entry.index)"
          >
            <slot name="item" :item="entry.item" :index="entry.index" />
          </template>
        </ol>
      </section>
    </template>

    <ol
      v-else
      data-gr-timeline-list
      :tabindex="orientation === 'horizontal' ? 0 : undefined"
    >
      <template v-if="dataMode">
        <template
          v-for="entry in entries"
          :key="keyOf(entry.item, entry.index)"
        >
          <slot name="item" :item="entry.item" :index="entry.index" />
        </template>
      </template>

      <slot v-else />
    </ol>
  </div>
</template>

<style>
/*
 * Геометрия ленты живёт здесь, а не в утилитах, по одной причине: сторона
 * пункта в `alternate` — это `nth-child`, а обрыв оси — `last-child`, и оба
 * вопроса утилитами не выражаются. Альтернатива — регистрация пунктов в
 * контексте на `onMounted` — дала бы порядок, зависящий от порядка монтирования,
 * и разъезжалась бы на `v-if` посреди ленты.
 */

[data-gr-timeline] {
  --gr-timeline-columns: auto minmax(0, 1fr);
}

[data-gr-timeline][data-layout='time'] {
  --gr-timeline-columns: var(--gr-timeline-time-width, 5.5rem) auto minmax(0, 1fr);
}

[data-gr-timeline][data-layout='alternate'] {
  --gr-timeline-columns: minmax(0, 1fr) auto minmax(0, 1fr);
}

[data-gr-timeline-list] {
  margin: 0;
  padding: 0;
  list-style: none;
}

[data-gr-timeline-item],
[data-gr-timeline-group-header] {
  display: grid;
  grid-template-columns: var(--gr-timeline-columns);
  column-gap: var(--gr-timeline-gap, 0.75rem);
  align-items: start;
}

/*
 * Сжатие строки.
 *
 * Трек `1fr` — это `minmax(auto, 1fr)`, а его минимум равен наибольшему
 * минимальному вкладу элементов. У грид-элемента с `overflow: visible` этот
 * вклад равен min-content, то есть для строки с `white-space: nowrap` — её
 * полной ширине. Поэтому лента не сжималась, а `truncate` потребителя не
 * срабатывал: усекать было нечего, трек раздавался под текст. Явные
 * `minmax(0, …)` у треков и `min-width: 0` у элементов снимают оба минимума.
 *
 * Метка времени стоит в треке фиксированной длины, и её трек от этого не
 * меняется — но без `min-width: 0` длинная метка из слота `#time` раздаёт
 * min-content всей строки.
 */

[data-gr-timeline-aside],
[data-gr-timeline-content],
[data-gr-timeline-group-title] {
  min-width: 0;
}

[data-gr-timeline-aside] {
  text-align: end;
}

/*
 * Ось — отрезок у каждого пункта, а не одна длинная линия: соседние отрезки
 * смыкаются сами, и мерить высоту списка не приходится.
 */
[data-gr-timeline-rail] {
  display: flex;
  flex-direction: column;
  align-items: center;
  align-self: stretch;
  padding-top: var(--gr-timeline-marker-top, 0.35rem);
  min-width: var(--gr-timeline-marker-size, 10px);
}

[data-gr-timeline-rail] > :not([data-gr-timeline-line]) {
  flex: none;
}

[data-gr-timeline-marker] {
  box-sizing: border-box;
  width: var(--gr-timeline-marker-size, 10px);
  height: var(--gr-timeline-marker-size, 10px);
  border-width: var(--gr-timeline-marker-ring, 2px);
  border-style: solid;
  border-color: transparent;
}

[data-gr-timeline-line] {
  flex: 1 1 auto;
  width: var(--gr-timeline-axis-width, 2px);
  min-height: var(--gr-timeline-line-min, 0.75rem);
  margin-top: 0.25rem;
  /* Ровно на столько следующая точка отступает от верха своей строки: без этого
     отрезок не доходит до неё, и ось выглядит пунктиром из длинных штрихов. */
  margin-bottom: calc(-1 * var(--gr-timeline-marker-top, 0.35rem));
  background-color: var(--gr-timeline-axis-color, var(--gr-brd));
}

/*
 * Пунктиром идёт участок, ведущий **к** незавершённому событию, и всё, что за
 * ним: непройденный путь. Отрезок после точки для этого не годится — обычно
 * незавершённое событие последнее, и его отрезка не видно вовсе.
 */
[data-gr-timeline-item]:has(+ [data-gr-timeline-item][data-pending]) [data-gr-timeline-line],
[data-gr-timeline-item][data-pending] [data-gr-timeline-line] {
  background-color: transparent;
  background-image: repeating-linear-gradient(
    to bottom,
    var(--gr-timeline-axis-color, var(--gr-brd)) 0 var(--gr-timeline-dash, 4px),
    transparent var(--gr-timeline-dash, 4px) calc(var(--gr-timeline-dash, 4px) * 2)
  );
}

/* Хвост после последнего события — линия в никуда. */
[data-gr-timeline-item]:last-child [data-gr-timeline-line] {
  visibility: hidden;
}

/* Между группами ось не рвётся: разрыв читался бы как две разные ленты. */
[data-gr-timeline-group]:not(:last-of-type) [data-gr-timeline-item]:last-child [data-gr-timeline-line] {
  visibility: visible;
}

[data-gr-timeline-group-header] [data-gr-timeline-rail] {
  padding-top: 0;
}

[data-gr-timeline-group] + [data-gr-timeline-group] [data-gr-timeline-group-title] {
  padding-top: 0.5rem;
}

[data-gr-timeline-group-header] [data-gr-timeline-line] {
  margin-top: 0;
}

/* Над первым заголовком оси ещё нет — линия висела бы в воздухе. */
[data-gr-timeline-group]:first-of-type [data-gr-timeline-group-header] [data-gr-timeline-line] {
  visibility: hidden;
}

[data-gr-timeline][data-layout='time'] [data-gr-timeline-group-header] [data-gr-timeline-rail],
[data-gr-timeline][data-layout='alternate'] [data-gr-timeline-group-header] [data-gr-timeline-rail] {
  grid-column: 2;
}

[data-gr-timeline][data-layout='time'] [data-gr-timeline-group-title],
[data-gr-timeline][data-layout='alternate'] [data-gr-timeline-group-title] {
  grid-column: 3;
}

[data-gr-timeline][data-layout='alternate'] [data-gr-timeline-rail] {
  grid-column: 2;
}

[data-gr-timeline][data-layout='alternate'] [data-gr-timeline-content] {
  grid-column: 3;
}

[data-gr-timeline][data-layout='alternate'] [data-gr-timeline-item]:nth-child(even) [data-gr-timeline-content] {
  grid-column: 1;
  grid-row: 1;
  text-align: end;
}

/* Двухсторонняя лента в узкой колонке нечитаема — там она односторонняя. */
@media (max-width: 640px) {
  [data-gr-timeline][data-layout='alternate'] {
    --gr-timeline-columns: auto minmax(0, 1fr);
  }

  [data-gr-timeline][data-layout='alternate'] [data-gr-timeline-rail],
  [data-gr-timeline][data-layout='alternate'] [data-gr-timeline-group-header] [data-gr-timeline-rail] {
    grid-column: 1;
  }

  [data-gr-timeline][data-layout='alternate'] [data-gr-timeline-content],
  [data-gr-timeline][data-layout='alternate'] [data-gr-timeline-item]:nth-child(even) [data-gr-timeline-content],
  [data-gr-timeline][data-layout='alternate'] [data-gr-timeline-group-title] {
    grid-column: 2;
    text-align: start;
  }
}

[data-gr-timeline][data-orientation='horizontal'] [data-gr-timeline-list] {
  display: flex;
  flex-direction: row;
  overflow-x: auto;
}

[data-gr-timeline][data-orientation='horizontal'] [data-gr-timeline-item] {
  grid-template-columns: minmax(0, 1fr);
  min-width: var(--gr-timeline-item-min-width, 12rem);
  padding-inline-end: var(--gr-timeline-gap, 0.75rem);
}

[data-gr-timeline][data-orientation='horizontal'] [data-gr-timeline-content] {
  padding-bottom: 0;
}

[data-gr-timeline][data-orientation='horizontal'] [data-gr-timeline-rail] {
  flex-direction: row;
  align-items: center;
  align-self: auto;
  padding-top: 0;
  padding-bottom: 0.25rem;
}

[data-gr-timeline][data-orientation='horizontal'] [data-gr-timeline-line] {
  width: auto;
  height: var(--gr-timeline-axis-width, 2px);
  min-width: var(--gr-timeline-line-min, 0.75rem);
  min-height: 0;
  margin-top: 0;
  margin-inline-start: 0.25rem;
}

[data-gr-timeline][data-orientation='horizontal'] [data-gr-timeline-item]:has(+ [data-gr-timeline-item][data-pending]) [data-gr-timeline-line],
[data-gr-timeline][data-orientation='horizontal'] [data-gr-timeline-item][data-pending] [data-gr-timeline-line] {
  background-image: repeating-linear-gradient(
    to right,
    var(--gr-timeline-axis-color, var(--gr-brd)) 0 var(--gr-timeline-dash, 4px),
    transparent var(--gr-timeline-dash, 4px) calc(var(--gr-timeline-dash, 4px) * 2)
  );
}
</style>
