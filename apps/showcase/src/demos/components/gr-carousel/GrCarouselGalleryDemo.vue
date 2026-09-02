<script setup lang="ts">
import { computed, ref } from 'vue'

import { GrCarousel, GrCarouselSlide } from '@feugene/granularity'

const frame = ref(0)

const photos = [
  { id: 'front', title: 'Вид спереди', note: 'Основной ракурс каталога', tone: 'var(--gr-primary)' },
  { id: 'side', title: 'Профиль', note: 'Толщина корпуса 7,4 мм', tone: 'var(--gr-info)' },
  { id: 'back', title: 'Задняя панель', note: 'Матовое стекло, без бликов', tone: 'var(--gr-success)' },
  { id: 'ports', title: 'Разъёмы', note: 'USB-C, слот карты памяти', tone: 'var(--gr-warning)' },
]

const current = computed(() => photos[frame.value])
</script>

<template>
  <div class="w-full">
    <GrCarousel v-model="frame" aria-label="Фотографии товара" indicators="thumbnails">
      <GrCarouselSlide v-for="photo in photos" :key="photo.id" :label="photo.title">
        <div
          class="relative flex h-72 items-end overflow-hidden rounded-[var(--gr-radius-md)]"
          :style="{ background: photo.tone }"
        >
          <div class="w-full bg-[color-mix(in_srgb,var(--gr-fg)_55%,transparent)] px-5 py-3 text-[var(--gr-primary-fg)]">
            <p class="text-[length:var(--gr-text-base)] leading-[var(--gr-leading-base)] font-600">
              {{ photo.title }}
            </p>
            <p class="text-[length:var(--gr-text-sm)] leading-[var(--gr-leading-sm)] opacity-90">
              {{ photo.note }}
            </p>
          </div>
        </div>

        <template #thumbnail>
          <div class="h-full w-full" :style="{ background: photo.tone }" />
        </template>
      </GrCarouselSlide>
    </GrCarousel>

    <p class="mt-3 text-[length:var(--gr-text-sm)] leading-[var(--gr-leading-sm)] text-[var(--gr-muted-fg)]">
      Кадр {{ frame + 1 }} из {{ photos.length }} — {{ current.title }}
    </p>
  </div>
</template>
