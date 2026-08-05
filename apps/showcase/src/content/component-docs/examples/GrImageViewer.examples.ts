import type { ShowcaseComponentExampleDoc } from '../types'

export const grImageViewerExamples: ShowcaseComponentExampleDoc[] = [
  {
    id: 'image-viewer-alt-and-append',
    title: 'Alt-текст и живой список кадров',
    description: 'Кадры объектами `{ src, alt }` дают изображению описание, а изменение списка не выбрасывает пользователя на первый кадр.',
    status: 'ready',
    previewKey: 'gr-image-viewer-alt-and-append',
    code: `<script setup lang="ts">
import { computed, ref } from 'vue'

import type { GrImageViewerSource } from '@feugene/granularity'
import { GrBadge, GrButton, GrImageViewer } from '@feugene/granularity'

function createSlide(label: string, background: string) {
  return \`data:image/svg+xml;charset=UTF-8,\${encodeURIComponent(\`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 900">
      <rect width="1200" height="900" fill="\${background}" />
      <text x="140" y="520" fill="white" font-size="114" font-family="Arial, sans-serif" font-weight="700">\${label}</text>
    </svg>
  \`)}\`
}

const open = ref(false)
const page = ref(1)

// Кадр объектом — единственный способ дать изображению описание: имя файла
// незрячему пользователю ничего не говорит.
const slides = ref<GrImageViewerSource[]>([
  { src: createSlide('Roof', '#1d4ed8'), alt: 'Кровля здания с высоты птичьего полёта' },
  { src: createSlide('Plan', '#9333ea'), alt: 'Поэтажный план второго этажа' },
])

const currentIndex = ref(0)
const total = computed(() => slides.value.length)

function loadMore() {
  page.value += 1
  slides.value = [
    ...slides.value,
    { src: createSlide(\`Page \${page.value}\`, '#047857'), alt: \`Скан страницы \${page.value}\` },
  ]
}

function prependEarlier() {
  slides.value = [
    { src: createSlide('Earlier', '#b45309'), alt: 'Более ранний снимок объекта' },
    ...slides.value,
  ]
}
</script>

<template>
  <div class="grid gap-4">
    <div class="flex flex-wrap items-center gap-3">
      <GrButton size="sm" @click="open = true">
        Открыть просмотрщик
      </GrButton>
      <GrButton size="sm" variant="outline" @click="loadMore">
        Догрузить следующую страницу
      </GrButton>
      <GrButton size="sm" variant="outline" @click="prependEarlier">
        Добавить кадр в начало
      </GrButton>

      <GrBadge size="sm" tone="neutral">
        {{ total }} кадров · показан {{ currentIndex + 1 }}
      </GrBadge>
    </div>

    <div class="rounded-2xl border border-dashed border-[var(--gr-brd)] p-3 text-sm text-[var(--gr-muted-fg)]">
      Список можно менять на лету: просмотрщик держится за кадр, а не за индекс — открытое
      изображение остаётся на экране вместе с масштабом, даже если сдвинулось по позиции.
    </div>

    <GrImageViewer
      v-model="open"
      :url-list="slides"
      show-progress
      hide-on-click-modal
      @change="currentIndex = $event"
    />
  </div>
</template>`,
  },
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
