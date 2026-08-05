<script setup lang="ts">
import { computed, ref } from 'vue'

import type { GrImageViewerSource } from '@feugene/granularity'
import { GrBadge, GrButton, GrImageViewer } from '@feugene/granularity'

function createSlide(label: string, background: string) {
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 900">
      <rect width="1200" height="900" fill="${background}" />
      <text x="140" y="520" fill="white" font-size="114" font-family="Arial, sans-serif" font-weight="700">${label}</text>
    </svg>
  `)}`
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
    { src: createSlide(`Page ${page.value}`, '#047857'), alt: `Скан страницы ${page.value}` },
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
</template>
