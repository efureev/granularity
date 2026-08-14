<script setup lang="ts">
import { computed, ref } from 'vue'

import { GrButton, GrStatistic } from '@feugene/granularity'
import type { GrDashboardPaletteItem, GrDashboardResponsiveLayout } from '@feugene/granularity-dashboard'
import { addItem, removeItem } from '@feugene/granularity-dashboard'

/**
 * Полный круг: добавить виджет из каталога, увидеть его в сетке, убрать обратно.
 *
 * Каталог раскладкой не владеет — он сообщает, что выбрали, а куда это положить,
 * решает приложение. Здесь это две строки с `addItem` и `removeItem` из подпути
 * `./layout`.
 */
const breakpoints = { lg: 520, md: 400, sm: 320, xs: 0 }
const cols = { lg: 12, md: 8, sm: 4, xs: 2 }
const moveOptions = { cols: 12 }

interface Widget extends GrDashboardPaletteItem {
  kind: 'sessions' | 'errors' | 'revenue' | 'uptime'
}

const catalogue: Widget[] = [
  { id: 'sessions', kind: 'sessions', title: 'Сессии', description: 'За неделю', defaultSize: { w: 6, h: 2 } },
  { id: 'revenue', kind: 'revenue', title: 'Выручка', description: 'За квартал', defaultSize: { w: 6, h: 2 } },
  { id: 'errors', kind: 'errors', title: 'Ошибки', description: 'По часам', defaultSize: { w: 12, h: 2 } },
  { id: 'uptime', kind: 'uptime', title: 'Доступность', description: 'За 30 дней', defaultSize: { w: 6, h: 2 } },
]

const layout = ref<GrDashboardResponsiveLayout>({
  lg: [{ id: 'sessions', x: 0, y: 0, w: 6, h: 2 }],
})

const placed = computed(() => layout.value.lg ?? [])
const placedIds = computed(() => new Set(placed.value.map(item => item.id)))

/** Добавленный виджет остаётся в каталоге, но выключенным: список не прыгает. */
const items = computed<GrDashboardPaletteItem[]>(() => catalogue.map(item => ({
  ...item,
  disabled: placedIds.value.has(item.id),
})))

const widgetById = new Map(catalogue.map(item => [item.id, item]))

function add(item: GrDashboardPaletteItem): void {
  const size = item.defaultSize ?? { w: 6, h: 2 }

  layout.value = {
    ...layout.value,
    lg: addItem(placed.value, { id: item.id, x: 0, y: 0, w: size.w, h: size.h }, moveOptions),
  }
}

function remove(id: string): void {
  layout.value = { ...layout.value, lg: removeItem(placed.value, id, moveOptions) }
}

const sessions = [980, 1010, 995, 1042, 1078, 1065, 1120, 1156, 1190, 1215, 1246, 1284]
const errors = [14, 11, 9, 12, 7, 6, 8, 5, 4, 6, 3, 2]
</script>

<template>
  <div class="grid gap-4 lg:grid-cols-[280px_minmax(0,1fr)] lg:items-start">
    <GrDashboardPalette :items="items" aria-label="Что можно добавить" @add="add" />

    <GrDashboard
      v-model:layout="layout"
      mode="edit"
      :breakpoints="breakpoints"
      :cols="cols"
      :row-height="72"
      aria-label="Сборка дашборда"
    >
      <template #empty>
        <p class="text-[var(--gr-muted-fg)]">
          Дашборд пуст — добавьте виджет из каталога слева.
        </p>
      </template>

      <GrDashboardItem
        v-for="item in placed"
        :key="item.id"
        :item-id="item.id"
        :title="widgetById.get(item.id)?.title"
        overflow="hidden"
      >
        <template #editActions>
          <GrButton
            size="xs"
            variant="ghost"
            tone="danger"
            :aria-label="`Убрать «${widgetById.get(item.id)?.title}»`"
            @click="remove(item.id)"
          >
            Убрать
          </GrButton>
        </template>

        <div class="flex h-full flex-col justify-center">
          <GrSparkline v-if="item.id === 'sessions'" :data="sessions" />

          <GrSparkline
            v-else-if="item.id === 'errors'"
            :data="errors"
            variant="area"
            color="var(--gr-chart-2)"
          />

          <GrStatistic
            v-else-if="item.id === 'revenue'"
            :value="12.48"
            :precision="2"
            suffix=" млн ₽"
            tone="success"
            trend="up"
          />

          <GrStatistic
            v-else
            :value="99.95"
            :precision="2"
            suffix=" %"
            tone="success"
          />
        </div>
      </GrDashboardItem>
    </GrDashboard>
  </div>
</template>
