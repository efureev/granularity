<script setup lang="ts">
import { computed, ref } from 'vue'
import type {
  GrDashboardDropEvent,
  GrDashboardPaletteItem,
  GrDashboardResponsiveLayout,
} from '@feugene/granularity-dashboard'
import { addItem, removeItem } from '@feugene/granularity-dashboard'

/**
 * Перетаскивание из каталога поверх кнопки, а не вместо неё.
 *
 * Сетка говорит, куда бросили, а кладёт приложение — тем же `addItem`, что и по
 * кнопке. Опции и брейкпоинт приходят в событии: посчитай их демо своими,
 * виджет встал бы не туда, где только что стояла подложка.
 */
const catalogue: GrDashboardPaletteItem[] = [
  { id: 'sessions', title: 'Сессии', description: 'За неделю', defaultSize: { w: 6, h: 2 } },
  { id: 'revenue', title: 'Выручка', description: 'За квартал', defaultSize: { w: 6, h: 2 } },
  { id: 'errors', title: 'Ошибки', description: 'По часам', defaultSize: { w: 8, h: 2 } },
]

const layout = ref<GrDashboardResponsiveLayout>({ lg: [{ id: 'sessions', x: 0, y: 0, w: 6, h: 2 }] })

const placed = computed(() => layout.value.lg ?? [])
const placedIds = computed(() => new Set(placed.value.map(item => item.id)))

/** Уже поставленный виджет остаётся в каталоге, но выключенным: список не прыгает. */
const items = computed<GrDashboardPaletteItem[]>(() => catalogue.map(item => ({
  ...item,
  disabled: placedIds.value.has(item.id),
})))

const titles = new Map(catalogue.map(item => [item.id, item.title]))

function drop(event: GrDashboardDropEvent): void {
  const { transfer, cell, breakpoint, options } = event
  if (placedIds.value.has(transfer.id))
    return

  const next = addItem(
    layout.value[breakpoint] ?? [],
    { id: transfer.id, x: 0, y: 0, w: transfer.size.w, h: transfer.size.h },
    options,
    cell,
  )

  layout.value = { ...layout.value, [breakpoint]: next }
}

function add(item: GrDashboardPaletteItem): void {
  const size = item.defaultSize ?? { w: 6, h: 2 }

  layout.value = {
    ...layout.value,
    lg: addItem(placed.value, { id: item.id, x: 0, y: 0, w: size.w, h: size.h }, { cols: 12 }),
  }
}

function remove(id: string): void {
  layout.value = { ...layout.value, lg: removeItem(placed.value, id, { cols: 12 }) }
}

const breakpoints = { lg: 520, md: 400, sm: 320, xs: 0 }
const cols = { lg: 12, md: 8, sm: 4, xs: 2 }
</script>

<template>
  <div class="grid gap-4 lg:grid-cols-[260px_minmax(0,1fr)] lg:items-start">
    <GrDashboardPalette :items="items" aria-label="Что можно добавить" @add="add" />

    <GrDashboard
      v-model:layout="layout"
      mode="edit"
      :breakpoints="breakpoints"
      :cols="cols"
      :row-height="72"
      aria-label="Сборка дашборда перетаскиванием"
      @item-drop="drop"
    >
      <template #empty>
        <p class="text-[var(--gr-muted-fg)]">
          Перетащите виджет из каталога или нажмите «Добавить».
        </p>
      </template>

      <GrDashboardItem
        v-for="item in placed"
        :key="item.id"
        :item-id="item.id"
        :title="titles.get(item.id)"
        overflow="hidden"
      >
        <template #editActions>
          <GrButton
            size="xs"
            variant="ghost"
            tone="danger"
            :aria-label="`Убрать «${titles.get(item.id)}»`"
            @click="remove(item.id)"
          >
            Убрать
          </GrButton>
        </template>

        <p class="text-[var(--gr-muted-fg)]">Место под содержимое виджета.</p>
      </GrDashboardItem>
    </GrDashboard>
  </div>
</template>
