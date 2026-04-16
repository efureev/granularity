import type { ShowcaseComponentExampleDoc } from '../types'

export const dsLoadingExamples: ShowcaseComponentExampleDoc[] = [
  {
    id: 'loading-inline-overlay',
    title: 'Inline section overlay',
    description: 'Базовый сценарий для `DsLoading`: временно перекрываем card/section поверх уже существующего контента.',
    status: 'ready',
    previewKey: 'ds-loading-inline-overlay',
    code: `<script setup lang="ts">
import { ref } from 'vue'

import { DsButton, DsLoading } from '@feugene/granularity'

const loading = ref(false)
</script>

<template>
  <DsButton @click="loading = !loading">
    Toggle inline loading
  </DsButton>

  <div class="relative min-h-[180px] rounded-xl border p-4">
    <DsLoading v-if="loading" text="Refreshing rows..." />
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

import { DsButton, DsLoading } from '@feugene/granularity'

const loading = ref(false)
</script>

<template>
  <DsButton variant="outline" @click="loading = !loading">
    Toggle custom overlay
  </DsButton>

  <div class="relative min-h-[180px] rounded-xl border p-4">
    <DsLoading
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

import { DsButton, DsLoading } from '@feugene/granularity'

const loading = ref(false)
</script>

<template>
  <DsButton @click="loading = true">
    Simulate global sync
  </DsButton>

  <DsLoading v-if="loading" fullscreen text="Syncing workspace data..." />
</template>`,
  },
]
