<script setup lang="ts">
import { GrButton, GrCarousel, GrCarouselSlide } from '@feugene/granularity'

const steps = [
  { id: 'project', title: 'Заведите проект', text: 'Название и часовой пояс — остальное можно поменять позже.' },
  { id: 'team', title: 'Позовите команду', text: 'Приглашение по ссылке, роли настраиваются потом.' },
  { id: 'data', title: 'Подключите источник', text: 'База, API или загрузка файлом — на выбор.' },
]
</script>

<template>
  <div class="max-w-lg">
    <GrCarousel aria-label="Знакомство с сервисом" autoplay :autoplay-interval="7000">
      <GrCarouselSlide v-for="step in steps" :key="step.id" :label="step.title">
        <div class="flex h-48 flex-col items-start justify-center gap-3 bg-[var(--gr-muted)] px-14">
          <h3 class="text-[length:var(--gr-text-lg)] leading-[var(--gr-leading-lg)] font-600">
            {{ step.title }}
          </h3>
          <p class="text-[length:var(--gr-text-sm)] leading-[var(--gr-leading-sm)] text-[var(--gr-muted-fg)]">
            {{ step.text }}
          </p>
          <GrButton size="sm">
            Настроить
          </GrButton>
        </div>
      </GrCarouselSlide>
    </GrCarousel>
  </div>
</template>
