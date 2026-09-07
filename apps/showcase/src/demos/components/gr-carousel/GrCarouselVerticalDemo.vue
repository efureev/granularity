<script setup lang="ts">
import { ref } from 'vue'

import { GrCard, GrCarousel, GrCarouselSlide } from '@feugene/granularity'

const step = ref(0)

const releases = [
  { title: 'Ноябрь', text: 'Виртуализация ленты и вертикальная ориентация.' },
  { title: 'Октябрь', text: 'Кольцо замыкается без отката через все кадры.' },
  { title: 'Сентябрь', text: 'Полоса миниатюр и живой регион для диктора.' },
]
</script>

<template>
  <GrCard class="grid gap-3 p-4">
    <div class="text-sm font-semibold text-[var(--gr-fg)]">
      Вертикальная лента
    </div>

    <!--
      Высота задаётся здесь и обязательна: шаг вертикальной ленты считается от
      высоты вьюпорта, и без неё кадры встали бы столбцом.
    -->
    <GrCarousel
        v-model="step"
        orientation="vertical"
        class="h-56"
        aria-label="История выпусков"
        :autoplay="false"
    >
      <GrCarouselSlide
          v-for="release in releases"
          :key="release.title"
          :label="release.title"
      >
        <div class="flex h-full flex-col justify-center gap-2 rounded-[var(--gr-radius-lg)] bg-[var(--gr-muted)] p-6">
          <div class="text-base font-semibold text-[var(--gr-fg)]">
            {{ release.title }}
          </div>
          <div class="text-sm text-[var(--gr-muted-fg)]">
            {{ release.text }}
          </div>
        </div>
      </GrCarouselSlide>
    </GrCarousel>

    <div class="text-sm text-[var(--gr-muted-fg)]">
      Стрелки переезжают на ось движения, а поперечная прокрутка страницы
      остаётся за ней: карусель перехватывает только свой жест.
    </div>
  </GrCard>
</template>
