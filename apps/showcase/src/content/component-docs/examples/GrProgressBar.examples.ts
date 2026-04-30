import type { ShowcaseComponentExampleDoc } from '../types'

export const grProgressBarExamples: ShowcaseComponentExampleDoc[] = [
  {
    id: 'progress-bar-basic-flow',
    title: 'Interactive determinate progress',
    description: 'Базовый сценарий: меняем `value`, переключаем `tone` и рядом выводим фактический процент выполнения.',
    status: 'ready',
    previewKey: 'ds-progress-bar-basic-flow',
    code: `<script setup lang="ts">
import { ref } from 'vue'

import { GrButton, GrProgressBar } from '@feugene/granularity'

const progress = ref(32)
const tone = ref<'primary' | 'neutral' | 'success' | 'warning' | 'danger' | 'info' | 'slate' | 'azure'>('primary')

const tones = [
  'primary',
  'neutral',
  'success',
  'warning',
  'danger',
  'info',
  'slate',
  'azure',
] as const
</script>

<template>
  <div class="grid gap-3">
    <div class="flex flex-wrap gap-2">
      <GrButton size="sm" variant="outline" @click="progress = Math.max(0, progress - 16)">
        -16%
      </GrButton>
      <GrButton size="sm" @click="progress = Math.min(100, progress + 16)">
        +16%
      </GrButton>
    </div>

    <div class="flex flex-wrap gap-2">
      <GrButton
        v-for="item in tones"
        :key="item"
        size="sm"
        variant="outline"
        :tone="item"
        @click="tone = item"
      >
        {{ item }}
      </GrButton>
    </div>

    <GrProgressBar :value="progress" :tone="tone" aria-label="Verification progress" />
  </div>
</template>`,
  },
  {
    id: 'progress-bar-clamped-values',
    title: 'Out-of-range inputs are clamped',
    description: 'Документируем важный edge-case: отрицательные и слишком большие значения безопасно ограничиваются диапазоном 0–100.',
    status: 'ready',
    previewKey: 'ds-progress-bar-clamped-values',
    code: `<script setup lang="ts">
import { GrBadge, GrProgressBar } from '@feugene/granularity'

const rows = [
  { label: 'Imported from legacy job', raw: -18, tone: 'danger' },
  { label: 'Actual processed records', raw: 58, tone: 'info' },
  { label: 'Overreported upstream value', raw: 146, tone: 'warning' },
]
</script>

<template>
  <div class="grid gap-3">
    <div v-for="row in rows" :key="row.label" class="grid gap-2">
      <GrBadge size="sm" :tone="row.tone">input: {{ row.raw }}%</GrBadge>
      <GrProgressBar :value="row.raw" :tone="row.tone" :aria-label="row.label" />
    </div>
  </div>
</template>`,
  },
  {
    id: 'progress-bar-pipeline-stages',
    title: 'Stack of workflow stages',
    description: 'Data-display сценарий для pipelines/checklists: несколько progress bars в списке статусов одного workflow с семантическим `tone` у каждого этапа.',
    status: 'ready',
    previewKey: 'ds-progress-bar-pipeline-stages',
    code: `<script setup lang="ts">
import { GrBadge, GrProgressBar } from '@feugene/granularity'

const stages = [
  { label: 'Validation', value: 100, tone: 'success' },
  { label: 'Fraud screening', value: 72, tone: 'warning' },
  { label: 'Settlement', value: 41, tone: 'neutral' },
]
</script>

<template>
  <div class="grid gap-3">
    <div v-for="stage in stages" :key="stage.label" class="grid gap-2">
      <GrBadge size="sm" :tone="stage.tone">{{ stage.value }}%</GrBadge>
      <GrProgressBar :value="stage.value" :tone="stage.tone" :aria-label="stage.label" />
    </div>
  </div>
</template>`,
  },
]
