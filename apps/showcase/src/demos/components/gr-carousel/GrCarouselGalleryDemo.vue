<script setup lang="ts">
import { ref } from 'vue'

import { GrCarousel, GrCarouselSlide } from '@feugene/granularity'

const frame = ref(0)

const photos = [
  { id: 'front', title: 'Вид спереди', tone: 'var(--gr-primary)' },
  { id: 'side', title: 'Профиль', tone: 'var(--gr-info)' },
  { id: 'back', title: 'Задняя панель', tone: 'var(--gr-success)' },
  { id: 'ports', title: 'Разъёмы', tone: 'var(--gr-warning)' },
]
</script>

<template>
  <div class="max-w-lg">
    <GrCarousel v-model="frame" aria-label="Фотографии товара" indicators="thumbnails">
      <GrCarouselSlide v-for="photo in photos" :key="photo.id" :label="photo.title">
        <div
          class="flex h-56 items-center justify-center text-[var(--gr-primary-fg)]"
          :style="{ background: photo.tone }"
        >
          {{ photo.title }}
        </div>

        <!-- Миниатюрой может быть любая разметка, не только картинка по URL. -->
        <template #thumbnail>
          <div class="h-full w-full" :style="{ background: photo.tone }" />
        </template>
      </GrCarouselSlide>
    </GrCarousel>

    <p class="mt-3 text-[length:var(--gr-text-sm)] leading-[var(--gr-leading-sm)] text-[var(--gr-muted-fg)]">
      Кадр {{ frame + 1 }} из {{ photos.length }}
    </p>
  </div>
</template>
