<script setup lang="ts">
import { GrAvatar, GrCard, GrCarousel, GrCarouselSlide } from '@feugene/granularity'

const reviews = [
  { id: 'a', name: 'Марина К.', role: 'Продуктовый аналитик', text: 'Отчёт, который раньше собирали полдня, теперь готов к утренней планёрке.' },
  { id: 'b', name: 'Дмитрий О.', role: 'Руководитель поддержки', text: 'Очередь обращений видно целиком, а не по одному экрану за раз.' },
  { id: 'c', name: 'Алина В.', role: 'Финансовый директор', text: 'Сверка закрывается за один проход: расхождения подсвечиваются сразу.' },
]
</script>

<template>
  <div class="max-w-xl">
    <GrCarousel aria-label="Отзывы клиентов" :loop="false">
      <GrCarouselSlide v-for="review in reviews" :key="review.id" :label="review.name">
        <div class="px-12 py-1">
          <GrCard>
            <div class="flex items-start gap-3">
              <GrAvatar :name="review.name" />
              <div class="min-w-0">
                <p class="text-[length:var(--gr-text-sm)] leading-[var(--gr-leading-sm)]">
                  {{ review.text }}
                </p>
                <p class="mt-2 text-[length:var(--gr-text-xs)] leading-[var(--gr-leading-xs)] text-[var(--gr-muted-fg)]">
                  {{ review.name }} — {{ review.role }}
                </p>
              </div>
            </div>
          </GrCard>
        </div>
      </GrCarouselSlide>
    </GrCarousel>
  </div>
</template>
