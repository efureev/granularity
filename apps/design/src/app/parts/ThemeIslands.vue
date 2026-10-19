<script setup lang="ts">
import type { GrThemeName } from '@feugene/granularity/tokens'

import { THEMES } from '../tokens'

/**
 * Одно содержимое в обеих темах рядом. Темы пакета объявлены атрибутом
 * `[data-theme]` и работают от любого контейнера, поэтому остров светлой темы
 * честно светлый и внутри тёмной страницы.
 */
defineSlots<{ default: (props: { theme: GrThemeName }) => unknown }>()
</script>

<template>
  <div class="grid gap-4 xl:grid-cols-2">
    <div
      v-for="theme in THEMES"
      :key="theme.id"
      :data-theme="theme.id"
      class="flex min-w-0 flex-col gap-4 rounded-[var(--gr-radius-lg)] border border-[var(--gr-brd)] bg-[var(--gr-bg)] p-4 text-[var(--gr-fg)] lg:p-5"
    >
      <p class="text-[length:var(--gr-text-xs)] font-600 leading-[var(--gr-leading-xs)] text-[var(--gr-muted-fg)]">
        {{ theme.label }} тема
      </p>
      <slot :theme="theme.id" />
    </div>
  </div>
</template>
