<script setup lang="ts">
import { GrButton, GrCarousel, GrCarouselSlide } from '@feugene/granularity'

const steps = [
  { id: 'project', n: '1', title: 'Заведите проект', text: 'Название и часовой пояс — остальное можно поменять позже.', cta: 'Создать проект' },
  { id: 'team', n: '2', title: 'Позовите команду', text: 'Приглашение по ссылке, роли настраиваются потом.', cta: 'Скопировать ссылку' },
  { id: 'data', n: '3', title: 'Подключите источник', text: 'База, API или загрузка файлом — на выбор.', cta: 'Выбрать источник' },
]
</script>

<template>
  <div class="w-full">
    <GrCarousel
      aria-label="Знакомство с сервисом"
      tone="info"
      autoplay
      :autoplay-interval="7000"
    >
      <GrCarouselSlide v-for="step in steps" :key="step.id" :label="step.title">
        <div class="flex h-56 flex-col items-start justify-center gap-3 rounded-[var(--gr-radius-md)] bg-[var(--gr-muted)] px-14">
          <span class="inline-flex h-7 w-7 items-center justify-center rounded-[var(--gr-radius-full)] bg-[var(--gr-info)] text-[length:var(--gr-text-sm)] leading-[var(--gr-leading-sm)] text-[var(--gr-primary-fg)] font-600">
            {{ step.n }}
          </span>
          <h3 class="text-[length:var(--gr-text-xl)] leading-[var(--gr-leading-xl)] font-600">
            {{ step.title }}
          </h3>
          <p class="max-w-md text-[length:var(--gr-text-sm)] leading-[var(--gr-leading-sm)] text-[var(--gr-muted-fg)]">
            {{ step.text }}
          </p>
          <GrButton size="sm" variant="secondary">
            {{ step.cta }}
          </GrButton>
        </div>
      </GrCarouselSlide>
    </GrCarousel>
  </div>
</template>
