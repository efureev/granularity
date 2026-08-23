<script setup lang="ts">
import { ref } from 'vue'

import { GrBadge, GrButton, GrTable } from '@feugene/granularity'
import type { GrBadgeTone } from '@feugene/granularity'
import type { GrDashboardResponsiveLayout } from '@feugene/granularity-dashboard'

/**
 * Виджет без шапки: заголовка нет, значит и шапки нет — ни в просмотре, ни в
 * редактировании. Ручка переноса выезжает сверху по наведению и по фокусу, а
 * содержимое при переключении режима не сдвигается.
 */
const mode = ref<'view' | 'edit'>('edit')

const breakpoints = { lg: 680, md: 520, sm: 400, xs: 0 }
const cols = { lg: 12, md: 8, sm: 4, xs: 2 }

const layout = ref<GrDashboardResponsiveLayout>({
  lg: [
    { id: 'rows', x: 0, y: 0, w: 7, h: 4 },
    { id: 'score', x: 7, y: 0, w: 5, h: 4 },
  ],
})

interface Row {
  region: string
  status: string
  tone: GrBadgeTone
  share: string
}

const regions = [
  'Москва',
  'Санкт-Петербург',
  'Новосибирск',
  'Екатеринбург',
  'Казань',
  'Нижний Новгород',
  'Челябинск',
  'Самара',
  'Омск',
  'Ростов-на-Дону',
  'Уфа',
  'Красноярск',
  'Воронеж',
  'Пермь',
  'Волгоград',
  'Краснодар',
  'Саратов',
  'Тюмень',
  'Тольятти',
  'Ижевск',
]

/** Двадцать строк: столько уже не влезает в виджет — и шапка обязана остаться на месте. */
const rows: Row[] = regions.map((region, index) => ({
  region,
  status: index % 7 === 3 ? 'Задержки' : 'Норма',
  tone: index % 7 === 3 ? 'warning' : 'success',
  share: `${Math.max(1, 38 - index * 2)}%`,
}))
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
      <!-- Таблица от края до края: `padding="none"` отдаёт виджет содержимому. -->
      <!--
        Скроллит сама таблица, а не тело виджета: `sticky` у шапки прилипает к
        ближайшему скролл-контейнеру, и со скроллом на теле она уехала бы вместе
        со строками. Отсюда `overflow="hidden"` у виджета — иначе скроллеров два.
      -->
      <GrDashboardItem item-id="rows" aria-label="Регионы" padding="none" overflow="hidden">
        <GrTable size="sm" sticky-header max-height="100%" aria-label="Доли по регионам">
          <template #header>
            <tr>
              <th class="px-3 py-2 text-left font-600">Регион</th>
              <th class="px-3 py-2 text-left font-600">Статус</th>
              <th class="px-3 py-2 text-right font-600">Доля</th>
            </tr>
          </template>

          <tr v-for="row in rows" :key="row.region" class="border-t border-[var(--gr-brd)]">
            <td class="px-3 py-2">{{ row.region }}</td>
            <td class="px-3 py-2">
              <GrBadge size="sm" :tone="row.tone">{{ row.status }}</GrBadge>
            </td>
            <td class="px-3 py-2 text-right [font-variant-numeric:tabular-nums]">{{ row.share }}</td>
          </tr>
        </GrTable>
      </GrDashboardItem>

      <!--
        Одна большая цифра: шапка тут только отняла бы место, прокрутка не нужна,
        а удаление виджета живёт в панели редактирования.
      -->
      <GrDashboardItem
        item-id="score"
        aria-label="Индекс качества"
        overflow="hidden"
        padding="lg"
      >
        <template #editActions>
          <GrButton size="xs" variant="ghost" tone="danger" aria-label="Убрать виджет">
            Убрать
          </GrButton>
        </template>

        <div class="flex h-full flex-col items-center justify-center gap-1 text-center">
          <strong class="text-[length:var(--gr-text-4xl)] leading-[var(--gr-leading-3xl)] [font-variant-numeric:tabular-nums]">
            94
          </strong>
          <span class="text-[length:var(--gr-text-sm)] leading-[var(--gr-leading-sm)] text-[var(--gr-muted-fg)]">
            индекс качества
          </span>
        </div>
      </GrDashboardItem>
    </GrDashboard>
  </div>
</template>
