<script setup lang="ts">
import { ref } from 'vue'
import { localStorageLayoutStorage, useDashboardLayout } from '@feugene/granularity-dashboard'

const mode = ref<'view' | 'edit'>('edit')

const { layout, reset } = useDashboardLayout({
  initial: {
    lg: [
      { id: 'today', x: 0, y: 0, w: 4, h: 2 },
      { id: 'week', x: 4, y: 0, w: 4, h: 2 },
      { id: 'month', x: 8, y: 0, w: 4, h: 2 },
    ],
  },
  storage: localStorageLayoutStorage(),
  key: 'showcase-dashboard-demo',
  version: 1,
})

// Демо живёт в колонке витрины, а не во весь экран, поэтому пороги свои:
// брейкпоинты — свойство приложения, а не константа пакета.
const breakpoints = { lg: 680, md: 520, sm: 400, xs: 0 }
const cols = { lg: 12, md: 8, sm: 4, xs: 2 }
</script>

<template>
  <div class="flex flex-col gap-4">
    <GrDashboardToolbar v-model:mode="mode" resettable @reset="reset" />

    <GrDashboard
      v-model:layout="layout"
      :mode="mode"
      :breakpoints="breakpoints"
      :cols="cols"
      :row-height="72"
    >
      <GrDashboardItem item-id="today" title="Сегодня">
        <p class="text-[var(--gr-muted-fg)]">Разложите виджеты и перезагрузите страницу.</p>
      </GrDashboardItem>

      <GrDashboardItem item-id="week" title="Неделя">
        <p class="text-[var(--gr-muted-fg)]">Раскладка вернётся такой, какой вы её оставили.</p>
      </GrDashboardItem>

      <GrDashboardItem item-id="month" title="Месяц">
        <p class="text-[var(--gr-muted-fg)]">«Сбросить» возвращает исходную.</p>
      </GrDashboardItem>
    </GrDashboard>
  </div>
</template>
