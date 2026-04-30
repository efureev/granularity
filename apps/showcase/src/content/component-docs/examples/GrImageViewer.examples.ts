import type { ShowcaseComponentExampleDoc } from '../types'

export const grImageViewerExamples: ShowcaseComponentExampleDoc[] = [
  {
    id: 'image-viewer-gallery',
    title: 'Fullscreen gallery from thumbnails',
    description: 'Базовый media-flow: открываем `GrImageViewer` из gallery grid и синхронизируем `initialIndex` c выбранной thumbnail.',
    status: 'ready',
    previewKey: 'ds-image-viewer-gallery',
    code: `<script setup lang="ts">
import { ref } from 'vue'

import { GrImageViewer } from '@feugene/granularity'

const open = ref(false)
const initialIndex = ref(0)
</script>

<template>
  <GrImageViewer
    v-model="open"
    :url-list="slides"
    :initial-index="initialIndex"
    show-progress
  />
</template>`,
  },
  {
    id: 'image-viewer-toolbar-slot',
    title: 'Custom toolbar slot',
    description: 'Показываем slot-based composition: кастомный toolbar с action-кнопками и собственным progress/zoom summary поверх overlay.',
    status: 'ready',
    previewKey: 'ds-image-viewer-toolbar-slot',
    code: `<script setup lang="ts">
import { ref } from 'vue'

import { GrImageViewer } from '@feugene/granularity'

const open = ref(false)
</script>

<template>
  <GrImageViewer v-model="open" :url-list="slides" :show-zoom-value="false">
    <template #toolbar="{ displayIndex, total, actions }">
      <div class="flex items-center gap-2">
        <button type="button" @click="actions.prev">Prev</button>
        <span>{{ displayIndex }} / {{ total }}</span>
        <button type="button" @click="actions.next">Next</button>
      </div>
    </template>
  </GrImageViewer>
</template>`,
  },
  {
    id: 'image-viewer-async-media',
    title: 'Async gallery loading',
    description: 'Закрываем async/media use-case: сначала показываем loading/progress, затем открываем viewer после получения media payload.',
    status: 'ready',
    previewKey: 'ds-image-viewer-async-media',
    code: `<script setup lang="ts">
import { computed, ref } from 'vue'

import { GrImageViewer, GrProgressBar } from '@feugene/granularity'

const loading = ref(false)
const progress = ref(0)
const slides = ref<string[]>([])
const open = ref(false)
const hasSlides = computed(() => slides.value.length > 0)
</script>

<template>
  <GrProgressBar :value="progress" aria-label="Gallery loading progress" />
  <GrImageViewer v-model="open" :url-list="slides" show-progress />
</template>`,
  },
]
