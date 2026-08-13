<script setup lang="ts">
import { computed } from 'vue'

import type { GrDashboardItemLayout } from '../../../layout'
import { placeholderClass } from '../frameStyles'

const props = defineProps<{ cell: GrDashboardItemLayout | null }>()

/**
 * Подложка живёт в той же сетке, что и виджеты, и адресуется теми же
 * `grid-area`: пиксельная копия расходилась бы с раскладкой на дробном зазоре.
 */
const style = computed(() => {
  const cell = props.cell
  if (!cell) return undefined

  return {
    gridColumn: `${cell.x + 1} / span ${cell.w}`,
    gridRow: `${cell.y + 1} / span ${cell.h}`,
  }
})
</script>

<template>
  <div
    v-if="cell"
    aria-hidden="true"
    data-gr-dashboard-placeholder
    :class="placeholderClass"
    :style="style"
  />
</template>
