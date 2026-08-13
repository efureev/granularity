<script setup lang="ts">
import { ref } from 'vue'
import type { GrDashboardPaletteItem, GrDashboardResponsiveLayout } from '@feugene/granularity-dashboard'
import { addItem } from '@feugene/granularity-dashboard'

const layout = ref<GrDashboardResponsiveLayout>({
  lg: [{ id: 'revenue', x: 0, y: 0, w: 6, h: 2 }],
})

const catalogue: GrDashboardPaletteItem[] = [
  { id: 'sessions', title: 'Сессии', description: 'Посещения за неделю', defaultSize: { w: 6, h: 2 } },
  { id: 'errors', title: 'Ошибки', description: 'Пятисотые по часам', defaultSize: { w: 4, h: 2 } },
]

const titles = ref<Record<string, string>>({ revenue: 'Выручка' })

function add(item: GrDashboardPaletteItem) {
  if (layout.value.lg?.some(entry => entry.id === item.id)) return

  titles.value[item.id] = item.title
  layout.value = {
    ...layout.value,
    lg: addItem(
      layout.value.lg ?? [],
      { id: item.id, x: 0, y: 0, w: item.defaultSize?.w ?? 4, h: item.defaultSize?.h ?? 2 },
      { cols: 12 },
    ),
  }
}

// Демо живёт в колонке витрины, а не во весь экран, поэтому пороги свои:
// брейкпоинты — свойство приложения, а не константа пакета.
const breakpoints = { lg: 680, md: 520, sm: 400, xs: 0 }
const cols = { lg: 12, md: 8, sm: 4, xs: 2 }
</script>

<template>
  <div class="flex flex-col gap-4">
    <GrDashboardPalette :items="catalogue" @add="add" />

    <GrDashboard
      v-model:layout="layout"
      mode="edit"
      :breakpoints="breakpoints"
      :cols="cols"
      :row-height="72"
    >
      <GrDashboardItem
        v-for="item in layout.lg"
        :key="item.id"
        :item-id="item.id"
        :title="titles[item.id]"
      >
        <p class="text-[var(--gr-muted-fg)]">Добавлен из каталога — кликом или с клавиатуры.</p>
      </GrDashboardItem>
    </GrDashboard>
  </div>
</template>
