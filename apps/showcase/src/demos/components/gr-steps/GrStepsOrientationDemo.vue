<script setup lang="ts">
import { ref } from 'vue'

import { GrSteps } from '@feugene/granularity'
import type { GrStep } from '@feugene/granularity'

const steps: GrStep[] = [
  { value: 'upload', label: 'Загрузка', description: 'CSV или XLSX' },
  { value: 'map', label: 'Сопоставление', description: 'Колонки к полям' },
  { value: 'preview', label: 'Предпросмотр', status: 'error' },
  { value: 'run', label: 'Запуск' },
]

const current = ref('map')
</script>

<template>
  <div class="grid gap-6 lg:grid-cols-[minmax(0,1fr)_240px]">
    <GrSteps v-model="current" :steps="steps" aria-label="Импорт данных" />

    <GrSteps
      v-model="current"
      :steps="steps"
      orientation="vertical"
      aria-label="Импорт данных, вертикально"
    />
  </div>
</template>
