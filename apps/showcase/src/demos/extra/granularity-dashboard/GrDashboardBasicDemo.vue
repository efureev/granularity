<script setup lang="ts">
import { ref } from 'vue'
import type { GrDashboardResponsiveLayout } from '@feugene/granularity-dashboard'

const mode = ref<'view' | 'edit'>('edit')

const layout = ref<GrDashboardResponsiveLayout>({
  lg: [
    { id: 'revenue', x: 0, y: 0, w: 8, h: 3 },
    { id: 'conversion', x: 8, y: 0, w: 4, h: 3, minW: 3 },
    { id: 'sources', x: 0, y: 3, w: 6, h: 2 },
    { id: 'errors', x: 6, y: 3, w: 6, h: 2 },
  ],
})

// Демо живёт в колонке витрины, а не во весь экран, поэтому пороги свои:
// брейкпоинты — свойство приложения, а не константа пакета.
const breakpoints = { lg: 680, md: 520, sm: 400, xs: 0 }
const cols = { lg: 12, md: 8, sm: 4, xs: 2 }
</script>

<template>
  <div class="flex flex-col gap-4">
    <GrDashboardToolbar v-model:mode="mode" />

    <GrDashboard
      v-model:layout="layout"
      :mode="mode"
      :breakpoints="breakpoints"
      :cols="cols"
      :row-height="72"
    >
      <GrDashboardItem item-id="revenue" title="Выручка">
        <p class="text-[var(--gr-muted-fg)]">₽ 12 480 000 за квартал</p>
      </GrDashboardItem>

      <GrDashboardItem item-id="conversion" title="Конверсия" :min-w="3">
        <p class="text-[var(--gr-muted-fg)]">4,8 % — на 0,3 пункта выше прошлого месяца</p>
      </GrDashboardItem>

      <GrDashboardItem item-id="sources" title="Источники">
        <p class="text-[var(--gr-muted-fg)]">Поиск, письма, партнёры</p>
      </GrDashboardItem>

      <GrDashboardItem item-id="errors" title="Ошибки">
        <p class="text-[var(--gr-muted-fg)]">14 пятисотых за сутки</p>
      </GrDashboardItem>
    </GrDashboard>
  </div>
</template>
