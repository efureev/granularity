<script setup lang="ts">
import { ref } from 'vue'

import { GrBadge } from '@feugene/granularity'
import type { GrDashboardResponsiveLayout } from '@feugene/granularity-dashboard'

/**
 * Виджет — не рамка вокруг содержимого, а карточка со своей поверхностью:
 * заголовок, действия рядом с ним, подвал. Плюс собственные границы размера:
 * их знает виджет, а не раскладка.
 */
const breakpoints = { lg: 680, md: 520, sm: 400, xs: 0 }
const cols = { lg: 12, md: 8, sm: 4, xs: 2 }

const layout = ref<GrDashboardResponsiveLayout>({
  lg: [
    { id: 'report', x: 0, y: 0, w: 7, h: 3 },
    { id: 'narrow', x: 7, y: 0, w: 5, h: 3 },
    { id: 'pinned', x: 0, y: 3, w: 12, h: 2 },
  ],
})
</script>

<template>
  <GrDashboard
    v-model:layout="layout"
    mode="edit"
    :breakpoints="breakpoints"
    :cols="cols"
    :row-height="72"
  >
    <!-- Шапка, действия и подвал — три слота вокруг содержимого. -->
    <GrDashboardItem item-id="report" title="Отчёт за квартал">
      <template #actions>
        <GrBadge tone="info" size="sm">черновик</GrBadge>
      </template>

      <p class="text-[var(--gr-muted-fg)]">
        Слот <code>#actions</code> держит то, что относится к заголовку: статус, счётчик, кнопку меню.
      </p>

      <template #footer>
        <span class="text-[length:var(--gr-text-sm)] leading-[var(--gr-leading-sm)] text-[var(--gr-muted-fg)]">
          Обновлён 14 июля, 09:40
        </span>
      </template>
    </GrDashboardItem>

    <!--
      Границы объявляет сам виджет: раскладка знает координаты, а «ниже двух
      строк я нечитаем» знает только он. Попробуйте сжать его уголком.
    -->
    <GrDashboardItem item-id="narrow" title="Не сжимается" :min-w="4" :min-h="2">
      <p class="text-[var(--gr-muted-fg)]">
        <code>min-w="4"</code> и <code>min-h="2"</code>: уголок растягивания дальше этих границ не пустит —
        ни мышью, ни с клавиатуры.
      </p>
    </GrDashboardItem>

    <!-- Статика: ручек у неё нет вовсе, и соседи её обтекают. -->
    <GrDashboardItem item-id="pinned" title="Плановые работы" static>
      <p class="text-[var(--gr-muted-fg)]">
        Закреплённый виджет не двигается ни сам, ни соседями — перемещение, упёршееся в него, отменяется целиком.
      </p>
    </GrDashboardItem>
  </GrDashboard>
</template>
