<script setup lang="ts">
import type { Rect } from '../../../chart/chartLayout'
import type { ChartTick } from '../../../composables/useChartTicks'
import { gridStroke, gridStrokeWidth } from '../chartFrameStyles'

/**
 * Сетка холста.
 *
 * Цвет и толщина задаются **атрибутами** `stroke`/`stroke-width`, а не
 * классами: SVG не красится свойством `color`, и `text-[var(--x)]` на линии не
 * даёт ничего. Гейт `svgPaint.test.ts` следит, чтобы это не «упростили».
 */
defineProps<{
  plot: Rect
  xTicks: readonly ChartTick[]
  yTicks: readonly ChartTick[]
  show: 'both' | 'x' | 'y' | 'none'
}>()
</script>

<template>
  <g v-if="show !== 'none'" data-gr-chart-grid aria-hidden="true">
    <!-- Горизонтали ведёт ось значений: их читают взглядом слева направо. -->
    <line
      v-for="tick in (show === 'both' || show === 'y' ? yTicks : [])"
      :key="`y-${tick.value}`"
      :x1="plot.x"
      :x2="plot.x + plot.width"
      :y1="tick.position"
      :y2="tick.position"
      :stroke="gridStroke"
      :stroke-width="gridStrokeWidth"
    />
    <line
      v-for="tick in (show === 'both' || show === 'x' ? xTicks : [])"
      :key="`x-${tick.value}`"
      :x1="tick.position"
      :x2="tick.position"
      :y1="plot.y"
      :y2="plot.y + plot.height"
      :stroke="gridStroke"
      :stroke-width="gridStrokeWidth"
    />
  </g>
</template>
