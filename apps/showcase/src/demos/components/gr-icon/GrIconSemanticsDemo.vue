<script setup lang="ts">
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
        Тон из палитры (`-text`-роли токенов)
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
</template>
