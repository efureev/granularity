<script setup lang="ts">
import { computed, inject, useSlots } from 'vue'

import { GR_TIMELINE_CONTEXT } from './grTimelineContext'
import {
  descriptionClass,
  grTimelineDensityClass,
  grTimelineMarkerClass,
  timeClass,
  titleClass,
  type GrTimelineMarkerVariant,
  type GrTimelineTone,
} from './grTimelineStyles'

export type { GrTimelineMarkerVariant, GrTimelineTone } from './grTimelineStyles'

export interface GrTimelineItemProps {
  /** Метка времени. Слот `#time` сильнее. */
  time?: string
  /** Машиночитаемое значение метки: попадает в `datetime` тега `<time>`. */
  datetime?: string
  /** Заголовок события. Слот `#title` сильнее. */
  title?: string
  /** Пояснение под заголовком. Слот `#description` сильнее. */
  description?: string
  /** Цвет маркера из палитры пакета. */
  tone?: GrTimelineTone
  /** Заполненная точка — событие случилось, полая — запланировано. */
  variant?: GrTimelineMarkerVariant
  /**
   * Событие ещё не произошло: точка полая, а ось пунктирна начиная с участка,
   * **ведущего** к нему, — непройденный путь. Перебивает `variant`.
   */
  pending?: boolean
}

const props = withDefaults(defineProps<GrTimelineItemProps>(), {
  time: undefined,
  datetime: undefined,
  title: undefined,
  description: undefined,
  tone: 'neutral',
  variant: 'filled',
  pending: false,
})

defineSlots<{
  /** Содержимое события под заголовком и описанием. */
  default?: () => any
  /** Маркер вместо точки: иконка статуса, аватар автора, номер шага. */
  marker?: () => any
  /** Метка времени. */
  time?: () => any
  /** Заголовок события. */
  title?: () => any
  /** Пояснение под заголовком. */
  description?: () => any
}>()

const slots = useSlots()

/**
 * Раскладку пункт читает из контейнера. Вне `GrTimeline` — дефолты: пункт
 * остаётся рабочей строкой, а не падает.
 */
const timeline = inject(GR_TIMELINE_CONTEXT, null)

const layout = computed(() => timeline?.layout.value ?? 'stacked')
const density = computed(() => timeline?.density.value ?? 'regular')

const markerClass = computed(() => grTimelineMarkerClass(
  props.tone,
  props.pending ? 'outlined' : props.variant,
))

const hasTime = computed(() => !!slots.time || !!props.time)
const hasTitle = computed(() => !!slots.title || !!props.title)
const hasDescription = computed(() => !!slots.description || !!props.description)

/** В `layout="time"` метка уезжает в свою колонку, во всех остальных — в содержимое. */
const timeInAside = computed(() => layout.value === 'time')
</script>

<template>
  <li
    data-gr-timeline-item
    :data-tone="tone"
    :data-pending="pending ? '' : undefined"
  >
    <div
      v-if="timeInAside"
      data-gr-timeline-aside
    >
      <time
        v-if="hasTime"
        :datetime="datetime"
        :class="timeClass"
      >
        <slot name="time">{{ time }}</slot>
      </time>
    </div>

    <!-- Ось и точка декоративны: смысл события несёт текст рядом. -->
    <div
      data-gr-timeline-rail
      aria-hidden="true"
    >
      <slot name="marker">
        <span data-gr-timeline-marker :class="markerClass" />
      </slot>
      <span data-gr-timeline-line />
    </div>

    <!--
      Вертикальный отступ живёт на содержимом, а не на строке: ось растянута по
      строке грид-ячейкой, и её поля в высоту ячейки не входят — линия обрывалась
      бы, не доходя до следующей точки.
    -->
    <div data-gr-timeline-content :class="grTimelineDensityClass(density)">
      <time
        v-if="hasTime && !timeInAside"
        data-gr-timeline-time
        :datetime="datetime"
        :class="timeClass"
      >
        <slot name="time">{{ time }}</slot>
      </time>

      <div v-if="hasTitle" data-gr-timeline-title :class="titleClass">
        <slot name="title">
{{ title }}
</slot>
      </div>

      <div v-if="hasDescription" :class="descriptionClass">
        <slot name="description">
{{ description }}
</slot>
      </div>

      <div v-if="$slots.default" data-gr-timeline-body>
        <slot />
      </div>
    </div>
  </li>
</template>
