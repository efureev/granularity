<script setup lang="ts">
import { ref } from 'vue'

// `GrCalendar` подставляется авто-импортом (`unplugin-vue-components`).
import type { PlainDate } from '@feugene/granularity-chrono'
import { plainDateKey } from '@feugene/granularity-chrono'

const value = ref<PlainDate | null>(null)

/** Нагрузка дня: ключ `2026-08-12` совпадает с ключом ячейки сетки. */
const eventsByDay: Record<string, number> = {
  '2026-08-04': 1,
  '2026-08-12': 3,
  '2026-08-13': 2,
  '2026-08-21': 1,
}

function eventsOn(date: PlainDate): number {
  return eventsByDay[plainDateKey(date)] ?? 0
}
</script>

<template>
  <div class="grid gap-4 justify-items-start">
    <GrCalendar
      v-model="value"
      :view-date="{ y: 2026, m: 7, d: 1 }"
      locale="en-US"
      aria-label="Schedule"
    >
      <!-- Слот отдаёт саму ячейку: число рисуем сами и дописываем метки. -->
      <template #day="{ cell, selected }">
        <span class="relative inline-flex flex-col items-center leading-none">
          <span>{{ cell.date.d }}</span>
          <span
            v-if="eventsOn(cell.date) && !selected"
            class="mt-0.5 h-1 w-1 rounded-[var(--gr-radius-full)] bg-[var(--gr-primary)]"
            :aria-label="`${eventsOn(cell.date)} events`"
          />
        </span>
      </template>
    </GrCalendar>

    <p class="showcase-demo-text text-sm">
      <span class="opacity-70">busy days=</span><code>{{ Object.keys(eventsByDay).length }}</code>
    </p>
  </div>
</template>
