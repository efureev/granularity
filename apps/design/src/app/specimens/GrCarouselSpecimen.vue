<script setup lang="ts">
import { ref } from 'vue'

import Specimen from './Specimen.vue'
import { photos } from './support'

defineProps<{ preview?: boolean }>()

const promo = [
  {
    eyebrow: 'Новое',
    title: 'Тариф «Команда»',
    text: 'До 25 мест, общие папки и роли — 4 800 ₽ в месяц.',
    surface: 'bg-[var(--gr-accent)] text-[var(--gr-accent-fg)]',
  },
  {
    eyebrow: 'Отчёты',
    title: 'Итоги месяца за минуту',
    text: 'Выручка, возвраты и средний чек — одним письмом 1-го числа.',
    surface: 'bg-[var(--gr-success-light)] text-[var(--gr-success-text)]',
  },
  {
    eyebrow: 'Интеграции',
    title: 'Счета уходят в бухгалтерию сами',
    text: 'Подключите «Лён Учёт» — и закрывающие документы перестанут теряться.',
    surface: 'bg-[var(--gr-info-light)] text-[var(--gr-info-text)]',
  },
  {
    eyebrow: 'Скоро',
    title: 'Приложение для телефона',
    text: 'Задачи, согласования и уведомления — там, где вы.',
    surface: 'bg-[var(--gr-warning-light)] text-[var(--gr-warning-text)]',
  },
]
const previewSlide = ref(0)
const slide = ref(0)
const photo = ref(1)

const reviews = [
  { quote: 'Сметы теперь собираются за вечер, а не за неделю.', author: 'Анна Соколова, арт-директор' },
  { quote: 'Клиент видит согласования сам — писем стало вдвое меньше.', author: 'Иван Петров, менеджер проектов' },
  { quote: 'Отчёт 1-го числа читаю с телефона ещё до работы.', author: 'Мария Ким, основатель студии' },
]
const review = ref(0)

const months = [
  { label: 'Август', revenue: '1,2 млн ₽', note: '+8% к июлю' },
  { label: 'Сентябрь', revenue: '1,4 млн ₽', note: '+17% к августу' },
  { label: 'Октябрь', revenue: '1,3 млн ₽', note: '−7% к сентябрю' },
]
const month = ref(2)
</script>

<template>
  <!-- Карточка каталога и «Темы рядом»: одно состояние, ничего не открыто. -->
  <!-- `isolate`: стрелки ленты лежат на своём слое, и без контекста наложения прошли бы поверх липких вкладок страницы. -->
  <div v-if="preview" class="isolate flex w-full flex-col gap-3">
    <GrCarousel v-model="previewSlide" aria-label="Новое в Студии">
      <GrCarouselSlide v-for="item in promo" :key="item.title" :label="item.title">
        <div class="flex h-[64px] flex-col justify-center gap-0.5 rounded-[var(--gr-radius-lg)] px-12" :class="item.surface">
          <span class="text-[length:var(--gr-text-2xs)] font-600 leading-[var(--gr-leading-2xs)]">
            {{ item.eyebrow }}
          </span>
          <span class="truncate text-[length:var(--gr-text-sm)] font-600 leading-[var(--gr-leading-sm)]">
            {{ item.title }}
          </span>
        </div>
      </GrCarouselSlide>
    </GrCarousel>
  </div>
  <div v-else class="isolate grid gap-x-8 gap-y-10 lg:grid-cols-2">
    <Specimen title="Кадры — блоки разметки" note="точки и стрелки; кольцо замыкается без отката через всю ленту">
      <GrCarousel v-model="slide" aria-label="Новое в Студии">
        <GrCarouselSlide v-for="item in promo" :key="item.title" :label="item.title">
          <div class="flex h-[200px] flex-col justify-end gap-1.5 rounded-[var(--gr-radius-lg)] px-14 py-6" :class="item.surface">
            <span class="text-[length:var(--gr-text-xs)] font-600 leading-[var(--gr-leading-xs)]">
              {{ item.eyebrow }}
            </span>
            <span class="text-[length:var(--gr-text-xl)] font-600 leading-[var(--gr-leading-xl)]">
              {{ item.title }}
            </span>
            <span class="max-w-[42ch] text-[length:var(--gr-text-sm)] leading-[var(--gr-leading-sm)]">
              {{ item.text }}
            </span>
          </div>
        </GrCarouselSlide>
      </GrCarousel>
    </Specimen>

    <Specimen title="Галерея с миниатюрами" note="полоса миниатюр показывает, сколько ещё, и ведёт сразу к нужному снимку">
      <GrCarousel v-model="photo" indicators="thumbnails" aria-label="Снимки объекта">
        <GrCarouselSlide v-for="item in photos" :key="item.src" :label="item.alt" :thumbnail="item.src">
          <img :src="item.src" :alt="item.alt" class="block h-[200px] w-full rounded-[var(--gr-radius-lg)] object-cover">
        </GrCarouselSlide>
      </GrCarousel>
    </Specimen>

    <Specimen title="Показ сам по себе" note="пауза — под курсором и в фоновой вкладке; фокус внутри останавливает; кнопка паузы есть всегда">
      <GrCarousel v-model="review" autoplay :autoplay-interval="5000" tone="neutral" aria-label="Отзывы клиентов">
        <GrCarouselSlide v-for="item in reviews" :key="item.author" :label="item.author">
          <figure class="flex h-[160px] flex-col justify-center gap-3 rounded-[var(--gr-radius-lg)] border border-[var(--gr-brd)] bg-[var(--gr-card)] px-14 py-5">
            <blockquote class="text-[length:var(--gr-text-lg)] font-500 leading-[var(--gr-leading-lg)]">
              «{{ item.quote }}»
            </blockquote>
            <figcaption class="text-[length:var(--gr-text-sm)] leading-[var(--gr-leading-sm)] text-[var(--gr-muted-fg)]">
              {{ item.author }}
            </figcaption>
          </figure>
        </GrCarouselSlide>
      </GrCarousel>
    </Specimen>

    <Specimen title="Вертикальная лента" note="стрелки — на оси движения; высоту вьюпорта задаёт приложение">
      <GrCarousel v-model="month" orientation="vertical" :loop="false" aria-label="Выручка по месяцам" class="h-[200px]">
        <GrCarouselSlide v-for="item in months" :key="item.label" :label="item.label">
          <div class="flex h-full flex-col justify-center gap-1 rounded-[var(--gr-radius-lg)] bg-[var(--gr-muted)] px-6 py-5">
            <span class="text-[length:var(--gr-text-sm)] leading-[var(--gr-leading-sm)] text-[var(--gr-muted-fg)]">
              {{ item.label }}
            </span>
            <span class="text-[length:var(--gr-text-2xl)] font-600 leading-[var(--gr-leading-tight)]">
              {{ item.revenue }}
            </span>
            <span class="text-[length:var(--gr-text-sm)] leading-[var(--gr-leading-sm)]">
              {{ item.note }}
            </span>
          </div>
        </GrCarouselSlide>
      </GrCarousel>
    </Specimen>
  </div>
</template>
