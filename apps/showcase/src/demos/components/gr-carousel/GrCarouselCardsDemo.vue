<script setup lang="ts">
import { GrAvatar, GrCard, GrCarousel, GrCarouselSlide } from '@feugene/granularity'

const reviews = [
  { id: 'a', name: 'Марина К.', role: 'Продуктовый аналитик', text: 'Отчёт, который раньше собирали полдня, теперь готов к утренней планёрке.' },
  { id: 'b', name: 'Дмитрий О.', role: 'Руководитель поддержки', text: 'Очередь обращений видно целиком, а не по одному экрану за раз.' },
  { id: 'c', name: 'Алина В.', role: 'Финансовый директор', text: 'Сверка закрывается за один проход: расхождения подсвечиваются сразу.' },
]
</script>

<template>
  <div class="w-full">
    <GrCarousel aria-label="Отзывы клиентов" tone="slate" :loop="false">
      <GrCarouselSlide v-for="review in reviews" :key="review.id" :label="review.name">
        <div class="px-14 py-1">
          <GrCard>
            <blockquote class="flex flex-col gap-4">
              <p class="text-[length:var(--gr-text-base)] leading-[var(--gr-leading-base)]">
                «{{ review.text }}»
              </p>
              <footer class="flex items-center gap-3">
                <GrAvatar :name="review.name" size="sm" />
                <span class="min-w-0">
                  <span class="block truncate text-[length:var(--gr-text-sm)] leading-[var(--gr-leading-sm)] font-600">
                    {{ review.name }}
                  </span>
                  <span class="block truncate text-[length:var(--gr-text-xs)] leading-[var(--gr-leading-xs)] text-[var(--gr-muted-fg)]">
                    {{ review.role }}
                  </span>
                </span>
              </footer>
            </blockquote>
          </GrCard>
        </div>
      </GrCarouselSlide>
    </GrCarousel>
  </div>
</template>
