<script setup lang="ts">
import { ref } from 'vue'

import { GrCarousel, GrCarouselSlide, GrSegmented } from '@feugene/granularity'

const count = ref(1)

const options = [
  { value: 1, label: 'Один кадр' },
  { value: 3, label: 'Три кадра' },
]
</script>

<template>
  <div class="flex max-w-lg flex-col gap-4">
    <GrSegmented v-model="count" :options="options" aria-label="Сколько кадров в ленте" />

    <GrCarousel aria-label="Лента переменного состава">
      <GrCarouselSlide v-for="frame in count" :key="frame" :label="`Кадр ${frame}`">
        <div class="flex h-40 items-center justify-center bg-[var(--gr-muted)]">
          Кадр {{ frame }}
        </div>
      </GrCarouselSlide>
    </GrCarousel>

    <p class="text-[length:var(--gr-text-sm)] leading-[var(--gr-leading-sm)] text-[var(--gr-muted-fg)]">
      На одном кадре стрелки и точки не рисуются вовсе, а не рисуются выключенными:
      выключенный орган управления сообщал бы, что идти есть куда.
    </p>
  </div>
</template>
