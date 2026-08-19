<script setup lang="ts">
import { computed, ref } from 'vue'
import type { GrDashboardCompaction, GrDashboardResponsiveLayout } from '@feugene/granularity-dashboard'
import { compact } from '@feugene/granularity-dashboard'

/**
 * Одна и та же раскладка в четырёх режимах уплотнения.
 *
 * Раскладка нарочно с дырами по обеим осям: только на ней видно, чем режимы
 * отличаются друг от друга, а не от пустой сетки.
 */
const source = [
  { id: 'revenue', x: 3, y: 0, w: 3, h: 2 },
  { id: 'orders', x: 8, y: 1, w: 4, h: 1 },
  { id: 'refunds', x: 1, y: 4, w: 3, h: 1 },
  { id: 'nps', x: 6, y: 5, w: 2, h: 2 },
]

const mode = ref<GrDashboardCompaction>('vertical')

const layout = computed<GrDashboardResponsiveLayout>(() => ({ lg: compact(source, mode.value) }))

const titles: Record<string, string> = {
  revenue: 'Выручка',
  orders: 'Заказы',
  refunds: 'Возвраты',
  nps: 'NPS',
}

// Демо живёт в колонке витрины, а не во весь экран, поэтому пороги свои.
const breakpoints = { lg: 680, md: 520, sm: 400, xs: 0 }
const cols = { lg: 12, md: 8, sm: 4, xs: 2 }
</script>

<template>
  <div class="grid gap-3">
    <div class="flex flex-wrap items-baseline justify-between gap-4">
      <span class="text-[length:var(--gr-control-text-sm)] text-[var(--gr-muted-fg)]">
        Одна раскладка, четыре режима
      </span>

      <GrSegmented
        v-model="mode"
        size="sm"
        :options="[
          { value: 'vertical', label: 'Вверх' },
          { value: 'horizontal', label: 'Влево' },
          { value: 'both', label: 'Обе' },
          { value: 'none', label: 'Свободно' },
        ]"
        aria-label="Режим уплотнения"
      />
    </div>

    <GrDashboard
      :layout="layout"
      :compact="mode"
      :breakpoints="breakpoints"
      :cols="cols"
      :row-height="64"
      aria-label="Режимы уплотнения"
    >
      <GrDashboardItem
        v-for="item in layout.lg"
        :key="item.id"
        :item-id="item.id"
        :title="titles[item.id]"
        overflow="hidden"
      />
    </GrDashboard>
  </div>
</template>
