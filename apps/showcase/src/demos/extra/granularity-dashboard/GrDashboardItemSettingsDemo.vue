<script setup lang="ts">
import { ref } from 'vue'
import type { GrDashboardResponsiveLayout } from '@feugene/granularity-dashboard'

/**
 * Настройки виджета: размер в ячейках даёт пакет, период — приложение.
 *
 * Кнопку-шестерёнку рисует сам виджет (`show-settings`), окно приложение
 * открывает по `item-settings` от сетки — так подписка одна на всю сетку, а не
 * по одной на каждый виджет.
 */
const layout = ref<GrDashboardResponsiveLayout>({
  lg: [
    { id: 'revenue', x: 0, y: 0, w: 6, h: 2 },
    { id: 'orders', x: 6, y: 0, w: 6, h: 2, minW: 3 },
  ],
})

const titles: Record<string, string> = { revenue: 'Выручка', orders: 'Заказы' }
const periods = [
  { value: 'week', label: 'Неделя' },
  { value: 'month', label: 'Месяц' },
  { value: 'quarter', label: 'Квартал' },
]

const period = ref<Record<string, string>>({ revenue: 'month', orders: 'week' })
const draft = ref('month')

const open = ref(false)
const editing = ref<string | null>(null)

function openSettings(id: string): void {
  editing.value = id
  draft.value = period.value[id] ?? 'month'
  open.value = true
}

function apply(id: string): void {
  period.value = { ...period.value, [id]: draft.value }
}

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
    aria-label="Настройки виджета"
    @item-settings="openSettings"
  >
    <GrDashboardItem
      v-for="item in layout.lg"
      :key="item.id"
      :item-id="item.id"
      :title="titles[item.id]"
      show-settings
      overflow="hidden"
    >
      <p class="text-[var(--gr-muted-fg)]">
        Период: {{ periods.find(entry => entry.value === period[item.id])?.label }}
      </p>
    </GrDashboardItem>

    <GrDashboardItemSettings v-model="open" :item-id="editing" @apply="apply">
      <GrFormField label="Период">
        <GrSelect v-model="draft" :options="periods" />
      </GrFormField>
    </GrDashboardItemSettings>
  </GrDashboard>
</template>
