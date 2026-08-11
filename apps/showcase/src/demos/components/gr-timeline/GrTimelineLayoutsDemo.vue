<script setup lang="ts">
import { ref } from 'vue'
import { GrSegmented, GrTimeline, GrTimelineItem } from '@feugene/granularity'

type Layout = 'stacked' | 'time' | 'alternate' | 'horizontal'

const layout = ref<Layout>('time')

const options = [
  { value: 'stacked', label: 'Одна ось' },
  { value: 'time', label: 'Колонка времени' },
  { value: 'alternate', label: 'Чередование' },
  { value: 'horizontal', label: 'Горизонталь' },
]

const events = [
  { at: '09:15', title: 'Сборка запущена', tone: 'primary' as const },
  { at: '09:22', title: 'Тесты пройдены', tone: 'success' as const },
  { at: '09:24', title: 'Задеплоено на stage', tone: 'info' as const },
  { at: '09:40', title: 'Ждём approve', tone: 'warning' as const, pending: true },
]
</script>

<template>
  <div class="grid gap-5">
    <GrSegmented v-model="layout" :options="options" size="sm" />

    <GrTimeline
      :items="events"
      item-key="at"
      :layout="layout === 'horizontal' ? 'stacked' : layout"
      :orientation="layout === 'horizontal' ? 'horizontal' : 'vertical'"
    >
      <template #item="{ item }">
        <GrTimelineItem
          :time="item.at"
          :title="item.title"
          :tone="item.tone"
          :pending="item.pending"
        />
      </template>
    </GrTimeline>
  </div>
</template>
