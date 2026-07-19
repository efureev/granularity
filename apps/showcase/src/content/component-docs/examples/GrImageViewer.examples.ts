import type { ShowcaseComponentExampleDoc } from '../types'

export const grImageViewerExamples: ShowcaseComponentExampleDoc[] = [
  {
    id: 'image-viewer-gallery',
    title: 'Fullscreen gallery from thumbnails',
    description: 'Базовый media-flow: открываем `GrImageViewer` из gallery grid и синхронизируем `initialIndex` c выбранной thumbnail.',
    status: 'ready',
    previewKey: 'gr-image-viewer-gallery',
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
    previewKey: 'gr-image-viewer-toolbar-slot',
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
    id: 'image-viewer-real-size',
    title: 'Real image size in toolbar',
    description: 'Картинка фиксированного размера (1000×1500): компонент сам отдаёт в slot natural-размер, фактический rendered-размер и реальный масштаб (`realScalePercent`), поэтому не нужно вручную читать DOM.',
    status: 'ready',
    previewKey: 'gr-image-viewer-real-size',
    code: `<script setup lang="ts">
import { ref } from 'vue'

import { GrImageViewer } from '@feugene/granularity'

const slides = ['https://picsum.photos/id/1015/1000/1500']
const open = ref(false)
</script>

<template>
  <GrImageViewer v-model="open" :url-list="slides" :show-zoom-value="false">
    <template #toolbar="{ scale, naturalWidth, naturalHeight, renderedWidth, renderedHeight, realScalePercent }">
      <div>
        <span>Natural: {{ naturalWidth }} × {{ naturalHeight }} px</span>
        <span>Rendered: {{ renderedWidth }} × {{ renderedHeight }} px</span>
        <span>Nominal scale: {{ Math.round(scale * 100) }}%</span>
        <span>Real scale: {{ realScalePercent }}%</span>
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
    previewKey: 'gr-image-viewer-async-media',
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
