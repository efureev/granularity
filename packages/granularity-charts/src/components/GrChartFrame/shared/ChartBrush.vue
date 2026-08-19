<script setup lang="ts">
import type { Rect } from '../../../chart/chartLayout'
import { brushFill, brushFillOpacity, brushStroke } from '../chartFrameStyles'

/**
 * Полоса выделения приближения.
 *
 * Рисуется **над** марками: полупрозрачная заливка под ними читалась бы как
 * ещё один слой данных, а не как выделение. Цвет — атрибутами `fill`/`stroke`,
 * как у всего в этой раме: SVG не красится `color` (гейт `svgPaint.test.ts`).
 */
defineProps<{
  band: { x: number, width: number }
  plot: Rect
}>()
</script>

<template>
  <rect
    data-gr-chart-brush
    aria-hidden="true"
    :x="band.x"
    :y="plot.y"
    :width="band.width"
    :height="plot.height"
    :fill="brushFill"
    :fill-opacity="brushFillOpacity"
    :stroke="brushStroke"
    stroke-width="1"
  />
</template>
