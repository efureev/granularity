import type { ShowcaseComponentExampleDoc } from '../types'

export const grLoadingExamples: ShowcaseComponentExampleDoc[] = [
  {
    id: 'loading-inline-overlay',
    title: 'Inline section overlay',
    description: 'Базовый сценарий для `GrLoading`: временно перекрываем card/section поверх уже существующего контента.',
    status: 'ready',
    previewKey: 'ds-loading-inline-overlay',
    code: `<script setup lang="ts">
import { ref } from 'vue'

import { GrButton, GrLoading } from '@feugene/granularity'

const loading = ref(false)
</script>

<template>
  <GrButton @click="loading = !loading">
    Toggle inline loading
  </GrButton>

  <div class="relative min-h-[180px] rounded-xl border p-4">
    <GrLoading v-if="loading" text="Refreshing rows..." />
  </div>
</template>`,
  },
  {
    id: 'loading-custom-appearance',
    title: 'Custom appearance and z-index',
    description: 'Демонстрируем настройку `background`, `spinnerClass`, `animated` и `zIndex` для branded overlays.',
    status: 'ready',
    previewKey: 'ds-loading-custom-appearance',
    code: `<script setup lang="ts">
import { ref } from 'vue'

import { GrButton, GrLoading } from '@feugene/granularity'

const loading = ref(false)
</script>

<template>
  <GrButton variant="outline" @click="loading = !loading">
    Toggle custom overlay
  </GrButton>

  <div class="relative min-h-[180px] rounded-xl border p-4">
    <GrLoading
      v-if="loading"
      text="Preparing migration plan..."
      background="color-mix(in srgb, var(--fg) 78%, transparent)"
      spinner-class="text-[var(--bg)] h-8 w-8"
      :animated="false"
      :z-index="20"
    />
  </div>
</template>`,
  },
  {
    id: 'loading-fullscreen',
    title: 'Fullscreen async cycle',
    description: 'Отдельно показываем global overlay режим `fullscreen` для коротких cross-page sync/reset операций.',
    status: 'ready',
    previewKey: 'ds-loading-fullscreen',
    code: `<script setup lang="ts">
import { ref } from 'vue'

import { GrButton, GrLoading } from '@feugene/granularity'

const loading = ref(false)
</script>

<template>
  <GrButton @click="loading = true">
    Simulate global sync
  </GrButton>

  <GrLoading v-if="loading" fullscreen text="Syncing workspace data..." />
</template>`,
  },
]
