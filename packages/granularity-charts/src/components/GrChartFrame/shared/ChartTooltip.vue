<script setup lang="ts">
import { symbolPath } from '../../../chart/chartPath'
import type { GrChartActivePoint } from '../../../composables/useChartTooltip'
import {
  frameLegendSwatchClass,
  frameTooltipClass,
  frameTooltipRowClass,
  frameTooltipTitleClass,
  frameTooltipValueClass,
} from '../chartFrameStyles'

/**
 * Панель тултипа.
 *
 * Помечена `aria-hidden`: её содержимое дословно повторяет то, что уходит в
 * живой регион при движении клавиатурой, и второй раз диктору не нужно.
 * Указателем тултип читают глазами, скринридером — объявлением.
 */
defineProps<{
  active: GrChartActivePoint
  title: string
  formatValue: (value: number | null) => string
}>()
</script>

<template>
  <div :class="frameTooltipClass" data-gr-chart-tooltip aria-hidden="true">
    <span :class="frameTooltipTitleClass">{{ title }}</span>
    <span v-for="series in active.series" :key="series.id" :class="frameTooltipRowClass">
      <svg :class="frameLegendSwatchClass" viewBox="0 0 12 12" aria-hidden="true" focusable="false">
        <path :d="symbolPath(series.style.shape, 6, 6, 10)" :fill="series.style.color" />
      </svg>
      <span>{{ series.label }}</span>
      <span :class="frameTooltipValueClass">{{ formatValue(series.value) }}</span>
    </span>
  </div>
</template>
