<script setup lang="ts">
import { computed } from 'vue'

import type { Rect } from '../../../chart/chartLayout'
import type { ChartTick } from '../../../composables/useChartTicks'
import { axisStroke, frameLabelClass, labelFill } from '../chartFrameStyles'

/**
 * Ось: линия и подписи делений.
 *
 * Подписи получают `<title>` с полным текстом, когда раскладка сообщила об
 * усечении: обрезанное «1 234 5…» без него не восстановить ничем.
 */
const props = defineProps<{
  plot: Rect
  ticks: readonly ChartTick[]
  orientation: 'x' | 'y'
  fontSizePx: number
  /** Класс кегля: он парный к `fontSizePx`, иначе раскладка и рисунок разойдутся. */
  sizeClass: string
  truncated: boolean
  /** Имя оси. Не `ariaLabel`: одноимённый проп столкнулся бы с fallthrough-атрибутом. */
  label: string
}>()

const TICK_GAP = 6

const line = computed(() => (props.orientation === 'y'
  ? { x1: props.plot.x, x2: props.plot.x, y1: props.plot.y, y2: props.plot.y + props.plot.height }
  : {
      x1: props.plot.x,
      x2: props.plot.x + props.plot.width,
      y1: props.plot.y + props.plot.height,
      y2: props.plot.y + props.plot.height,
    }))

function labelX(tick: ChartTick): number {
  return props.orientation === 'y' ? props.plot.x - TICK_GAP : tick.position
}

function labelY(tick: ChartTick): number {
  return props.orientation === 'y'
    ? tick.position
    : props.plot.y + props.plot.height + TICK_GAP + props.fontSizePx
}
</script>

<template>
  <g :data-gr-chart-axis="orientation" role="presentation" :aria-label="label">
    <line v-bind="line" :stroke="axisStroke" stroke-width="1" />
    <text
      v-for="tick in ticks"
      :key="tick.value"
      :x="labelX(tick)"
      :y="labelY(tick)"
      :class="[frameLabelClass, sizeClass]"
      :fill="labelFill"
      :text-anchor="orientation === 'y' ? 'end' : 'middle'"
      :dominant-baseline="orientation === 'y' ? 'middle' : 'auto'"
    >
      {{ tick.label }}
      <title v-if="truncated">
{{ tick.label }}
</title>
    </text>
  </g>
</template>
