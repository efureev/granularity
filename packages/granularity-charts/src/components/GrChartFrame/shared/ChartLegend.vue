<script setup lang="ts">
import type { NormalizedSeries } from '../../../chart/chartModel'
import { symbolPath } from '../../../chart/chartPath'
import {
  frameLegendClass,
  frameLegendItemClass,
  frameLegendItemHiddenClass,
  frameLegendSwatchClass,
} from '../chartFrameStyles'

/**
 * Легенда — она же переключатель серий.
 *
 * Метка серии несёт **форму точки, а не только цвет**: цвет никогда не
 * единственный различитель, и в легенде это заметнее всего — по ней читатель
 * и сопоставляет ряд с подписью.
 */
defineProps<{
  series: readonly NormalizedSeries[]
  toggleLabel: (label: string) => string
  interactive: boolean
}>()

defineEmits<{ (e: 'toggle', id: string): void }>()
</script>

<template>
  <ul :class="frameLegendClass" data-gr-chart-legend>
    <li v-for="item in series" :key="item.id">
      <component
        :is="interactive ? 'button' : 'span'"
        :type="interactive ? 'button' : undefined"
        :class="[frameLegendItemClass, item.hidden && frameLegendItemHiddenClass]"
        :aria-pressed="interactive ? String(!item.hidden) : undefined"
        :aria-label="interactive ? toggleLabel(item.label) : undefined"
        :data-gr-chart-legend-item="item.id"
        @click="interactive && $emit('toggle', item.id)"
      >
        <svg :class="frameLegendSwatchClass" viewBox="0 0 12 12" aria-hidden="true" focusable="false">
          <path
            :d="symbolPath(item.style.shape, 6, 6, 10)"
            :fill="item.hidden ? 'var(--gr-muted-fg)' : item.style.color"
          />
        </svg>
        <span>{{ item.label }}</span>
      </component>
    </li>
  </ul>
</template>
