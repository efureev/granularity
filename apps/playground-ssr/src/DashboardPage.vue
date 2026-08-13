<script setup lang="ts">
import { ref } from 'vue'

import {
  GrDashboard,
  GrDashboardItem,
  GrDashboardPalette,
  GrDashboardToolbar,
  type GrDashboardResponsiveLayout,
} from '@feugene/granularity-dashboard'

/**
 * Companion-пакет `@feugene/granularity-dashboard` на сервере.
 *
 * Проверяются четыре вещи, каждая из которых видна только в связке «настоящий
 * серверный рендер + гидрация»:
 *
 *  1. **`ResizeObserver` в выборе раскладки.** Ширины контейнера на сервере
 *     нет, а от неё зависит, какую из раскладок показать. Гард обязан работать
 *     режимом, а не отказом: и сервер, и **первый клиентский рендер** берут
 *     `initialBreakpoint`, уточнение приходит уже после гидрации. Возьми
 *     компонент ширину сразу — каждая ячейка приехала бы расхождением;
 *  2. **`IntersectionObserver` при `lazy`.** На сервере наблюдателя нет, а
 *     стартовое состояние обязано совпасть у сервера и первого клиентского
 *     рендера — поэтому с сервера приходит слот-заглушка, и содержимое
 *     монтируется уже в браузере. Компромисс назван в `docs/ssr.md` пакета;
 *  3. **`useId()` в разметке.** Заголовок виджета адресуется из
 *     `aria-labelledby`: разойдись счётчик — и имя группы указывает в пустоту;
 *  4. **`useAnnouncer` в setup.** Сетка зовёт его при монтировании, а живой
 *     регион ставится в документ — на сервере документа нет.
 *
 * Часов пакет не читает вовсе, хранилище не трогает до `onMounted` — поэтому
 * `data-allow-mismatch` здесь не нужен нигде, и гейт обязан быть чист целиком.
 */
const layout = ref<GrDashboardResponsiveLayout>({
  lg: [
    { id: 'revenue', x: 0, y: 0, w: 8, h: 3 },
    { id: 'funnel', x: 8, y: 0, w: 4, h: 3, minW: 3 },
    { id: 'pinned', x: 0, y: 3, w: 12, h: 2, static: true },
  ],
})

const mode = ref<'view' | 'edit'>('edit')

const catalogue = [
  { id: 'sessions', title: 'Сессии', description: 'Посещения за неделю', defaultSize: { w: 4, h: 2 } },
  { id: 'errors', title: 'Ошибки', description: 'Пятисотые по часам' },
]
</script>

<template>
  <main>
    <h1>Dashboard</h1>

    <GrDashboardToolbar v-model:mode="mode" resettable />

    <GrDashboard v-model:layout="layout" :mode="mode" lazy>
      <GrDashboardItem item-id="revenue" title="Выручка">
        <p>Содержимое монтируется в браузере: при `lazy` с сервера приходит заглушка.</p>
        <template #skeleton>
          <p>Загружается…</p>
        </template>
      </GrDashboardItem>

      <GrDashboardItem item-id="funnel" title="Воронка" :min-w="3">
        <p>Границы размера объявляет виджет, а не раскладка.</p>
      </GrDashboardItem>

      <GrDashboardItem item-id="pinned" title="Закреплённый" static>
        <p>Статика не двигается ни сама, ни соседями.</p>
      </GrDashboardItem>
    </GrDashboard>

    <h2>Каталог</h2>
    <GrDashboardPalette :items="catalogue" />
  </main>
</template>
