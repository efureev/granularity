<script setup lang="ts">
import { ref } from 'vue'
import type { GrDashboardResponsiveLayout } from '@feugene/granularity-dashboard'

const layout = ref<GrDashboardResponsiveLayout>({
  lg: [
    { id: 'alert', x: 0, y: 0, w: 12, h: 1, static: true },
    { id: 'left', x: 0, y: 1, w: 6, h: 2 },
    { id: 'right', x: 6, y: 1, w: 6, h: 2 },
  ],
})

// Демо живёт в колонке витрины, а не во весь экран, поэтому пороги свои:
// брейкпоинты — свойство приложения, а не константа пакета.
const breakpoints = { lg: 680, md: 520, sm: 400, xs: 0 }
const cols = { lg: 12, md: 8, sm: 4, xs: 2 }
</script>

<template>
  <GrDashboard
    v-model:layout="layout"
    mode="edit"
    :breakpoints="breakpoints"
    :cols="cols"
    :row-height="72"
    compact="none"
  >
    <GrDashboardItem item-id="alert" title="Плановые работы" static>
      <p class="text-[var(--gr-muted-fg)]">Закреплённый виджет не двигается ни сам, ни соседями.</p>
    </GrDashboardItem>

    <GrDashboardItem item-id="left" title="Заказы">
      <p class="text-[var(--gr-muted-fg)]">Свободная сетка: виджет остаётся там, куда его положили.</p>
    </GrDashboardItem>

    <GrDashboardItem item-id="right" title="Возвраты">
      <p class="text-[var(--gr-muted-fg)]">Дыра в раскладке при этом сохраняется.</p>
    </GrDashboardItem>
  </GrDashboard>
</template>
