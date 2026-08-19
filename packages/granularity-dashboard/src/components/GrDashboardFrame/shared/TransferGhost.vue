<script setup lang="ts">
/**
 * Что видно под курсором, пока виджет несут из каталога в сетку.
 *
 * Позиция пишется `transform`-биндингом, а не CSS-переменными: элемент один, а
 * не сорок, и одна реактивная запись в кадр стоит ноль.
 */
import { computed } from 'vue'

import type { GrDashboardTransfer, GrDashboardTransferPoint } from '../../../composables/useDashboardTransfer'
import { ghostClass, ghostMeasureClass, ghostTitleClass } from '../frameStyles'

const props = defineProps<{
  transfer: GrDashboardTransfer
  point: GrDashboardTransferPoint
}>()

defineSlots<{ default?: (props: { transfer: GrDashboardTransfer }) => unknown }>()

/** Размер в ячейках — `6×2`. Знак умножения, а не буква `x`. */
const measure = computed(() => `${props.transfer.size.w}×${props.transfer.size.h}`)

const style = computed(() => ({
  transform: `translate3d(${props.point.x + 12}px, ${props.point.y + 12}px, 0)`,
}))
</script>

<template>
  <div data-gr-dashboard-transfer-ghost aria-hidden="true" :class="ghostClass" :style="style">
    <slot :transfer="transfer">
      <span :class="ghostTitleClass">{{ transfer.title }}</span>
      <span :class="ghostMeasureClass">{{ measure }}</span>
    </slot>
  </div>
</template>
