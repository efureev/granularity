import type { ShowcaseComponentExampleDoc } from '../types'

export const grIconExamples: ShowcaseComponentExampleDoc[] = [
  {
    id: 'icon-size-scale',
    title: 'Size scale',
    description: 'На странице важно показать, как `GrIcon` ведёт себя на разных размерах и почему он удобен как sizing-wrapper вокруг inline svg.',
    status: 'ready',
    previewKey: 'gr-icon-size-scale',
    code: `<script setup lang="ts">
import { GrIcon } from '@feugene/granularity'

const sizes = [12, 16, 20, 28, 36]
</script>

<template>
  <div class="flex flex-wrap items-end gap-5">
    <GrIcon v-for="size in sizes" :key="size" :size="size">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" class="h-full w-full">
        <circle cx="12" cy="12" r="8" />
      </svg>
    </GrIcon>
  </div>
</template>`,
  },
  {
    id: 'icon-inline-copy',
    title: 'Inline copy and link helpers',
    description: 'Показываем, что `GrIcon` можно встраивать в copy blocks, helper rows и рядом с `GrLink`, не ломая baseline текста.',
    status: 'ready',
    previewKey: 'gr-icon-inline-copy',
    code: `<script setup lang="ts">
import { GrIcon, GrLink } from '@feugene/granularity'
</script>

<template>
  <div class="grid gap-3">
    <div class="flex items-start gap-3">
      <GrIcon size="md">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" class="h-full w-full">
          <path d="M4 12h16" />
          <path d="m12 5 7 7-7 7" />
        </svg>
      </GrIcon>
      <span class="text-sm">Sync billing status every 5 minutes</span>
    </div>

    <GrLink href="https://example.com" external>
      Explore icon usage inside inline content
    </GrLink>
  </div>
</template>`,
  },
  {
    id: 'icon-status-card',
    title: 'Status cards and KPI tiles',
    description: 'Отдельный сценарий для dashboards: `GrIcon` помогает собирать status cards и KPI summaries с предсказуемым tone/size contract.',
    status: 'ready',
    previewKey: 'gr-icon-status-card',
    code: `<script setup lang="ts">
import { GrBadge, GrCard, GrIcon } from '@feugene/granularity'
</script>

<template>
  <GrCard class="p-4">
    <div class="flex items-center justify-between gap-3">
      <GrIcon size="lg" class="text-emerald-500">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" class="h-full w-full">
          <circle cx="12" cy="12" r="8" />
          <path d="m9.5 12 1.7 1.8 3.5-4.1" />
        </svg>
      </GrIcon>
      <GrBadge size="sm" tone="secondary">snapshot</GrBadge>
    </div>
  </GrCard>
</template>`,
  },
  {
    id: 'icon-semantics',
    title: 'Decorative vs meaningful, tone and spin',
    description: 'Иконка декоративна по умолчанию — компонент сам ставит `aria-hidden`. Значимой её делает `label`: появляются `role="img"` и имя. `tone` красит токеном текста (насыщенный тон как цвет текста в пакете запрещён — контраст падает до 2:1), `spin` крутит спиннер и сам замирает при `prefers-reduced-motion`.',
    status: 'ready',
    previewKey: 'gr-icon-semantics',
    code: `<script setup lang="ts">
import { GrIcon, GR_TONES } from '@feugene/granularity'
</script>

<template>
  <div class="grid gap-5">
    <div class="grid gap-2">
      <div class="text-xs text-[var(--gr-muted-fg)]">
        Декоративная и значимая иконка
      </div>
      <div class="flex flex-wrap items-center gap-5 text-sm">
        <!-- Рядом есть текст — иконка декоративна, компонент скрывает её сам. -->
        <span class="inline-flex items-center gap-2">
          <GrIcon>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
              <path d="m5 13 4 4L19 7" />
            </svg>
          </GrIcon>
          Сохранено
        </span>

        <!-- Текста рядом нет: смысл несёт сама иконка, значит ей нужно имя. -->
        <GrIcon label="Проверено" tone="success">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
            <path d="m5 13 4 4L19 7" />
          </svg>
        </GrIcon>
      </div>
    </div>

    <div class="grid gap-2">
      <div class="text-xs text-[var(--gr-muted-fg)]">
        Тон из палитры (\`-text\`-роли токенов)
      </div>
      <div class="flex flex-wrap items-center gap-4">
        <GrIcon v-for="tone in GR_TONES" :key="tone" :tone="tone" size="lg" :label="tone">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
            <circle cx="12" cy="12" r="9" />
            <path d="M12 8v5" />
            <path d="M12 16h.01" />
          </svg>
        </GrIcon>
      </div>
    </div>

    <div class="grid gap-2">
      <div class="text-xs text-[var(--gr-muted-fg)]">
        Вращение
      </div>
      <span class="inline-flex items-center gap-2 text-sm">
        <GrIcon spin tone="primary">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
            <path d="M21 12a9 9 0 1 1-6.2-8.6" />
          </svg>
        </GrIcon>
        Загружаем…
      </span>
    </div>
  </div>
</template>`,
  },
]
