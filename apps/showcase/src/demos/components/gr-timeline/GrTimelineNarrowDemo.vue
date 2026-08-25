<script setup lang="ts">
import { ref } from 'vue'

import { GrSegmented, GrTimeline, GrTimelineItem } from '@feugene/granularity'

/**
 * Ширина контейнера, а не окна: сжатие считается по доступному месту, поэтому
 * увидеть его можно не трогая размер браузера.
 *
 * Заголовки намеренно длинные и с `truncate`: пока трек ленты держал минимум по
 * содержимому, усечение не срабатывало — усекать было нечего, колонка раздавалась
 * под текст и выносила строку за край.
 */
const width = ref('260')
const widths = [
  { value: '260', label: '260px' },
  { value: '320', label: '320px' },
  { value: '480', label: '480px' },
]

const events = [
  { id: 1, at: '10:24', title: 'Списание за подписку «Расширенный доступ» на месяц', tone: 'neutral' as const },
  { id: 2, at: '11:02', title: 'Пополнение с карты •• 4417 через платёжный шлюз', tone: 'success' as const },
  { id: 3, at: '14:47', title: 'Возврат по отменённой операции от 11 августа', tone: 'warning' as const },
]
</script>

<template>
  <div class="grid gap-4">
    <GrSegmented v-model="width" :options="widths" size="sm" class="justify-self-start" />

    <div
      data-demo-narrow-box
      class="rounded-[var(--gr-radius-md)] border border-dashed border-[var(--gr-brd)] p-3"
      :style="{ width: `${width}px`, maxWidth: '100%' }"
    >
      <GrTimeline layout="time" density="compact">
        <GrTimelineItem
          v-for="event in events"
          :key="event.id"
          :time="event.at"
          :tone="event.tone"
        >
          <template #title>
            <span class="block truncate">{{ event.title }}</span>
          </template>
        </GrTimelineItem>
      </GrTimeline>
    </div>
  </div>
</template>
