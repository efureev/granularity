<script setup lang="ts">
import { GrBadge, GrTimeline, GrTimelineItem } from '@feugene/granularity'

interface AuditEvent {
  id: number
  day: string
  at: string
  actor: string
  action: string
  tone: 'neutral' | 'success' | 'warning' | 'danger'
}

const events: AuditEvent[] = [
  { id: 1, day: '12 августа', at: '18:02', actor: 'Петрова А.', action: 'Изменила права роли «Менеджер»', tone: 'warning' },
  { id: 2, day: '12 августа', at: '11:41', actor: 'Иванов И.', action: 'Пригласил пользователя', tone: 'success' },
  { id: 3, day: '11 августа', at: '20:15', actor: 'Система', action: 'Ротация ключей API', tone: 'neutral' },
  { id: 4, day: '11 августа', at: '09:03', actor: 'Сидоров П.', action: 'Удалил проект «Архив 2024»', tone: 'danger' },
]
</script>

<template>
  <div class="max-w-lg">
    <GrTimeline :items="events" item-key="id" group-by="day" density="compact">
      <template #group="{ group, items }">
        {{ group }} · {{ items.length }}
      </template>

      <template #item="{ item }">
        <GrTimelineItem :time="item.at" :tone="item.tone">
          <template #title>
            {{ item.action }}
          </template>
          <template #description>
            {{ item.actor }}
          </template>
        </GrTimelineItem>
      </template>
    </GrTimeline>

    <p class="mt-4 text-[length:var(--gr-text-xs)] text-[var(--gr-muted-fg)]">
      Порядок задаёт приложение: <GrBadge size="xs">groupBy</GrBadge> только режет набор на группы и не сортирует его.
    </p>
  </div>
</template>
